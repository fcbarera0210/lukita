'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCLP } from '@/lib/clp';

interface ComparisonData {
  current: number;
  previous: number;
  label: string;
  type: 'income' | 'expense' | 'balance';
}

interface MonthlyComparisonProps {
  data: ComparisonData[];
}

export function MonthlyComparison({ data }: MonthlyComparisonProps) {
  const getChangeIcon = (current: number, previous: number, type: 'income' | 'expense' | 'balance') => {
    const change = current - previous;
    
    if (type === 'expense') {
      // Para gastos, menos es mejor
      return change < 0 ? TrendingDown : change > 0 ? TrendingUp : Minus;
    } else {
      // Para ingresos y balance, más es mejor
      return change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
    }
  };

  const getChangeColor = (current: number, previous: number, type: 'income' | 'expense' | 'balance') => {
    const change = current - previous;
    
    if (type === 'expense') {
      // Para gastos, menos es mejor (verde)
      return change < 0 ? 'text-green-500' : change > 0 ? 'text-red-500' : 'text-muted-foreground';
    } else {
      // Para ingresos y balance, más es mejor (verde)
      return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-muted-foreground';
    }
  };

  const getChangeBgColor = (current: number, previous: number, type: 'income' | 'expense' | 'balance') => {
    const change = current - previous;
    
    if (type === 'expense') {
      return change < 0 ? 'bg-green-500' : change > 0 ? 'bg-red-500' : 'bg-muted';
    } else {
      return change > 0 ? 'bg-green-500' : change < 0 ? 'bg-red-500' : 'bg-muted';
    }
  };

  return (
    <div className="space-y-4">
      {/* Resumen general */}
      <div className="bg-muted/50 border border-border/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium text-sm">Resumen de Cambios</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          Comparación entre {data[0]?.label.toLowerCase()} del mes actual vs mes anterior. 
          Los indicadores muestran si hubo mejoras (verde) o deterioro (rojo) en cada métrica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((item, index) => {
          const change = item.current - item.previous;
          const percentageChange = item.previous !== 0 ? (change / item.previous) * 100 : (item.current !== 0 ? 100 : 0);
          
          const ChangeIcon = getChangeIcon(item.current, item.previous, item.type);
          const changeColor = getChangeColor(item.current, item.previous, item.type);
          const changeBgColor = getChangeBgColor(item.current, item.previous, item.type);

          return (
            <div key={index} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-muted-foreground">{item.label}</h4>
                <ChangeIcon className={`h-4 w-4 ${changeColor}`} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {formatCLP(item.current)}
                  </span>
                  <span className={`text-sm ${changeColor}`}>
                    {change > 0 ? '+' : ''}{formatCLP(change)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Mes anterior: {formatCLP(item.previous)}</span>
                  <span className={changeColor}>
                    {change > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                  </span>
                </div>
                
                {/* Barra de progreso visual */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${changeBgColor}`}
                    style={{
                      width: `${Math.min(Math.abs(percentageChange), 100)}%`,
                      opacity: 0.7
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
