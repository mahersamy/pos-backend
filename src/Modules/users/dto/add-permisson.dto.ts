import {
  IsBoolean,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Resource } from '../../../common/Enums';

/** Boolean flags for a single resource */
export class ActionPermissionsDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsBoolean()
  write?: boolean;

  @IsOptional()
  @IsBoolean()
  delete?: boolean;
}

/** Full permissions map sent in the request body */
export class UpdatePermissionsDto {
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => ActionPermissionsDto)
  permissions: Partial<Record<Resource, ActionPermissionsDto>>;
}

// Keep old name as alias so existing imports don't break
export { UpdatePermissionsDto as AddPermissonDto };
