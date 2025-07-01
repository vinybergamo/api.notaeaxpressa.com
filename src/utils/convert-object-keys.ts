interface Options {
  deleteNonExistent?: boolean;
}

export function convertObjectKeys(
  obj: any,
  mapper: Record<string, string>,
  options: Options = {},
) {
  const { deleteNonExistent = false } = options;

  if (Array.isArray(obj)) {
    return obj.map((iten) => convertObjectKeys(iten, mapper, options));
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const mappedKey = mapper[key];

      if (!mappedKey && deleteNonExistent) {
        return acc;
      }

      const newKey = mappedKey || key;
      acc[newKey] = convertObjectKeys(value, mapper, options);
      return acc;
    }, {});
  }

  return obj;
}
