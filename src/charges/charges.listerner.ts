import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChargesListener {
  private readonly logger = new Logger(ChargesListener.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}
}
