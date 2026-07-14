import { IsEnum, IsMongoId, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { AuditAction } from "../model/audit-log.model";
import { GetAllDto } from "src/common/Dto/get-all.dto";

export class GetAllAuditLogDto extends GetAllDto {
  @IsOptional()
  @IsEnum(AuditAction, {
    message: "action must be a valid AuditAction enum value",
  })
  action?: string;

  @IsOptional()
  @IsString()
  entity?: string;

  @IsOptional()
  @IsMongoId({ message: "performedBy must be a valid mongo id" })
  performedBy?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
