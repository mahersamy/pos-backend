import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../../../common';

export class ChangeRoleDto {
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
