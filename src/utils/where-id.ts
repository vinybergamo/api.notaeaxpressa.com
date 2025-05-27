import { isUUID } from 'class-validator';

type WhereId =
  | {
      uuid: string;
    }
  | { id: number };

export function whereId(id: string | number): any {
  if (isUUID(id) && typeof id === 'string') return { uuid: id };
  return { id: Number(id) };
}
