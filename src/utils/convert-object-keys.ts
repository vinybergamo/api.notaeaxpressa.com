interface Options {
  deleteNotMapped?: boolean;
  parser?: Record<string, (value: any) => any>;
  deleteNullValues?: boolean;
}

// Lista de níveis de profundidade (0 a 9)
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Recursivo até profundidade D
type DotNotationKeys<T, Prefix extends string = '', D extends number = 5> = [
  D,
] extends [never]
  ? never
  : {
      [K in keyof T & string]: T[K] extends object
        ? T[K] extends any[]
          ? `${Prefix}${K}`
          : `${Prefix}${K}` | DotNotationKeys<T[K], `${Prefix}${K}.`, Prev[D]>
        : `${Prefix}${K}`;
    }[keyof T & string];

// Extrai o tipo base do array
type ExtractBase<T> = T extends Array<infer U> ? U : T;

// Tipo final para mapper
type MapperType<T> = Partial<Record<DotNotationKeys<ExtractBase<T>>, string>>;

function setDeepValue(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
  });
}

export function convertObjectKeys<T = any>(
  obj: T,
  mapper: MapperType<T> | MapperType<T>[],
  options: Options = {},
): any {
  const {
    deleteNotMapped = false,
    parser = {},
    deleteNullValues = false,
  } = options;

  function recurse(current: any, path: string[] = []): any {
    if (deleteNullValues && current === null) {
      return undefined;
    }

    if (Array.isArray(current)) {
      return current.map((item) => recurse(item, path));
    }

    if (current !== null && typeof current === 'object') {
      const localResult: any = {};

      for (const [key, value] of Object.entries(current)) {
        const fullPath = [...path, key].join('.');
        const mappedPath = mapper[fullPath];

        const hasMappedChildren = Object.keys(mapper).some((k) =>
          k.startsWith(fullPath + '.'),
        );

        const hasParser = parser[fullPath] !== undefined;

        const shouldInclude =
          !!mappedPath ||
          (typeof value === 'object' && hasMappedChildren) || // ✅ CORREÇÃO AQUI
          hasParser ||
          !deleteNotMapped;

        if (!shouldInclude) continue;

        const parsedOrRecursed = hasParser
          ? parser[fullPath](value)
          : recurse(value, [...path, key]);

        if (mappedPath) {
          setDeepValue(localResult, mappedPath, parsedOrRecursed);
        } else if (!deleteNotMapped) {
          localResult[key] = parsedOrRecursed;
        }
      }

      return localResult;
    }

    return current;
  }

  return recurse(obj);
}
