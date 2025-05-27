import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RecoverEvent,
  RemoveEvent,
  SoftRemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { Customer } from './entities/customer.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
export class CustomersSubscriber
  implements EntitySubscriberInterface<Customer>
{
  constructor(
    datasource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    datasource.subscribers.push(this);
  }

  listenTo() {
    return Customer;
  }

  afterInsert(event: InsertEvent<Customer>) {
    if (event.entity) {
      this.eventEmitter.emit('customer.create', event.entity);
    }
  }

  afterUpdate(event: UpdateEvent<Customer>): Promise<any> | void {
    if (event.entity) {
      this.eventEmitter.emit('customer.update', event.entity);
    }
  }

  afterRemove(event: RemoveEvent<Customer>): Promise<any> | void {
    if (event.entity) {
      this.eventEmitter.emit('customer.delete', event.entity);
    }
  }

  afterSoftRemove(event: SoftRemoveEvent<Customer>): Promise<any> | void {
    if (event.entity) {
      this.eventEmitter.emit('customer.delete', event.entity);
    }
  }

  afterRecover(event: RecoverEvent<Customer>): Promise<any> | void {
    if (event.entity) {
      this.eventEmitter.emit('customer.recover', event.entity);
    }
  }
}
