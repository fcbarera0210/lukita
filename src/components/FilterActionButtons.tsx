'use client';

import { useState, useEffect } from 'react';
import { X, Save, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdvancedFiltersState, SavedView } from './AdvancedFilters';

interface FilterActionButtonsProps {
  filters: AdvancedFiltersState;
  savedViews: SavedView[];
  onSaveView: (name: string, filters: AdvancedFiltersState) => void;
  onLoadView: (view: SavedView) => void;
  onDeleteView: (viewId: string) => void;
}

export function FilterActionButtons({
  filters,
  savedViews,
  onSaveView,
  onLoadView,
  onDeleteView
}: FilterActionButtonsProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [viewName, setViewName] = useState('');
  const [showSavedViews, setShowSavedViews] = useState(false);

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSavedViews && target.classList.contains('fixed')) {
        setShowSavedViews(false);
      }
    };

    if (showSavedViews) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSavedViews]);

  const getFilterCount = () => {
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
  };

  const handleSaveView = () => {
    if (viewName.trim()) {
      onSaveView(viewName.trim(), filters);
      setViewName('');
      setShowSaveDialog(false);
    }
  };

  return (
    <div className="relative">
      {/* Botón de vistas guardadas (solo ícono) */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSavedViews(!showSavedViews)}
        className="flex items-center gap-2"
        title="Vistas Guardadas"
      >
        <Bookmark className="h-4 w-4" />
        {getFilterCount() > 0 && (
          <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
            {getFilterCount()}
          </span>
        )}
      </Button>

      {/* Vistas guardadas */}
      {showSavedViews && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Vistas Guardadas</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSavedViews(false)}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {savedViews.length === 0 ? (
                <div className="text-center py-8">
                  <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">No hay vistas guardadas</p>
                  <p className="text-xs text-muted-foreground">
                    Aplica algunos filtros y guárdalos para reutilizarlos después
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {savedViews.map((view) => (
                    <div key={view.id} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <Bookmark className="h-5 w-5 text-primary" />
                        <div>
                          <span className="text-sm font-medium">{view.name}</span>
                          <p className="text-xs text-muted-foreground">
                            {new Date(view.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onLoadView(view);
                            setShowSavedViews(false);
                          }}
                          className="h-8 px-3 text-xs hover:bg-background"
                        >
                          Cargar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteView(view.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para guardar vista */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Save className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Guardar Vista</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre de la vista</label>
                <input
                  type="text"
                  placeholder="Ej: Gastos del mes pasado"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  className="hover:bg-muted"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveView}
                  disabled={!viewName.trim()}
                  className="hover:bg-primary/90"
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
