import { Injectable } from '@nestjs/common';
import { Project } from './entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/database/base-repository';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { Column } from 'nestjs-paginate/lib/helper';

@Injectable()
export class ProjectsRepository extends BaseRepository<Project> {
  constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
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
    ) as Column<Project>[];

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
        'id',
        'name',
        'description',
        'value',
        'logo',
        'website',
        'type',
        'index',
      ],
      relations,
    });
  }
}
