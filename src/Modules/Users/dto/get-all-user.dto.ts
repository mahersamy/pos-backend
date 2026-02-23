import { IsEnum, IsOptional } from 'class-validator';
import { GetAllDto } from '../../../common/Dto/get-all.dto';
import { Role } from '../../../common';

export class GetAllUserDto extends GetAllDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
