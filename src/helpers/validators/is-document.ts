import { isDocument } from '@/utils/is-document';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsDocument(validationOptions?: ValidationOptions) {
  return function (obj: any, propertyName: string) {
    registerDecorator({
      name: 'isDocument',
      target: obj.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        defaultMessage: () => 'Invalid document format',
        validate(value: string) {
          return typeof value === 'string' && isDocument(value);
        },
      },
    });
  };
}
