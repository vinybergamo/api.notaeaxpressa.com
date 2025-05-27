import { applyDecorators } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OnEventOptions } from '@nestjs/event-emitter/dist/interfaces';

export const OnCustomerCreate = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('customer.create', options));

export const OnCustomerUpdate = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('customer.update', options));

export const OnCustomerDelete = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('customer.delete', options));
