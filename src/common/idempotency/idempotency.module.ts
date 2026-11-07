import { Module } from '@nestjs/common';
import { IdempotencyService } from './services/idempotency.service';
import { IdempotencyInterceptor } from './interceptors/idempotency.interceptor';

/**
 * Provides `IdempotencyService` and `IdempotencyInterceptor` for injection.
 *
 * Import this module in any feature module that needs idempotency
 * (e.g. `OrdersModule`), or add it to `AppModule` for global availability.
 *
 * The underlying `RedisService` is provided globally by `RedisModule`,
 * so no need to import it here.
 */
@Module({
  providers: [IdempotencyService, IdempotencyInterceptor],
  exports: [IdempotencyService, IdempotencyInterceptor],
})
export class IdempotencyModule {}

