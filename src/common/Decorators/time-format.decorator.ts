import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isTimeFormat', async: false })
export class IsTimeFormatConstraint implements ValidatorConstraintInterface {
  validate(time: string) {
    if (typeof time !== 'string') return false;

    // Matches '03:18 PM', '03:18 AM', '3:18 pm', etc.
    const timeWithMinutesRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s*[aApP][mM]$/;

    // Matches '9am', '6pm', '12AM', etc.
    const timeHourlyRegex = /^(0?[1-9]|1[0-2])\s*[aApP][mM]$/;

    return timeWithMinutesRegex.test(time) || timeHourlyRegex.test(time);
  }

  defaultMessage() {
    return 'Time must be in a valid format like "03:18 PM", "9am", or "6pm".';
  }
}

export function IsTimeFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTimeFormatConstraint,
    });
  };
}
