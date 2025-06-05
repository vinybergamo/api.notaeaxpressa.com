import { Charge } from '@/charges/entities/charge.entity';
import {
  OnChargeCompleted,
  OnChargeCreate,
} from '@/helpers/decorators/charge.decorator';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoicesService {
  @OnChargeCreate()
  async onChargeCreate(charge: Charge): Promise<void> {
    if (charge.issueInvoice !== 'BEFORE_PAYMENT') {
      return;
    }
  }

  @OnChargeCompleted()
  async onChargeCompleted(charge: Charge): Promise<void> {
    if (charge.issueInvoice !== 'AFTER_PAYMENT') {
      return;
    }
  }
}
