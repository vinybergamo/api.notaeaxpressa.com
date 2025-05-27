import {
  FindOneOptions as TypeOrmFindOneOptions,
  FindManyOptions as TypeOrmFindManyOptions,
  SaveOptions,
  DeepPartial,
} from 'typeorm';
import { FindCriteria } from './find-criteria.interface';
import { BaseSchema } from 'src/database/base-schema';

export type FindOneOptions<T> = Omit<TypeOrmFindOneOptions<T>, 'where'>;
export type FindManyOptions<T> = Omit<TypeOrmFindManyOptions<T>, 'where'>;

export interface RepositoryFactory<T extends BaseSchema> {
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  find(criteria: FindCriteria<T>, options?: FindManyOptions<T>): Promise<T[]>;
  findOne(criteria: FindCriteria<T>, options?: FindOneOptions<T>): Promise<T>;
  findById(id: Id, options?: FindOneOptions<T>): Promise<T>;
  findOneOrFail(
    criteria: FindCriteria<T>,
    options?: FindOneOptions<T>,
  ): Promise<T>;
  findByIdOrFail(id: Id, options?: FindOneOptions<T>): Promise<T>;
  create(entity: DeepPartial<T>, options?: SaveOptions): Promise<T>;
  update(id: Id, entity: T, options?: SaveOptions): Promise<T>;
  delete(id: Id): Promise<void>;
  restore(id: Id): Promise<void>;
}
