import { IsEnum, IsOptional } from 'class-validator';
import { GetAllDto } from 'src/common/Dto/get-all.dto';
import { Role } from 'src/common';

export class GetAllUserDto extends GetAllDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
