/**
 * Formatea un número como moneda chilena sin decimales
 */
export const formatCLP = (n: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(n);
};

/**
 * Parsea una cadena de texto con formato de moneda chilena a número entero
 */
export const parseCLP = (str: string): number => {
  // Remover todos los caracteres que no sean dígitos o signo menos
  const cleaned = str.replace(/[^0-9-]/g, '');
  return Number(cleaned);
};

/**
 * Valida que un número sea un entero positivo válido para CLP
 */
export const isValidCLP = (n: number): boolean => {
  return Number.isInteger(n) && n >= 0;
};
