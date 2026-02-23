import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { GetAllDto } from '../../../common/Dto/get-all.dto';
import { ReservationStatus } from './create-reservation.dto';

export class GetAllReservationDto extends GetAllDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: string;
}
