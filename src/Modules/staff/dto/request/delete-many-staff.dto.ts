import { IsArray, ArrayMinSize, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteManyStaffDto {
  @ApiProperty({ 
    description: 'Array of Staff MongoDB IDs to delete',
    example: ['60d21b4967d0d8992e610c85', '60d21b4967d0d8992e610c86'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one ID is required' })
  @IsMongoId({ each: true })
  ids: string[];
}
