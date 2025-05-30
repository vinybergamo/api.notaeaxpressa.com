import { Injectable } from '@nestjs/common';
import { Application } from './entities/application.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/database/base-repository';

@Injectable()
export class ApplicationsRepository extends BaseRepository<Application> {
  constructor(
    @InjectRepository(Application)
    private readonly repo: Repository<Application>,
  ) {
    super(repo);
  }
}
