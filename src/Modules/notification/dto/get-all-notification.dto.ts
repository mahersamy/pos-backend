import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { NotificationStatus } from "src/DB/Models/notification.model";

export class GetNotificationsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  // Cursor-based (recommended)
  @IsOptional()
  @IsString()
  cursor?: string; // last notification _id


  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

}