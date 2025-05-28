import { applyDecorators } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OnEventOptions } from '@nestjs/event-emitter/dist/interfaces';

export const OnCustomerCreate = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('customers.create', options));

export const OnCustomerUpdate = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('customers.update', options));

export const OnCustomerDelete = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('customers.delete', options));

export const OnCustomerRecover = (options?: OnEventOptions) =>
  applyDecorators(OnEvent('customers.recover', options));
