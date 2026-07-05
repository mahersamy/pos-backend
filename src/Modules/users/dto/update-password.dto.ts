import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { IsMatchConstraint } from '../../auth/auth.dto';

export class UpdatePasswordDto extends PickType(CreateUserDto, ['password'] as const) {
  @IsString()
  @IsNotEmpty()
  @Validate(IsMatchConstraint)
  confirmPassword: string;
}
