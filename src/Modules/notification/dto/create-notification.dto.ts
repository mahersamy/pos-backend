import { IsEnum, IsMongoId, IsNotEmpty, IsObject, IsString, ValidateIf } from 'class-validator';
import { NotificationChannel, NotificationType } from '../model/notification.model';
import { Types } from 'mongoose';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;


  @IsObject()
  @IsNotEmpty()
  metadata: any;

  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  channel: NotificationChannel;


  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ValidateIf((obj) => obj.channel === NotificationChannel.PUSH)
  @IsNotEmpty()
  @IsMongoId()
  receiverId: Types.ObjectId;
}
