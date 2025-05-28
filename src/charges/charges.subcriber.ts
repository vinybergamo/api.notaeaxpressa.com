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
import { Charge } from './entities/charge.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
export class ChargesSubscriber implements EntitySubscriberInterface<Charge> {
  constructor(
    datasource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    datasource.subscribers.push(this);
  }

  listenTo() {
    return Charge;
  }

  afterInsert(event: InsertEvent<Charge>) {
    if (event.entity) {
      this.eventEmitter.emit('charges.create', event.entity);
    }
  }

  afterUpdate(event: UpdateEvent<Charge>): Promise<any> | void {
    if (event.entity) {
      this.eventEmitter.emit('charges.update', event.entity);
    }
  }

  afterRemove(event: RemoveEvent<Charge>): Promise<any> | void {
    if (event.entity) {
      this.eventEmitter.emit('charges.delete', event.entity);
    }
  }

  afterSoftRemove(event: SoftRemoveEvent<Charge>): Promise<any> | void {
    if (event.entity) {
      this.eventEmitter.emit('charges.delete', event.entity);
    }
  }

  afterRecover(event: RecoverEvent<Charge>): Promise<any> | void {
    if (event.entity) {
      this.eventEmitter.emit('charges.recover', event.entity);
    }
  }
}
