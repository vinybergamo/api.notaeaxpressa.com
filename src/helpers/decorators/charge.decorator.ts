import { applyDecorators } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OnEventOptions } from '@nestjs/event-emitter/dist/interfaces';

export const OnChargePaid = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('charges.paid', options));

export const OnChargeCompleted = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('charges.completed', options));

export const OnChargeFailed = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('charges.failed', options));

export const OnChargeRefunded = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('charges.refunded', options));

export const OnChargeDelete = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('charges.delete', options));

export const OnChargeCreate = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('charges.create', options));

export const OnChargeUpdate = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('charges.update', options));

export const OnChargeRecover = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('charges.recover', options));

export const OnchargeView = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('charges.view', options));

export const OnChargePaymentMethodUpdate = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('charges.paymentMethod.update', options));
