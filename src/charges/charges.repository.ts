import { Injectable } from '@nestjs/common';
import { Charge } from './entities/charge.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/database/base-repository';

@Injectable()
export class ChargesRepository extends BaseRepository<Charge> {
  constructor(
    @InjectRepository(Charge)
    private readonly repo: Repository<Charge>,
  ) {
    super(repo);
  }
}
