import { IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Resource, Action } from '../../../common/Enums';

class PermissionItemDto {
  @IsEnum(Resource)
  resource: Resource;

  @IsArray()
  @IsEnum(Action, { each: true })
  actions: Action[];
}

export class AddPermissonDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionItemDto)
  permissions: PermissionItemDto[];
}
