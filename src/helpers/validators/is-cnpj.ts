import { isCNPJ } from '@/utils/is-document';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsCNPJ(validationOptions?: ValidationOptions) {
  return function (obj: any, propertyName: string) {
    registerDecorator({
      name: 'isCNPJ',
      target: obj.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        defaultMessage: ({ property }) => `${property} must be a valid CNPJ`,
        validate(value: string) {
          return typeof value === 'string' && isCNPJ(value);
        },
      },
    });
  };
}
