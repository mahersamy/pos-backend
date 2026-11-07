/** TTL for the in-flight processing lock. Must exceed the longest possible request (TimeoutInterceptor = 20 s). */
export const IDEMPOTENCY_LOCK_TTL_MS = 30_000;

/** TTL for the stored result. Clients may replay within this window. */
export const IDEMPOTENCY_RESULT_TTL_MS = 24 * 60 * 60 * 1_000; // 24 h

/** Allowed characters for an Idempotency-Key header value. */
export const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

/** Redis key prefix – scoped to avoid collisions with other keys. */
export const IDEMPOTENCY_REDIS_PREFIX = 'idempotency';

