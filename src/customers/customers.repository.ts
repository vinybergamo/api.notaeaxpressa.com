import { Injectable } from '@nestjs/common';
import { Customer } from './entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/database/base-repository';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { Column } from 'nestjs-paginate/lib/helper';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CustomersRepository extends BaseRepository<Customer> {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
    private readonly emitter: EventEmitter2,
  ) {
    super(repo);
  }

  async list(
    userId: number,
    paginateQuery: PaginateQuery,
    relations?: string[],
  ) {
    const keys = Object.keys(
      this.repo.metadata.propertiesMap,
    ) as Column<Customer>[];

    const relationsKeys = relations?.filter((relation) =>
      this.repo.metadata.relations.find((rel) => rel.propertyName === relation),
    );

    if (relationsKeys) {
      relations = relationsKeys;
    } else {
      relations = [];
    }

    return paginate(paginateQuery, this.repo, {
      where: {
        user: {
          id: userId,
        },
      },
      sortableColumns: keys,
      defaultLimit: 10,
      maxLimit: 100,
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: this.repo.metadata.propertiesMap,
      searchableColumns: [
        'index',
        'email',
        'name',
        'document',
        'phone',
        'correlationID',
      ],
      relations,
    });
  }
}
