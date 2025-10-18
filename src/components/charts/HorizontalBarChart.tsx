'use client';

import { Category } from '@/types/category';

interface CategoryData {
  categoryId: string;
  amount: number;
  category: Category;
  percentage: number;
}

interface HorizontalBarChartProps {
  data: CategoryData[];
  maxAmount: number;
}

export function HorizontalBarChart({ data, maxAmount }: HorizontalBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No hay datos para mostrar
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.categoryId} className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{item.category.name}</span>
            <span className="text-sm text-muted-foreground">
              {item.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            ${item.amount.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
