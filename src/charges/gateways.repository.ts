import { Injectable } from '@nestjs/common';
import { Gateway } from './entities/gateway.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/database/base-repository';

@Injectable()
export class GatewaysRepository extends BaseRepository<Gateway> {
  constructor(
    @InjectRepository(Gateway)
    private readonly repo: Repository<Gateway>,
  ) {
    super(repo);
  }
}
