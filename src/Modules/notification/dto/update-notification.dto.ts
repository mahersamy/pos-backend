import { Types } from 'mongoose';
import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';

export class MarkAsReadNotificationDto {

    @IsArray()
    @IsMongoId({ each: true })
    @IsNotEmpty()
    notificationIds: Types.ObjectId[];
}
