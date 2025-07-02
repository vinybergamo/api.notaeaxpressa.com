import { Injectable } from '@nestjs/common';
import { Company } from './entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/database/base-repository';

@Injectable()
export class CompaniesRepository extends BaseRepository<Company> {
  constructor(
    @InjectRepository(Company)
    private readonly repo: Repository<Company>,
  ) {
    super(repo);
  }
}
