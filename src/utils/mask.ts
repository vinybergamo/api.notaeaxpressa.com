export function mask(input: string, visibleChars = 3, maskChar = '*'): string {
  if (input.length <= visibleChars) {
    return input;
  }

  const visiblePart = input.substring(0, visibleChars);
  const maskedPart = maskChar.repeat(input.length - visibleChars);

  return `${visiblePart}${maskedPart}`.trim().substring(0, 16);
}
