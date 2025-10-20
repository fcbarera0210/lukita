'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendData {
  period: string;
  income: number;
  expense: number;
  balance: number;
}

interface TrendChartProps {
  data: TrendData[];
  type: 'income' | 'expense' | 'balance';
  period: 'daily' | 'weekly' | 'monthly';
  className?: string;
}

export function TrendChart({ data, type, period, className = '' }: TrendChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map(d => {
      switch (type) {
        case 'income': return d.income;
        case 'expense': return d.expense;
        case 'balance': return d.balance;
        default: return 0;
      }
    });

    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    return {
      values,
      maxValue,
      minValue,
      range,
      periods: data.map(d => d.period)
    };
  }, [data, type]);

  const getTrendIcon = () => {
    if (!chartData || chartData.values.length < 2) return <Minus className="h-4 w-4" />;
    
    const firstValue = chartData.values[0];
    const lastValue = chartData.values[chartData.values.length - 1];
    
    if (lastValue > firstValue) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (lastValue < firstValue) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendPercentage = () => {
    if (!chartData || chartData.values.length < 2) return 0;
    
    const firstValue = chartData.values[0];
    const lastValue = chartData.values[chartData.values.length - 1];
    
    if (firstValue === 0) return lastValue > 0 ? 100 : 0;
    return ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'income': return 'Ingresos';
      case 'expense': return 'Gastos';
      case 'balance': return 'Balance';
      default: return '';
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
      default: return '';
    }
  };

  if (!chartData) {
    return (
      <div className={`p-4 bg-card rounded-lg border ${className}`}>
        <div className="text-center text-muted-foreground">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-card rounded-lg border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <h3 className="font-semibold">{getTypeLabel()} - {getPeriodLabel()}</h3>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            Tendencia
          </div>
          <div className={`text-sm font-medium ${
            getTrendPercentage() > 0 ? 'text-green-500' : 
            getTrendPercentage() < 0 ? 'text-red-500' : 
            'text-gray-500'
          }`}>
            {getTrendPercentage() > 0 ? '+' : ''}{getTrendPercentage().toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-2">
        {chartData.values.map((value, index) => {
          const height = ((value - chartData.minValue) / chartData.range) * 100;
          const isLast = index === chartData.values.length - 1;
          
          return (
            <div key={index} className="flex items-end gap-1">
              <div className="flex-1 flex items-end gap-1">
                {chartData.values.map((_, barIndex) => {
                  const barHeight = ((chartData.values[barIndex] - chartData.minValue) / chartData.range) * 100;
                  const isCurrentBar = barIndex === index;
                  
                  return (
                    <div
                      key={barIndex}
                      className={`flex-1 rounded-t transition-all duration-300 ${
                        isCurrentBar 
                          ? type === 'income' 
                            ? 'bg-green-500' 
                            : type === 'expense' 
                              ? 'bg-red-500' 
                              : 'bg-blue-500'
                          : type === 'income'
                            ? 'bg-green-200'
                            : type === 'expense'
                              ? 'bg-red-200'
                              : 'bg-blue-200'
                      }`}
                      style={{ height: `${Math.max(barHeight, 2)}px` }}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground w-12 text-right">
                {chartData.periods[index]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Promedio</div>
            <div className="font-medium">
              ${(chartData.values.reduce((a, b) => a + b, 0) / chartData.values.length).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Máximo</div>
            <div className="font-medium">
              ${chartData.maxValue.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Mínimo</div>
            <div className="font-medium">
              ${chartData.minValue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
