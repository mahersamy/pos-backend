import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Min, MinLength } from "class-validator";
import { Role } from "src/common";

export class CreateUserDto {
  @IsString({ message: 'name must be a string' })
  @MinLength(3, { message: 'name must be at least 3 characters long' })
  @IsNotEmpty()
  firstName: string;

  @IsString({ message: 'name must be a string' })
  @MinLength(3, { message: 'name must be at least 3 characters long' })
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

//   @Validate(IsMatchConstraint)
//   confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  profilePicture: string;

  @Min(14, { message: 'age must be at least 14' })
  age: number;
}