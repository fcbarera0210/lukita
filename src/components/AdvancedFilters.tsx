'use client';

import { Filter, Calendar, DollarSign, Search, Tag, CreditCard, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Account } from '@/types/account';
import { Category } from '@/types/category';

export interface AdvancedFiltersState {
  // Filtros básicos existentes
  type: string;
  accountId: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  
  // Nuevos filtros avanzados
  selectedAccountIds: string[];
  selectedCategoryIds: string[];
  minAmount: string;
  maxAmount: string;
  searchText: string;
}

export interface SavedView {
  id: string;
  name: string;
  filters: AdvancedFiltersState;
  createdAt: Date;
}

interface AdvancedFiltersProps {
  accounts: Account[];
  categories: Category[];
  filters: AdvancedFiltersState;
  onFiltersChange: (filters: AdvancedFiltersState) => void;
  isExpanded: boolean;
  onSaveView?: (name: string, filters: AdvancedFiltersState) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function AdvancedFilters({
  accounts,
  categories,
  filters,
  onFiltersChange,
  isExpanded,
  onSaveView,
  hasActiveFilters,
  onClearFilters
}: AdvancedFiltersProps) {
  const updateFilters = (updates: Partial<AdvancedFiltersState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleAccount = (accountId: string) => {
    const newSelectedIds = filters.selectedAccountIds.includes(accountId)
      ? filters.selectedAccountIds.filter(id => id !== accountId)
      : [...filters.selectedAccountIds, accountId];
    
    updateFilters({ selectedAccountIds: newSelectedIds });
  };

  const toggleCategory = (categoryId: string) => {
    const newSelectedIds = filters.selectedCategoryIds.includes(categoryId)
      ? filters.selectedCategoryIds.filter(id => id !== categoryId)
      : [...filters.selectedCategoryIds, categoryId];
    
    updateFilters({ selectedCategoryIds: newSelectedIds });
  };

  return (
    <>
      {/* Panel de filtros expandido */}
      {isExpanded && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-6">
              {/* Filtros básicos */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros Básicos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <Select
                      value={filters.type}
                      onChange={(e) => updateFilters({ type: e.target.value })}
                    >
                      <option value="">Todos</option>
                      <option value="ingreso">Ingresos</option>
                      <option value="gasto">Gastos</option>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Cuenta Principal</label>
                    <Select
                      value={filters.accountId}
                      onChange={(e) => updateFilters({ accountId: e.target.value })}
                    >
                      <option value="">Todas</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoría Principal</label>
                    <Select
                      value={filters.categoryId}
                      onChange={(e) => updateFilters({ categoryId: e.target.value })}
                    >
                      <option value="">Todas</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              {/* Filtros de fecha */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Rango de Fechas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha desde</label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => updateFilters({ startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha hasta</label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => updateFilters({ endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Filtros de monto */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Rango de Montos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Monto mínimo</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minAmount}
                      onChange={(e) => updateFilters({ minAmount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Monto máximo</label>
                    <Input
                      type="number"
                      placeholder="Sin límite"
                      value={filters.maxAmount}
                      onChange={(e) => updateFilters({ maxAmount: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Búsqueda por texto */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Búsqueda por Texto
                </h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Buscar en notas</label>
                  <Input
                    type="text"
                    placeholder="Buscar en notas..."
                    value={filters.searchText}
                    onChange={(e) => updateFilters({ searchText: e.target.value })}
                  />
                </div>
              </div>

              {/* Múltiples cuentas */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Múltiples Cuentas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {accounts.map((account) => (
                    <label key={account.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.selectedAccountIds.includes(account.id)}
                        onChange={() => toggleAccount(account.id)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">{account.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Múltiples categorías */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Múltiples Categorías
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.selectedCategoryIds.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Botones de acción */}
              {hasActiveFilters && (
                <div className="pt-4 border-t border-border space-y-2">
                  {/* Botón para guardar vista actual */}
                  {onSaveView && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const name = prompt('Nombre de la vista:');
                        if (name && name.trim()) {
                          onSaveView(name.trim(), filters);
                        }
                      }}
                      className="w-full flex items-center gap-2 hover:bg-muted"
                    >
                      <Save className="h-4 w-4" />
                      Guardar Vista Actual
                    </Button>
                  )}
                  
                  {/* Botón para limpiar filtros */}
                  {onClearFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onClearFilters}
                      className="w-full flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    >
                      <X className="h-4 w-4" />
                      Limpiar Filtros
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
