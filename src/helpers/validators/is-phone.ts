import { registerDecorator, ValidationOptions } from 'class-validator';
import phone from 'phone';

export function IsPhone(validationOptions?: ValidationOptions) {
  return function (obj: any, propertyName: string) {
    registerDecorator({
      name: 'isPhone',
      target: obj.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        defaultMessage: () => 'Invalid phone number format',
        validate(value: string) {
          return typeof value === 'string' && phone(`+${value}`).isValid;
        },
      },
    });
  };
}
