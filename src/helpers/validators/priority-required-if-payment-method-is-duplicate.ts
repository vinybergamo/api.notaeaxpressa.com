import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PaymentMethodDto } from '@/charges/dto/payment-methods';

@ValidatorConstraint({
  name: 'PriorityRequiredIfDuplicateMethod',
  async: false,
})
export class PriorityRequiredIfDuplicateMethodConstraint
  implements ValidatorConstraintInterface
{
  validate(paymentMethods: PaymentMethodDto[] | undefined): boolean {
    if (!paymentMethods || paymentMethods.length === 0) {
      return true; // No payment methods, no duplicates
    }
    const methodsCount = new Map<string, number>();

    for (const item of paymentMethods) {
      methodsCount.set(item.method, (methodsCount.get(item.method) || 0) + 1);
    }

    for (const [method, count] of methodsCount.entries()) {
      if (count > 1) {
        const filtered = paymentMethods.filter((pm) => pm.method === method);
        if (filtered.some((pm) => typeof pm.priority !== 'number')) {
          return false;
        }
      }
    }

    return true;
  }

  defaultMessage() {
    return 'Priority in paymentMethods is required if there are duplicate payment methods.';
  }
}
