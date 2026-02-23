import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { IsTimeFormat } from '../../../common';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum ReservationTitle {
  MR = 'Mr',
  MS = 'Ms',
}

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  tableNumber: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  paxNumber: number;

  @IsDateString()
  reservationDate: string;

  @IsString()
  @IsNotEmpty()
  @IsTimeFormat()
  reservationTime: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  depositFee: number;

  @IsEnum(ReservationStatus, {
    message: 'Status must be pending, confirmed, or cancelled',
  })
  @IsOptional()
  status?: string;

  @IsEnum(ReservationTitle, { message: 'Title must be Mr or Ms' })
  title: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  email?: string;
}
