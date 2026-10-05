import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CloudinaryProvider } from "./common/services/cloudinary/cloudinary.provider";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import {
  LoggerMiddleware,
  TimeoutInterceptor,
  UnifiedResponseInterceptor,
  AuditLogInterceptor,
  GlobalExceptionFilter,
} from "./common";
import { GlobalModule } from "./Modules/global.module";
import {
  AuthModule,
  UserModule,
  StaffModule,
  ReservationModule,
  InventoryModule,
  DashboardModule,
  AuditLogModule,
  NotificationModule,
  MenuModule,
} from "./Modules/feature.modules";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from "./common/database/database.module";
import { AppCacheModule } from "./common/cache/cache.module";
import { validate } from "./common/Config/env.validation";

@Module({
  imports: [
    GlobalModule,
    AuthModule,
    UserModule,
    StaffModule,
    ReservationModule,
    InventoryModule,
    DashboardModule,
    AuditLogModule,
    MenuModule,
    NotificationModule,
    ScheduleModule.forRoot(),

    // Rate-limiting
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 5  },  // 5 req / second
      { name: 'medium', ttl: 10000, limit: 20 },  // 20 req / 10 s
      { name: 'long',   ttl: 60000, limit: 60 },  // 60 req / minute
    ]),
    EventEmitterModule.forRoot(),

    // Config
    ConfigModule.forRoot({
      isGlobal: true, // makes it available app-wide (no need to import in every module)
      envFilePath: ".env", // default, can specify other paths
      validate: validate,
    }),

    // Database
    DatabaseModule,

    // Cache
    AppCacheModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },

    // Throttle guard (global – protects all routes)
    { provide: APP_GUARD, useClass: ThrottlerGuard },

    // Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: UnifiedResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },

    // Cloudinary
    CloudinaryProvider,
  ],
})
export class AppModule {
  // logger middleware
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
