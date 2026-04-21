import { IsDate, IsNumber, IsOptional, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { GetAllDto } from 'src/common/Dto/get-all.dto';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'isGreaterThanStartSalary', async: false })
export class IsGreaterThanStartSalaryConstraint implements ValidatorConstraintInterface {
  validate(endSalary: number, args: ValidationArguments) {
    const object = args.object as any;
    // Skip validation or pass it if startSalary isn't provided (let other validators handle optionality)
    if (object.startSalary === undefined || endSalary === undefined) {
        return true; 
    }
    return endSalary > object.startSalary;
  }

  defaultMessage(args: ValidationArguments) {
    return 'End salary must be greater than start salary';
  }
}

export class GetAllStaffDto extends GetAllDto {
    
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    startSalary: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Validate(IsGreaterThanStartSalaryConstraint)
    endSalary: number;
}
