import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CloudinaryProvider } from "./common/services/cloudinary/cloudinary.provider";
import { APP_INTERCEPTOR } from "@nestjs/core";
import {
  LoggerMiddleware,
  TimeoutInterceptor,
  UnifiedResponseInterceptor,
  AuditLogInterceptor,
} from "./common";
import { MongooseModule } from "@nestjs/mongoose";
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
import { ConfigModule, ConfigService } from "@nestjs/config";

import { ScheduleModule } from "@nestjs/schedule";
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from "@nestjs/cache-manager";
import KeyvRedis, { Keyv } from "@keyv/redis";

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
    EventEmitterModule.forRoot(),

    // Config
    ConfigModule.forRoot({
      isGlobal: true, // makes it available app-wide (no need to import in every module)
      envFilePath: ".env", // default, can specify other paths
    }),

    // Cache
    CacheModule.registerAsync({
      isGlobal: true,

      inject: [ConfigService],

      useFactory: async (
        configService: ConfigService,
      ) => ({
        stores: [
          new Keyv({
            store: new KeyvRedis({
              username: configService.get<string>(
                'REDIS_USERNAME',
              ),

              password: configService.get<string>(
                'REDIS_PASSWORD',
              ),

              socket: {
                host: configService.get<string>(
                  'REDIS_HOST',
                ),

                port: Number(
                  configService.get<string>(
                    'REDIS_PORT',
                  ),
                ),
              },
            }),
          }),
        ],
      }),
    }),

    // Database
    MongooseModule.forRoot(process.env.DATABASE_URI as string),
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: UnifiedResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: AuditLogInterceptor,
    // },

    // Cloudinary
    CloudinaryProvider,
  ],
})
export class AppModule {
  // logger middelware
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
