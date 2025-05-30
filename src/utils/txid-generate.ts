export function txIdGenerate(prefix?: string, maxLength: number = 35): string {
  const uuid = crypto.randomUUID();
  const txId = uuid.replace(/-/g, '').trim();
  const result = prefix ? `${prefix}UUID${txId}` : txId;
  return result
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .padEnd(maxLength, '0')
    .substring(0, maxLength);
}
