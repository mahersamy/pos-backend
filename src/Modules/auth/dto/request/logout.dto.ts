import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class LogoutBodyDto {
  @ApiProperty({
    description: 'Optional refresh token to revoke in addition to the access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @ApiProperty({
    description: 'If true, revokes all active sessions across all devices for this user',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  allDevices?: boolean;
}
