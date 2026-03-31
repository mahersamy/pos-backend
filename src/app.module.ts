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
} from "./Modules/feature.modules";
import { ConfigModule } from "@nestjs/config";

import { ScheduleModule } from "@nestjs/schedule";

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
    NotificationModule,
    ScheduleModule.forRoot(),

    // Config
    ConfigModule.forRoot({
      isGlobal: true, // makes it available app-wide (no need to import in every module)
      envFilePath: ".env", // default, can specify other paths
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
