import { Injectable } from '@nestjs/common';
import { TokenBlackList } from './entities/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/database/base-repository';

@Injectable()
export class TokensBlackListsRepository extends BaseRepository<TokenBlackList> {
  constructor(
    @InjectRepository(TokenBlackList)
    private readonly repo: Repository<TokenBlackList>,
  ) {
    super(repo);
  }
}
