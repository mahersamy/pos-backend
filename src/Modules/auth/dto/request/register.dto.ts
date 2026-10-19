import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { IsMatchConstraint } from '../../../../common/validators/is-match.constraint';

export class RegisterBodyDto {
  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString({ message: 'name must be a string' })
  @MinLength(3, { message: 'name must be at least 3 characters long' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString({ message: 'name must be a string' })
  @MinLength(3, { message: 'name must be at least 3 characters long' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Pass@1234', description: 'Secure password' })
  @IsNotEmpty()
  @IsStrongPassword({}, { message: 'Password is too weak' })
  password: string;

  @ApiProperty({ example: 'Pass@1234', description: 'Confirm password' })
  @Validate(IsMatchConstraint)
  confirmPassword: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '123 Main St', required: false, description: 'Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 25, description: 'Age' })
  @Min(14, { message: 'age must be at least 14' })
  age: number;
}
