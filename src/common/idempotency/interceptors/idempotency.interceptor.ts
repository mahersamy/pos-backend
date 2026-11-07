import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import type { Request, Response } from 'express';
import { IdempotencyService } from '../services/idempotency.service';
import { IDEMPOTENCY_KEY_PATTERN } from '../constants/idempotency.constants';

/**
 * Enforces idempotency for mutating endpoints (applied per-route via `@UseInterceptors`).
 *
 * Responsibilities (HTTP layer only):
 *   - Read and validate the `Idempotency-Key` header.
 *   - Build a user-scoped cache key.
 *   - Delegate all Redis logic to `IdempotencyService`.
 *   - Return cached responses / surface appropriate error codes.
 *   - Pipe the handler result through `complete` / `release`.
 *
 * Failure modes:
 *   | Scenario                       | HTTP status |
 *   |-------------------------------|-------------|
 *   | Missing key                    | pass-through (no guarantee) |
 *   | Malformed key                  | 400         |
 *   | Key reused with different body | 422         |
 *   | Concurrent duplicate           | 409         |
 *   | Redis unavailable              | fail-open (logged) |
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(private readonly idempotencyService: IdempotencyService) { }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: { _id?: unknown } }>();
    const res = http.getResponse<Response>();

    // ── 1. Extract and validate the idempotency key ──────────────────────────
    const header = req.headers['idempotency-key'];
    const key = (Array.isArray(header) ? header[0] : header)?.trim();

    if (!key) {
      // No key → no idempotency guarantee. Keep as pass-through for now;
      // promote to 400 once all API consumers send the header reliably.
      return next.handle();
    }

    if (!IDEMPOTENCY_KEY_PATTERN.test(key)) {
      throw new BadRequestException(
        'Idempotency-Key must be 16–128 characters: letters, digits, "-" or "_"',
      );
    }

    // ── 2. Build scoped Redis key and fingerprint ────────────────────────────
    const userId = String(req.user?._id ?? 'anonymous');
    const redisKey = this.idempotencyService.buildRedisKey(
      userId,
      req.method,
      req.path,
      key,
    );
    const fingerprint = this.idempotencyService.createFingerprint(req.body ?? {});

    // ── 3. Atomically claim the slot ─────────────────────────────────────────
    const claim = await this.idempotencyService.claim(redisKey, fingerprint);

    switch (claim.status) {
      case 'redis_unavailable':
        this.logger.warn(`Idempotency skipped (Redis unavailable) for key=${key}`);
        return next.handle();

      case 'fingerprint_mismatch':
        throw new UnprocessableEntityException(
          'Idempotency-Key was already used with a different request payload',
        );

      case 'processing':
        throw new ConflictException(
          'A request with this Idempotency-Key is still being processed. Please retry shortly.',
        );

      case 'done': {
        this.logger.debug(`Idempotency replay for key=${key}`);
        res.setHeader('Idempotency-Replayed', 'true');
        return of(claim.record.body);
      }

      case 'acquired':
        break; // fall through to execute the handler
    }

    const { token } = claim;

    // ── 4. Run the handler; persist result or release lock ───────────────────
    return next.handle().pipe(
      mergeMap((body) => {
        const statusCode = res.statusCode ?? 200;
        return from(
          this.idempotencyService.complete(redisKey, fingerprint, token, body, statusCode),
        ).pipe(map(() => body));
      }),
      catchError((err: unknown) =>
        from(this.idempotencyService.release(redisKey)).pipe(
          mergeMap(() => throwError(() => err)),
        ),
      ),
    );
  }
}

