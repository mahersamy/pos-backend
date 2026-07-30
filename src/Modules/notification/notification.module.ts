import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationRepository } from './repository/notification.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from './model/notification.model';
import { FirebaseService } from '../../common/services/firebase/firebase.service';
import { FcmToken, FcmTokenSchema } from '../users/models/fcm-token.model';
import { FcmTokenRepository } from '../users/repository/fcm-token.repository';

import { UserModule } from '../users/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: FcmToken.name, schema: FcmTokenSchema },
    ]),
    UserModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    FirebaseService,
    FcmTokenRepository,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
