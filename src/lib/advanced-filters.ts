import { Transaction } from '@/types/transaction';
import { AdvancedFiltersState, SavedView } from '@/components/AdvancedFilters';

/**
 * Filtra transacciones usando los filtros avanzados
 */
export function filterTransactions(
  transactions: Transaction[],
  filters: AdvancedFiltersState
): Transaction[] {
  return transactions.filter(transaction => {
    // Filtro por tipo
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }

    // Filtro por cuenta principal (compatibilidad con filtro básico)
    if (filters.accountId && transaction.accountId !== filters.accountId) {
      return false;
    }

    // Filtro por múltiples cuentas
    if (filters.selectedAccountIds.length > 0 && 
        !filters.selectedAccountIds.includes(transaction.accountId)) {
      return false;
    }

    // Filtro por categoría principal (compatibilidad con filtro básico)
    if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
      return false;
    }

    // Filtro por múltiples categorías
    if (filters.selectedCategoryIds.length > 0 && 
        !filters.selectedCategoryIds.includes(transaction.categoryId)) {
      return false;
    }

    // Filtro por rango de fechas
    if (filters.startDate && transaction.date < new Date(filters.startDate).getTime()) {
      return false;
    }
    if (filters.endDate && transaction.date > new Date(filters.endDate).getTime()) {
      return false;
    }

    // Filtro por rango de montos
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      if (!isNaN(minAmount) && transaction.amount < minAmount) {
        return false;
      }
    }
    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      if (!isNaN(maxAmount) && transaction.amount > maxAmount) {
        return false;
      }
    }

    // Filtro por texto en notas
    if (filters.searchText) {
      const searchText = filters.searchText.toLowerCase();
      const note = transaction.note?.toLowerCase() || '';
      
      if (!note.includes(searchText)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Crea un estado de filtros por defecto
 */
export function createDefaultFilters(): AdvancedFiltersState {
  return {
    type: '',
    accountId: '',
    categoryId: '',
    startDate: '',
    endDate: '',
    selectedAccountIds: [],
    selectedCategoryIds: [],
    minAmount: '',
    maxAmount: '',
    searchText: ''
  };
}

/**
 * Limpia todos los filtros
 */
export function clearAllFilters(): AdvancedFiltersState {
  return createDefaultFilters();
}

/**
 * Guarda una vista en localStorage
 */
export function saveViewToStorage(viewName: string, filters: AdvancedFiltersState, userId: string): SavedView {
  const savedViews = getSavedViewsFromStorage(userId);
  const newView: SavedView = {
    id: Date.now().toString(),
    name: viewName,
    filters: { ...filters },
    createdAt: new Date()
  };
  
  const updatedViews = [...savedViews, newView];
  localStorage.setItem(`lukita_saved_views_${userId}`, JSON.stringify(updatedViews));
  
  return newView;
}

/**
 * Obtiene todas las vistas guardadas desde localStorage
 */
export function getSavedViewsFromStorage(userId: string): SavedView[] {
  try {
    const stored = localStorage.getItem(`lukita_saved_views_${userId}`);
    if (!stored) return [];
    
    const views = JSON.parse(stored);
    // Convertir las fechas de string a Date
    return views.map((view: SavedView & { createdAt: string }) => ({
      ...view,
      createdAt: new Date(view.createdAt)
    }));
  } catch (error) {
    console.error('Error loading saved views:', error);
    return [];
  }
}

/**
 * Elimina una vista guardada
 */
export function deleteViewFromStorage(viewId: string, userId: string): void {
  const savedViews = getSavedViewsFromStorage(userId);
  const updatedViews = savedViews.filter(view => view.id !== viewId);
  localStorage.setItem(`lukita_saved_views_${userId}`, JSON.stringify(updatedViews));
}

/**
 * Valida si los filtros tienen valores activos
 */
export function hasActiveFilters(filters: AdvancedFiltersState): boolean {
  return !!(
    filters.type ||
    filters.accountId ||
    filters.categoryId ||
    filters.startDate ||
    filters.endDate ||
    filters.selectedAccountIds.length > 0 ||
    filters.selectedCategoryIds.length > 0 ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.searchText
  );
}

/**
 * Cuenta el número de filtros activos
 */
export function getActiveFilterCount(filters: AdvancedFiltersState): number {
  let count = 0;
  if (filters.type) count++;
  if (filters.accountId) count++;
  if (filters.categoryId) count++;
  if (filters.startDate) count++;
  if (filters.endDate) count++;
  if (filters.selectedAccountIds.length > 0) count++;
  if (filters.selectedCategoryIds.length > 0) count++;
  if (filters.minAmount) count++;
  if (filters.maxAmount) count++;
  if (filters.searchText) count++;
  return count;
}

/**
 * Aplica filtros rápidos predefinidos
 */
export function applyQuickFilter(filterType: 'this_month' | 'last_month' | 'last_3_months' | 'expenses_only' | 'income_only'): Partial<AdvancedFiltersState> {
  const now = new Date();
  
  switch (filterType) {
    case 'this_month':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      };
    
    case 'last_month':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        startDate: lastMonth.toISOString().split('T')[0],
        endDate: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
      };
    
    case 'last_3_months':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      };
    
    case 'expenses_only':
      return {
        type: 'gasto'
      };
    
    case 'income_only':
      return {
        type: 'ingreso'
      };
    
    default:
      return {};
  }
}
