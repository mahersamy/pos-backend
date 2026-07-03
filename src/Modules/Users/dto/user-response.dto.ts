import { Expose } from 'class-transformer';
import { Role } from 'src/common';
import type { PermissionsMap } from '../../../DB/Models/users.model';

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
}
