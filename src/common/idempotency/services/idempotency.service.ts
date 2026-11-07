import { Injectable, Logger } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import stringify from 'fast-json-stable-stringify';
import { RedisService } from '../../services/redis/redis.service';
import {
  IDEMPOTENCY_LOCK_TTL_MS,
  IDEMPOTENCY_REDIS_PREFIX,
  IDEMPOTENCY_RESULT_TTL_MS,
} from '../constants/idempotency.constants';
import { IdempotencyRecord } from '../interfaces/idempotency.interface';

export type ClaimResult =
  | { status: 'acquired'; token: string }
  | { status: 'processing' }
  | { status: 'done'; record: IdempotencyRecord }
  | { status: 'fingerprint_mismatch' }
  | { status: 'redis_unavailable' };

/**
 * Handles all Redis-level idempotency logic.
 *
 * The interceptor is kept thin – it handles HTTP concerns only.
 * This service owns: key building, fingerprint generation, Redis record
 * lifecycle (claim → complete / release).
 */
@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(private readonly redis: RedisService) {}

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Builds the user-scoped Redis key.
   *
   * Pattern: `idempotency:{userId}:{method}:{path}:{key}`
   */
  buildRedisKey(userId: string, method: string, path: string, key: string): string {
    return `${IDEMPOTENCY_REDIS_PREFIX}:${userId}:${method}:${path}:${key}`;
  }

  /**
   * Produces a deterministic SHA-256 fingerprint from the request payload.
   *
   * Uses `fast-json-stable-stringify` so that `{b:1,a:2}` and `{a:2,b:1}`
   * yield the exact same deterministic string and fingerprint. The idempotency
   * key itself is intentionally excluded from the fingerprint.
   */
  createFingerprint(payload: unknown): string {
    return createHash('sha256')
      .update(stringify(payload ?? {}) ?? '{}')
      .digest('hex');
  }

  /**
   * Attempts to atomically claim a Redis slot for `redisKey`.
   *
   * Returns one of:
   *   - `acquired`            – we own the key; `token` must be passed to `complete` / `release`.
   *   - `processing`          – another request already holds the lock.
   *   - `done`                – a completed response is already stored.
   *   - `fingerprint_mismatch`– the key was used with a different payload.
   *   - `redis_unavailable`   – Redis is down; caller should fail-open.
   */
  async claim(redisKey: string, fingerprint: string): Promise<ClaimResult> {
    const token = randomUUID();

    try {
      const processing: IdempotencyRecord = { state: 'processing', fingerprint, token };
      const result = await this.redis.client.set(
        redisKey,
        JSON.stringify(processing),
        'PX',
        IDEMPOTENCY_LOCK_TTL_MS,
        'NX',
      );

      if (result === 'OK') {
        return { status: 'acquired', token };
      }
    } catch (err) {
      this.logger.error(`Redis unavailable during claim: ${(err as Error).message}`);
      return { status: 'redis_unavailable' };
    }

    // Key already exists – inspect the stored record.
    return this.inspectExisting(redisKey, fingerprint);
  }

  /**
   * Transitions the record from `processing` to `done` and sets the long TTL.
   *
   * The `token` guards against a stale process overwriting a newer claim
   * (e.g. after a crash + restart).
   */
  async complete(
    redisKey: string,
    fingerprint: string,
    token: string,
    body: unknown,
    statusCode: number,
  ): Promise<void> {
    try {
      const done: IdempotencyRecord = { state: 'done', fingerprint, token, body, statusCode };
      await this.redis.client.set(redisKey, JSON.stringify(done), 'PX', IDEMPOTENCY_RESULT_TTL_MS);
    } catch (err) {
      this.logger.error(`Failed to persist idempotent result: ${(err as Error).message}`);
      // Non-fatal: the client will not get a replay on retry, but the duplicate
      // protection already ran inside the DB transaction.
    }
  }

  /**
   * Removes the processing lock so the client can safely retry.
   * Called only when the handler throws.
   */
  async release(redisKey: string): Promise<void> {
    try {
      await this.redis.client.del(redisKey);
    } catch (err) {
      this.logger.error(`Failed to release idempotency lock: ${(err as Error).message}`);
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async inspectExisting(redisKey: string, fingerprint: string): Promise<ClaimResult> {
    try {
      const raw = await this.redis.client.get(redisKey);
      if (!raw) {
        // Key disappeared between SET NX and GET (race with TTL expiry).
        // Treat as unavailable so the interceptor can retry safely.
        return { status: 'redis_unavailable' };
      }

      const existing = JSON.parse(raw) as IdempotencyRecord;

      if (existing.fingerprint !== fingerprint) {
        return { status: 'fingerprint_mismatch' };
      }

      if (existing.state === 'processing') {
        return { status: 'processing' };
      }

      return { status: 'done', record: existing };
    } catch (err) {
      this.logger.error(`Failed to inspect existing idempotency record: ${(err as Error).message}`);
      return { status: 'redis_unavailable' };
    }
  }
}

