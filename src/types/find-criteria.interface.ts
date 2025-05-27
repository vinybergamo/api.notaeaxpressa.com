import { FindOptionsWhere } from 'typeorm';

export type FindCriteria<T> = FindOptionsWhere<T> | FindOptionsWhere<T>[];
