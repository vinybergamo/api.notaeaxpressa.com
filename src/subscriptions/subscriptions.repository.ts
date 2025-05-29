import { Injectable } from '@nestjs/common';
import { Subscription } from './entities/subscription.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/database/base-repository';

@Injectable()
export class SubscriptionsRepository extends BaseRepository<Subscription> {
  constructor(
    @InjectRepository(Subscription)
    private readonly repo: Repository<Subscription>,
  ) {
    super(repo);
  }
}
