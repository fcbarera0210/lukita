'use client';

import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { formatCLP } from '@/lib/clp';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { TopCategoryData } from '@/lib/firestore';

interface TopCategoriesProps {
  data: TopCategoryData[];
}

export function TopCategories({ data }: TopCategoriesProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
        <p className="text-muted-foreground">
          No se encontraron gastos por categoría para el período seleccionado.
        </p>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}°`;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-500';
      case 1: return 'text-gray-400';
      case 2: return 'text-amber-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Resumen general */}
      <div className="bg-muted/50 border border-border/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium text-sm">Ranking de Gastos</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          Las categorías con mayor gasto del mes seleccionado. 
          Se muestran ordenadas por monto total gastado.
        </p>
      </div>

      {/* Lista de categorías */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const IconComponent = getCategoryIcon(item.category.icon);
          
          return (
            <div key={item.categoryId} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    <span className={`text-sm font-bold ${getRankColor(index)}`}>
                      {getRankIcon(index)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-medium">{item.category.name}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {formatCLP(item.totalAmount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.percentage.toFixed(1)}% del total
                  </div>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{item.transactionCount} transacciones</span>
                  <span>{item.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estadísticas adicionales */}
      <div className="bg-muted/50 border border-border/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium text-sm">Estadísticas</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total categorías:</span>
            <span className="ml-2 font-medium">{data.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total gastado:</span>
            <span className="ml-2 font-medium">
              {formatCLP(data.reduce((sum, item) => sum + item.totalAmount, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
