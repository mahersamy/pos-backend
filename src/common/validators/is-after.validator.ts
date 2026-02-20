import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'isAfter', async: false })
export class IsAfterConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: Date, args: ValidationArguments) {
    console.log("propertyValue",propertyValue);
    console.log("args",args);
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object)[relatedPropertyName];

    // Check if both values are valid dates
    if (!(propertyValue instanceof Date) || !(relatedValue instanceof Date)) {
      return false;
    }

    return propertyValue.getTime() > relatedValue.getTime();
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} must be after ${relatedPropertyName}`;
  }
}

export function IsAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsAfterConstraint,
    });
  };
}
