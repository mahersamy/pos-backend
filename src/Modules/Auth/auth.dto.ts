import {
  IsString,
  MinLength,
  IsEmail,
  IsNotEmpty,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
  IsEnum,
  IsOptional,
  Min,
  IsStrongPassword,
} from 'class-validator';

@ValidatorConstraint({ name: 'isMatch', async: false })
export class IsMatchConstraint implements ValidatorConstraintInterface {
  validate(
    value: string,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    return value === validationArguments?.object['password'];
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'password not match';
  }
}

export class RegisterBodyDto {
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

  @Validate(IsMatchConstraint)
  confirmPassword: string;

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

export class LoginBodyDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
