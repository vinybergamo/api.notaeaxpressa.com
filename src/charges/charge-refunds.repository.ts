import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/database/base-repository';
import { ChargeRefunds } from './entities/charge-refunds';

@Injectable()
export class ChargeRefundsRepository extends BaseRepository<ChargeRefunds> {
  constructor(
    @InjectRepository(ChargeRefunds)
    private readonly repo: Repository<ChargeRefunds>,
  ) {
    super(repo);
  }
}
