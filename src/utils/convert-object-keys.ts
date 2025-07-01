interface Options {
  deleteNotMapped?: boolean;
  parser?: Record<string, (value: any) => any>;
}

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

export function convertObjectKeys(
  obj: any,
  mapper: Record<string, string>,
  options: Options = {},
): any {
  const { deleteNotMapped = false, parser = {} } = options;

  function recurse(current: any, path: string[] = []): any {
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
          !!mappedPath || hasMappedChildren || hasParser || !deleteNotMapped;

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
