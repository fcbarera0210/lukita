// Utilidades para parsing mejorado de URLs inteligentes

export type TransactionType = 'ingreso' | 'gasto';

/**
 * Parsea el tipo de transacción desde la URL con soporte para:
 * - Mayúsculas: GASTO, INGRESO
 * - Abreviaciones: i, g
 * - Casos mixtos: Gasto, Ingreso
 */
export const parseTransactionType = (typeParam: string | null): TransactionType | null => {
  if (!typeParam) return null;
  
  const normalized = typeParam.toLowerCase().trim();
  
  // Abreviaciones
  if (normalized === 'i') return 'ingreso';
  if (normalized === 'g') return 'gasto';
  
  // Tipos completos
  if (normalized === 'ingreso') return 'ingreso';
  if (normalized === 'gasto') return 'gasto';
  
  return null;
};

/**
 * Parsea el monto desde la URL
 */
export const parseAmount = (amountParam: string | null): number => {
  if (!amountParam) return 0;
  
  const parsed = parseInt(amountParam);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
};

/**
 * Busca una categoría por nombre con búsqueda flexible
 */
export const findCategoryByName = (categoryName: string, categories: Array<{ id: string; name: string }>): string => {
  if (!categoryName || categories.length === 0) return '';
  
  const searchTerm = categoryName.toLowerCase().trim();
  
  const foundCategory = categories.find(cat => {
    const categoryName = cat.name.toLowerCase().trim();
    return categoryName === searchTerm || 
           categoryName.includes(searchTerm) || 
           searchTerm.includes(categoryName);
  });
  
  return foundCategory?.id || '';
};

/**
 * Busca una cuenta por nombre con búsqueda flexible
 */
export const findAccountByName = (accountName: string, accounts: Array<{ id: string; name: string }>): string => {
  if (!accountName || accounts.length === 0) return '';
  
  const searchTerm = accountName.toLowerCase().trim();
  
  const foundAccount = accounts.find(acc => {
    const accountName = acc.name.toLowerCase().trim();
    return accountName === searchTerm || 
           accountName.includes(searchTerm) || 
           searchTerm.includes(accountName);
  });
  
  return foundAccount?.id || '';
};

/**
 * Parsea todos los parámetros de URL para una nueva transacción
 */
export const parseTransactionUrlParams = (searchParams: URLSearchParams) => {
  return {
    type: searchParams.get('type'),
    amount: searchParams.get('amount'),
    note: searchParams.get('note'),
    categoryId: searchParams.get('categoryId'),
    accountId: searchParams.get('accountId'),
    category: searchParams.get('category'),
    account: searchParams.get('account')
  };
};
