import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../../common/Enums/role.enum';
import { UserStatus } from '../../enums/user-status.enum';
import { PaginatedResponseDto } from '../../../../common';

export class UserProfileResponseDto {
  @ApiProperty({ description: 'User ID', example: '60d21b4967d0d8992e610c85' })
  id: string;

  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  fullName: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ description: 'User role', enum: Role, example: Role.ADMIN })
  role: Role;

  @ApiProperty({ description: 'Granular resource permissions map', example: { staff: { read: true, write: false, delete: false } } })
  permissions: any;

  @ApiProperty({ description: 'User status', enum: UserStatus, example: UserStatus.ACTIVE })
  active: UserStatus;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: '60d21b4967d0d8992e610c85' })
  id: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  fullName: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ description: 'User role', enum: Role, example: Role.ADMIN })
  role: Role;

  @ApiProperty({ description: 'Age of the user', example: 25 })
  age: number;

  @ApiPropertyOptional({ description: 'Address', example: '123 Main St' })
  address?: string;

  @ApiPropertyOptional({ 
    description: 'Profile picture details', 
    example: { secure_url: 'https://res.cloudinary.com/.../image.jpg' } 
  })
  profilePicture?: {
    secure_url: string;
  };

  @ApiProperty({ description: 'User status', enum: UserStatus, example: UserStatus.ACTIVE })
  active: UserStatus;

  @ApiProperty({ description: 'Permissions' })
  permissions: any;

  @ApiProperty({ description: 'Record creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update date' })
  updatedAt: Date;
}

export class PaginatedUserResponseDto extends PaginatedResponseDto<UserResponseDto> {
  @ApiProperty({ type: [UserResponseDto], description: 'List of users' })
  data: UserResponseDto[];
}
