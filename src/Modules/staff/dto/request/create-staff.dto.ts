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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsTimeFormat, IsMinimumAge } from '../../../../common';

export class CreateStaffDto {
  @ApiProperty({ description: 'Full name of the staff member', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email is required' })
  email: string;

  @ApiProperty({ description: 'Position or job title', example: 'Manager' })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({ description: 'Phone number (11 characters)', example: '01000000000' })
  @IsNotEmpty()
  @IsString()
  @Length(11, 11, { message: 'Phone number must be exactly 11 characters' })
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Address of the staff member', example: '123 Main St' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Monthly salary', example: 5000 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  salary: number;

  @ApiProperty({ description: 'Date of birth', example: '1990-01-01T00:00:00.000Z' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  @Type(() => Date)
  @IsDate({ message: 'dateOfBirth must be a valid date instance (e.g. YYYY-MM-DD)' })
  @IsMinimumAge(18)
  dateOfBirth: Date;

  @ApiProperty({ description: 'Start shift time', example: '09:00' })
  @IsNotEmpty()
  @IsString()
  @IsTimeFormat()
  startShiftTiming: string;

  @ApiProperty({ description: 'End shift time', example: '17:00' })
  @IsNotEmpty()
  @IsString()
  @IsTimeFormat()
  endShiftTiming: string;

  @ApiPropertyOptional({ description: 'Additional details', example: 'Has extensive experience in hospitality' })
  @IsOptional()
  @IsString()
  details?: string;
}
