export function txIdGenerate(prefix?: string, maxLength: number = 35): string {
  const txId = Math.random()
    .toString(36)
    .substring(2)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const result = prefix ? `${prefix}${txId}` : txId;
  return result
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .padEnd(maxLength, Math.round(Math.random() * 9).toString())
    .substring(0, maxLength);
}
