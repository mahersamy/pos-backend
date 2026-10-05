import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';

/**
 * IdempotencyInterceptor
 *
 * Enforces idempotency for mutating endpoints (e.g. POST /orders).
 *
 * Flow:
 *  1. Client sends `Idempotency-Key: <uuid>` header.
 *  2. Interceptor checks Redis:
 *     - HIT  → returns the cached response body immediately.
 *     - MISS → forwards the request, then caches the successful response.
 *
 * If Redis is unreachable all cache calls time out (CACHE_TIMEOUT_MS) and
 * the request is processed normally — no 408 cascade.
 */

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1_000; // 24 h
const LOCK_TTL_MS        = 30_000;                 // 30 s in-flight lock
const RESULT_PREFIX      = 'idempotency:result:';
const LOCK_PREFIX        = 'idempotency:lock:';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const idempotencyKey = (req.headers['idempotency-key'] as string | undefined)?.trim();

    // ── No key → pass through, no idempotency guarantee ──────────────────────
    if (!idempotencyKey) {
      return next.handle();
    }

    const resultKey = `${RESULT_PREFIX}${idempotencyKey}`;
    const lockKey   = `${LOCK_PREFIX}${idempotencyKey}`;

    // ── 1. Previously completed? Return cached response immediately ───────────
    const cached = await this.cacheManager.get(resultKey);

    if (cached != null) {
      this.logger.debug(`Idempotency HIT: ${idempotencyKey}`);
      res.setHeader('Idempotency-Replayed', 'true');
      return new Observable((sub) => { sub.next(cached); sub.complete(); });
    }

    // ── 2. Concurrent duplicate in-flight? ────────────────────────────────────
    const locked = await this.cacheManager.get(lockKey);
    if (locked) {
      throw new ConflictException(
        'A request with this Idempotency-Key is already being processed.',
      );
    }

    // ── 3. Acquire in-flight lock ─────────────────────────────────────────────
    await this.cacheManager.set(lockKey, '1', LOCK_TTL_MS);

    // ── 4. Process request, cache successful response ─────────────────────────
    return next.handle().pipe(
      tap({
        next: async (body) => {
          await this.cacheManager.set(resultKey, body, IDEMPOTENCY_TTL_MS);
          this.logger.debug(`Idempotency result cached: ${idempotencyKey}`);
          await this.cacheManager.del(lockKey);
        },
        error: async () => {
          // Release lock so client can retry
          await this.cacheManager.del(lockKey);
        },
      }),
    );
  }
}

