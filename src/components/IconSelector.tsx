'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CATEGORY_ICONS, getIconCategories } from '@/lib/categoryIcons';

interface IconSelectorProps {
  selectedIcon: string;
  onIconSelect: (iconId: string) => void;
  usedIcons?: string[];
}

export function IconSelector({ selectedIcon, onIconSelect, usedIcons = [] }: IconSelectorProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = getIconCategories();
  
  // Filtrar íconos por término de búsqueda
  const filteredIcons = searchTerm 
    ? CATEGORY_ICONS.filter(icon => 
        icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        icon.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        icon.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : CATEGORY_ICONS.filter(icon => icon.category === categories[currentCategoryIndex]);

  const goToPreviousCategory = () => {
    setCurrentCategoryIndex(prev => 
      prev === 0 ? categories.length - 1 : prev - 1
    );
  };

  const goToNextCategory = () => {
    setCurrentCategoryIndex(prev => 
      prev === categories.length - 1 ? 0 : prev + 1
    );
  };

  const handleIconSelect = (iconId: string) => {
    if (!usedIcons.includes(iconId) || selectedIcon === iconId) {
      onIconSelect(iconId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar ícono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Navegación de categorías (solo si no hay búsqueda) */}
      {!searchTerm && categories.length > 1 && (
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPreviousCategory();
            }}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <h3 className="font-medium text-foreground">{categories[currentCategoryIndex]}</h3>
            <p className="text-sm text-muted-foreground">
              {currentCategoryIndex + 1} de {categories.length}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNextCategory();
            }}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Grid de íconos */}
      <div className="grid grid-cols-6 gap-3 max-h-64 overflow-y-auto">
        {filteredIcons.map((icon) => {
          const IconComponent = icon.icon;
          const isSelected = selectedIcon === icon.value;
          const isUsed = usedIcons.includes(icon.value);
          
          return (
            <button
              key={icon.value}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleIconSelect(icon.value);
              }}
              disabled={isUsed && !isSelected}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center
                ${isSelected 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : isUsed 
                    ? 'border-muted bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
                    : 'border-border hover:border-primary/50 hover:bg-primary/5 text-foreground'
                }
              `}
              title={`${icon.label}${isUsed && !isSelected ? ' (ya usado)' : ''}`}
            >
              <IconComponent className="h-5 w-5" />
            </button>
          );
        })}
      </div>

      {/* Indicadores de categorías (solo si no hay búsqueda) */}
      {!searchTerm && categories.length > 1 && (
        <div className="flex justify-center gap-2">
          {categories.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentCategoryIndex(index);
              }}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                ${index === currentCategoryIndex 
                  ? 'bg-primary' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }
              `}
            />
          ))}
        </div>
      )}

      {/* Información de íconos usados */}
      {usedIcons.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          {usedIcons.length} ícono(s) ya utilizado(s) en otras categorías
        </div>
      )}
    </div>
  );
}