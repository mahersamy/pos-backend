import { IsDate, IsNumber, IsOptional } from 'class-validator';
import { GetAllDto } from 'src/common/Dto/get-all.dto';
import { Type } from 'class-transformer';

export class GetAllStaffDto extends GetAllDto {

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    salary: number;
}
