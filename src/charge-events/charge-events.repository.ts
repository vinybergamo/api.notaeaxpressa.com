import { Injectable } from '@nestjs/common';
import { ChargeEvents } from './entities/charge-events.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/database/base-repository';

@Injectable()
export class ChargeEventsRepository extends BaseRepository<ChargeEvents> {
  constructor(
    @InjectRepository(ChargeEvents)
    private readonly repo: Repository<ChargeEvents>,
  ) {
    super(repo);
  }
}
