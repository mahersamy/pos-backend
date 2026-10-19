import { ApiProperty } from '@nestjs/swagger';

export class AuthMessageResponseDto {
  @ApiProperty({
    description: 'Response message status or description',
    example: 'Operation completed successfully',
  })
  message: string;
}
