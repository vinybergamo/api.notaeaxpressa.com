const validateCPFDigit = (arr: number[], position: number): boolean => {
  let factor: number;
  let arrayDigit: number;
  let sum = 0;

  if (position === 1) {
    factor = 10;
    arrayDigit = 9;
  } else {
    factor = 11;
    arrayDigit = 10;
  }

  for (let i = 0; i < arrayDigit; i += 1) {
    sum += arr[i] * factor;
    factor -= 1;
  }

  const division = Math.floor(sum % 11);
  let verifyingDigit = 0;

  if (division > 1) {
    verifyingDigit = 11 - division;
  }

  if (arr[arrayDigit] !== verifyingDigit) {
    return false;
  }

  return true;
};

export const isCPF = (cpf: unknown): boolean => {
  if (typeof cpf !== 'string' && typeof cpf !== 'number') {
    return false;
  }

  let filteredCPF = String(cpf);
  filteredCPF = filteredCPF.replace(/\.|-/g, '');

  if (filteredCPF.length !== 11) {
    return false;
  }

  const arrCPF: number[] = Array.from(filteredCPF, Number);

  const repeatedNumbers: boolean = arrCPF.every(
    (num, i, arr) => num === arr[0],
  );
  if (repeatedNumbers) {
    return false;
  }

  const firstDigit = validateCPFDigit(arrCPF, 1);
  const secondDigit = validateCPFDigit(arrCPF, 2);
  if (!firstDigit || !secondDigit) {
    return false;
  }

  return true;
};

const validateCNPJDigit = (arr: number[], position: number): boolean => {
  let weights: number[];
  let arrayItems: number;
  let sum = 0;

  if (position === 1) {
    weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    arrayItems = 12;
  } else {
    weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    arrayItems = 13;
  }

  for (let i = 0; i < arrayItems; i += 1) {
    const calc = weights[i] * arr[i];
    sum += calc;
  }

  const division = Math.floor(sum % 11);
  let verifyingDigit = 0;

  if (division >= 2) {
    verifyingDigit = 11 - division;
  }

  if (arr[arrayItems] !== verifyingDigit) {
    return false;
  }

  return true;
};

export const isCNPJ = (cnpj: unknown): boolean => {
  if (typeof cnpj !== 'string' && typeof cnpj !== 'number') {
    return false;
  }

  let filteredCNPJ = String(cnpj);
  filteredCNPJ = filteredCNPJ.replace(/\.|-|\//g, '');

  if (filteredCNPJ.length !== 14) {
    return false;
  }

  const arrCNPJ: number[] = Array.from(filteredCNPJ, Number);

  const repeatedNumbers: boolean = arrCNPJ.every(
    (num, i, arr) => num === arr[0],
  );
  if (repeatedNumbers) {
    return false;
  }

  const firstDigit = validateCNPJDigit(arrCNPJ, 1);
  const secondDigit = validateCNPJDigit(arrCNPJ, 2);
  if (!firstDigit || !secondDigit) {
    return false;
  }

  return true;
};

export const isDocument = (document: string): boolean => {
  const sanitizedDocument = document.replace(/\D/g, '');
  if (sanitizedDocument.length === 11) return isCPF(sanitizedDocument);
  if (sanitizedDocument.length === 14) return isCNPJ(sanitizedDocument);

  return false;
};
