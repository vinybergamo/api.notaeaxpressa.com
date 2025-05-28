import { applyDecorators } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OnEventOptions } from '@nestjs/event-emitter/dist/interfaces';

export const OnChargePaid = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('charge.paid', options));

export const OnChargeCompleted = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('charge.completed', options));
