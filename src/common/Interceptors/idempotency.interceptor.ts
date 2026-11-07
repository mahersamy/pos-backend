/**
 * Re-export from the dedicated idempotency module so that existing imports
 * via `src/common` continue to work without changes.
 *
 * The canonical implementation lives at:
 *   src/common/idempotency/interceptors/idempotency.interceptor.ts
 */
export { IdempotencyInterceptor } from '../idempotency/interceptors/idempotency.interceptor';
