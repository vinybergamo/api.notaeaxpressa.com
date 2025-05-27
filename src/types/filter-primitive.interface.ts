type Primitive =
  | string
  | number
  | bigint
  | boolean
  | Date
  | RegExp
  | null
  | undefined;

export type FilterPrimitive<T> = {
  [K in keyof T]: T[K] extends Primitive ? K : never;
}[keyof T];
