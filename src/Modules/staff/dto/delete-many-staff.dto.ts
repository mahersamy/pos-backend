import { IsArray, ArrayMinSize, IsMongoId } from 'class-validator';

export class DeleteManyStaffDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one ID is required' })
  @IsMongoId({ each: true })
  ids: string[];
}
