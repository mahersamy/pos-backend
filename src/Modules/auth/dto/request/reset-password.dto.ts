import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  Validate,
} from 'class-validator';
import { IsMatchConstraint } from '../../../../common/validators/is-match.constraint';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User registered email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: '6-digit OTP code received via email',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 characters long' })
  @IsNotEmpty({ message: 'OTP is required' })
  otp: string;

  @ApiProperty({
    description: 'New secure password',
    example: 'NewPass@1234',
  })
  @IsStrongPassword({}, { message: 'Password is too weak' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'NewPass@1234',
  })
  @Validate(IsMatchConstraint)
  @IsNotEmpty({ message: 'Confirm password is required' })
  confirmPassword: string;
}
