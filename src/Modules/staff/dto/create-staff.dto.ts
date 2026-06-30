import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsTimeFormat, IsMinimumAge } from '../../../common';

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
  @IsString()
  @Length(11, 11, { message: 'Phone number must be exactly 11 characters' })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  salary: number;

  @IsNotEmpty({ message: 'Date of birth is required' })
  @Type(() => Date)
  @IsDate({ message: 'dateOfBirth must be a valid date instance (e.g. YYYY-MM-DD)' })
  @IsMinimumAge(18)
  dateOfBirth: Date;

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
