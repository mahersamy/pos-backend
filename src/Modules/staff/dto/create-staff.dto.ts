import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsTimeFormat } from '../../../common';

export class CreateStaffDto {
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Email is required' })
  email: string;

  @IsNotEmpty()
  @IsString()
  position: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(18, { message: 'Age must be at least 18' })
  age: number;

  @IsNotEmpty()
  @IsString()
  @Length(15, 15, { message: 'Phone number must be exactly 15 characters' })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNotEmpty()
  @IsNumber()
  salary: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  DateOfBirth: Date;

  @IsNotEmpty()
  @IsString()
  @IsTimeFormat()
  startShiftTiming: string;

  @IsNotEmpty()
  @IsString()
  @IsTimeFormat()
  endShiftTiming: string;

  @IsOptional()
  @IsString()
  details?: string;
}
