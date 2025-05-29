import { NotFoundException } from '@nestjs/common';
import { FindCriteria } from 'src/types/find-criteria.interface';
import {
  FindManyOptions,
  FindOneOptions,
  RepositoryFactory,
} from 'src/types/repository-factory';
import { whereId } from 'src/utils/where-id';
import { Repository, DeepPartial } from 'typeorm';
import { BaseSchema } from './base-schema';

export class BaseRepository<T extends BaseSchema>
  implements RepositoryFactory<T>
{
  constructor(
    private readonly repository: Repository<T>,
    private entity?: string,
  ) {
    this.entity = entity || repository.metadata.tableName;
    this.entity = this.entity.replace(/_/g, ' ').toUpperCase();
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async find(
    criteria: FindCriteria<T>,
    options?: FindManyOptions<T>,
  ): Promise<T[]> {
    return this.repository.find({ where: criteria, ...options });
  }

  async findOne(
    criteria: FindCriteria<T>,
    options?: FindOneOptions<T>,
  ): Promise<T> {
    return this.repository.findOne({ where: criteria, ...options });
  }

  async findById(id: Id, options?: FindOneOptions<T>): Promise<T> {
    return this.findOne(whereId(id), options);
  }

  async findOneOrFail(
    criteria: FindCriteria<T>,
    options?: FindOneOptions<T>,
  ): Promise<T> {
    const result = await this.findOne(criteria, options);

    if (!result) {
      throw new NotFoundException(`${this.entity}_NOT_FOUND`);
    }

    return result;
  }

  async findByIdOrFail(id: Id, options?: FindOneOptions<T>): Promise<T> {
    return this.findOneOrFail(whereId(id), options);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    await this.repository.save(entity);
    return entity;
  }

  async count(
    criteria?: FindCriteria<T>,
    options?: FindManyOptions<T>,
  ): Promise<number> {
    return this.repository.count({ where: criteria, ...options });
  }

  async update(
    id: Id,
    data: DeepPartial<T>,
    options?: FindOneOptions<T>,
  ): Promise<T> {
    const entity = await this.findByIdOrFail(id, options);
    this.repository.merge(entity, data);
    await this.repository.save(entity);
    return entity;
  }

  async delete(id: Id): Promise<void> {
    const entity = await this.findByIdOrFail(id);
    await this.repository.softRemove(entity);
  }

  async restore(id: Id): Promise<void> {
    const entity = await this.findByIdOrFail(id, { withDeleted: true });
    await this.repository.restore(entity.id);
  }
}
