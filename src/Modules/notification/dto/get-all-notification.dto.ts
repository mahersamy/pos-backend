import { Type } from "class-transformer";
import { IsEnum, IsInt, IsMongoId, IsOptional, ValidateIf, Min } from "class-validator";
import { NotificationStatus } from "../model/notification.model";

export class GetNotificationsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  // Cursor-based (recommended)
  @ValidateIf((object, value) => value !== undefined && value !== null && value !== '')
  @IsMongoId()
  cursor?: string; // last notification _id


  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

}