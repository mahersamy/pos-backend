import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationRepository } from '../../DB/Repository/notification.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from '../../DB/Models/notification.model';
import { FirebaseService } from '../../common/services/firebase/firebase.service';
import { FcmToken, FcmTokenSchema } from '../../DB/Models/fcm-token.model';
import { FcmTokenRepository } from '../../DB/Repository/fcm-token.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: FcmToken.name, schema: FcmTokenSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository, FirebaseService, FcmTokenRepository],
  exports: [NotificationService],
})
export class NotificationModule {}
