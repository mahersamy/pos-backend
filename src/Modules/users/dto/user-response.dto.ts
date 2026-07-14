import { Expose } from 'class-transformer';
import type { PermissionsMap } from '../models/users.model';
import { Role } from '../../../common/Enums/role.enum';
import { UserStatus } from '../enums/user-status.enum';

export class UserProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  role: Role;

  @Expose()
  permissions: PermissionsMap;

  @Expose()
  active: UserStatus;
}
