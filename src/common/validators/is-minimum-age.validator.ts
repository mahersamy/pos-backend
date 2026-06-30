import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'isMinimumAge', async: false })
export class IsMinimumAgeConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: Date, args: ValidationArguments) {
    if (!(propertyValue instanceof Date) || isNaN(propertyValue.getTime())) {
      return false;
    }

    const minAge = args.constraints[0];
    const today = new Date();
    const minDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());

    // propertyValue must be on or before the minDate
    return propertyValue.getTime() <= minDate.getTime();
  }

  defaultMessage(args: ValidationArguments) {
    const minAge = args.constraints[0];
    return `${args.property} must make the user at least ${minAge} years old`;
  }
}

export function IsMinimumAge(
  minAge: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [minAge],
      validator: IsMinimumAgeConstraint,
    });
  };
}
