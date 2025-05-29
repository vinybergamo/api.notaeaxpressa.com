import { Injectable } from '@nestjs/common';
import { Plan } from './entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/database/base-repository';

@Injectable()
export class PlansRepository extends BaseRepository<Plan> {
  constructor(
    @InjectRepository(Plan)
    private readonly repo: Repository<Plan>,
  ) {
    super(repo);
  }
}
