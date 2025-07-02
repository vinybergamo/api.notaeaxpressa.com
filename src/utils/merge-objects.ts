export function mergeObjects(...objects: Record<string, any>[]) {
  return objects.reduce((acc, obj) => {
    Object.keys(obj).forEach((key) => {
      if (Array.isArray(obj[key])) {
        acc[key] = [...(acc[key] || []), ...obj[key]];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        acc[key] = { ...(acc[key] || {}), ...obj[key] };
      } else {
        acc[key] = obj[key];
      }
    });
    return acc;
  }, {});
}
