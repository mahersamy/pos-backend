import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginBodyDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'Pass@1234',
    description: 'Secure password of the user',
  })
  @IsStrongPassword({}, { message: 'Password is too weak' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
