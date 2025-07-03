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
    private readonly datasource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    datasource.subscribers.push(this);
  }

  listenTo() {
    return Charge;
  }

  async afterInsert(event: InsertEvent<Charge>) {
    if (event.entity) {
      const charge = await event.manager.findOne(Charge, {
        where: { id: event.entity.id },
        relations: this.relations,
      });
      this.eventEmitter.emit('charges.create', charge);
    }
  }

  async afterUpdate(event: UpdateEvent<Charge>) {
    if (event.entity) {
      const charge = await event.manager.findOne(Charge, {
        where: { id: event.entity.id },
        relations: this.relations,
      });
      this.eventEmitter.emit('charges.update', charge);
    }
  }

  async afterRemove(event: RemoveEvent<Charge>) {
    if (event.entity) {
      const charge = await event.manager.findOne(Charge, {
        where: { id: event.entity.id },
        withDeleted: true,
        relations: this.relations,
      });
      this.eventEmitter.emit('charges.delete', charge);
    }
  }

  async afterSoftRemove(event: SoftRemoveEvent<Charge>) {
    if (event.entity) {
      const charge = await event.manager.findOne(Charge, {
        where: { id: event.entity.id },
        withDeleted: true,
        relations: this.relations,
      });
      this.eventEmitter.emit('charges.delete', charge);
    }
  }

  async afterRecover(event: RecoverEvent<Charge>) {
    if (event.entity) {
      const charge = await event.manager.findOne(Charge, {
        where: { id: event.entity.id },
        withDeleted: true,
        relations: this.relations,
      });

      this.eventEmitter.emit('charges.recover', charge);
    }
  }

  private relations = this.datasource
    .getMetadata(Charge)
    .relations.map((relation) => relation.propertyName);
}
