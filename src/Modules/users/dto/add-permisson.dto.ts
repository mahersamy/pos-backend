import { IsBoolean, IsObject, IsOptional } from 'class-validator';
import { Transform, plainToInstance } from 'class-transformer';
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

/** Full permissions map sent in the request body.
 *
 *  NOTE: `permissions` is typed as `object` (not a class) so that
 *  ValidationPipe's `whitelist:true` does NOT strip the dynamic resource
 *  keys (orders, inventory, …) before @Transform can process them.
 */
export class UpdatePermissionsDto {
  /** Raw map – whitelist ignores its inner keys because the type is `object` */
  @IsObject()
  @Transform(({ value }) => {
    if (typeof value !== 'object' || value === null) return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        plainToInstance(ActionPermissionsDto, val),
      ]),
    ) as Partial<Record<Resource, ActionPermissionsDto>>;
  })
  permissions: Partial<Record<Resource, ActionPermissionsDto>>;
}

// Keep old name as alias so existing imports don't break
export { UpdatePermissionsDto as AddPermissonDto };
