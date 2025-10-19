/**
 * Formatea un número como moneda chilena sin decimales
 */
export const formatCLP = (n: number | undefined | null): string => {
  if (n === undefined || n === null || isNaN(n)) {
    return '$0';
  }
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(n);
};

/**
 * Parsea una cadena de texto con formato de moneda chilena a número entero
 */
export const parseCLP = (str: string | number | undefined | null): number => {
  // Si no es una cadena, convertir a cadena primero
  const strValue = String(str || '');
  // Remover todos los caracteres que no sean dígitos o signo menos
  const cleaned = strValue.replace(/[^0-9-]/g, '');
  return Number(cleaned) || 0;
};

/**
 * Valida que un número sea un entero positivo válido para CLP
 */
export const isValidCLP = (n: number): boolean => {
  return Number.isInteger(n) && n >= 0;
};
