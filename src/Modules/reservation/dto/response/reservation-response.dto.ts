import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../common';

export class ReservationResponseDto {
  @ApiProperty({ description: 'Reservation ID', example: '60d21b4967d0d8992e610c85' })
  id: string;

  @ApiProperty({ description: 'Table number reserved', example: 'T-10' })
  tableNumber: string;

  @ApiProperty({ description: 'Number of people (Pax)', example: 4 })
  paxNumber: number;

  @ApiProperty({ description: 'Date of reservation' })
  reservationDate: Date;

  @ApiProperty({ description: 'Time of reservation', example: '19:00' })
  reservationTime: string;

  @ApiProperty({ description: 'Deposit fee paid', example: 50 })
  depositFee: number;

  @ApiProperty({ description: 'Reservation status', example: 'pending', enum: ['pending', 'confirmed', 'cancelled'] })
  status: string;

  @ApiProperty({ description: 'Title of the guest', enum: ['Mr', 'Ms'] })
  title: string;

  @ApiProperty({ description: 'First name of the guest', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Last name of the guest', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'Phone number of the guest', example: '+123456789' })
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Email of the guest', example: 'john@example.com' })
  email?: string;

  @ApiProperty({ description: 'ID of the user who created the reservation' })
  createdBy: string;

  @ApiProperty({ description: 'Record creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update date' })
  updatedAt: Date;
}

export class PaginatedReservationResponseDto extends PaginatedResponseDto<ReservationResponseDto> {
  @ApiProperty({ type: [ReservationResponseDto], description: 'List of reservations' })
  data: ReservationResponseDto[];
}
