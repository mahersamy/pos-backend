import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common';

export class StaffResponseDto {
  @ApiProperty({ description: 'Staff ID', example: '60d21b4967d0d8992e610c85' })
  id: string;

  @ApiProperty({ description: 'Full name of the staff member', example: 'John Doe' })
  fullname: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ description: 'Position or job title', example: 'Manager' })
  position: string;

  @ApiProperty({ description: 'Phone number (11 characters)', example: '01000000000' })
  phoneNumber: string;

  @ApiProperty({ description: 'Date of birth', example: '1990-01-01T00:00:00.000Z' })
  dateOfBirth: Date;

  @ApiPropertyOptional({ description: 'Calculated age', example: 34 })
  age?: number;

  @ApiProperty({ description: 'Monthly salary', example: 5000 })
  salary: number;

  @ApiPropertyOptional({ 
    description: 'Profile picture details', 
    example: { secure_url: 'https://res.cloudinary.com/.../image.jpg' } 
  })
  profilePicture?: {
    secure_url: string;
  };

  @ApiProperty({ description: 'Start shift time', example: '09:00' })
  startShiftTiming: string;

  @ApiProperty({ description: 'End shift time', example: '17:00' })
  endShiftTiming: string;

  @ApiProperty({ description: 'Record creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update date' })
  updatedAt: Date;
}

export class PaginatedStaffResponseDto extends PaginatedResponseDto<StaffResponseDto> {
  @ApiProperty({ type: [StaffResponseDto], description: 'List of staff members' })
  data: StaffResponseDto[];
}
