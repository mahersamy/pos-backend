import { GetAllDto } from "../../../common/Dto/get-all.dto";
import { IsEnum, IsMongoId, IsOptional } from "class-validator";
import { NotificationChannel, NotificationStatus, NotificationType } from "../../../DB/Models/notification.model";
import { Types } from "mongoose";

export class GetAllNotification extends GetAllDto {
    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @IsOptional()
    @IsEnum(NotificationStatus)
    status?: NotificationStatus;

    @IsOptional()
    @IsEnum(NotificationChannel)
    channel?: NotificationChannel;

    @IsOptional()
    @IsMongoId()
    userId?: Types.ObjectId;
}