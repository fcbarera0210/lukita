import React from 'react';
import type { CategoryBudget } from '@/types/budget';
import { calculateBudgetProgress } from '@/lib/budgets';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { MonthlyBudgetAdjustment } from './MonthlyBudgetAdjustment';

interface BudgetCardProps {
  budget: CategoryBudget & { effectiveAmount: number; spentAmount: number; categoryIcon?: string };
  month?: string;
  onUpdate?: () => void;
}

export function BudgetCard({ budget, month, onUpdate }: BudgetCardProps) {
  const progress = calculateBudgetProgress(budget);
  
  const getStatusIcon = () => {
    if (progress.isOverLimit) return <XCircle className="h-4 w-4 text-red-500" />;
    if (progress.percentageUsed >= 80) return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusColor = () => {
    if (progress.isOverLimit) return 'border-red-500 bg-red-50 dark:bg-red-950';
    if (progress.percentageUsed >= 80) return 'border-amber-500 bg-amber-50 dark:bg-amber-950';
    return 'border-green-500 bg-green-50 dark:bg-green-950';
  };

  const getProgressColor = () => {
    if (progress.isOverLimit) return 'bg-red-600';
    if (progress.percentageUsed >= 80) return 'bg-amber-500';
    return 'bg-green-600';
  };

  const getTextColor = () => {
    if (progress.isOverLimit) return 'text-red-600';
    if (progress.percentageUsed >= 80) return 'text-amber-600';
    return 'text-zinc-500';
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {React.createElement(getCategoryIcon(budget.categoryIcon), { className: "h-4 w-4 text-muted-foreground" })}
          <h3 className="font-semibold">{budget.categoryId}</h3>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`font-bold ${getTextColor()}`}>
            {progress.percentageUsed}%
          </span>
        </div>
      </div>
      
      <div className="mt-2 h-3 w-full rounded bg-muted">
        <div 
          className={`h-3 rounded ${getProgressColor()}`} 
          style={{ width: `${progress.percentageUsed}%` }} 
        />
      </div>
      
      <div className="mt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gastado:</span>
          <span className="font-medium">${(budget.spentAmount || 0).toLocaleString('es-CL')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Límite:</span>
          {month && onUpdate ? (
            <MonthlyBudgetAdjustment
              budgetId={budget.id}
              categoryId={budget.categoryId}
              defaultAmount={budget.defaultAmount}
              month={month}
              currentAmount={budget.effectiveAmount}
              onUpdate={onUpdate}
            />
          ) : (
            <span className="font-medium">${(budget.effectiveAmount || budget.defaultAmount || 0).toLocaleString('es-CL')}</span>
          )}
        </div>
        <div className="flex justify-between mt-1 pt-1 border-t">
          <span className="text-muted-foreground">Restante:</span>
          <span className={`font-semibold ${progress.remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${progress.remainingAmount.toLocaleString('es-CL')}
          </span>
        </div>
      </div>
      
      {progress.isOverLimit && (
        <div className="mt-2 text-sm text-red-600 font-medium">
          ⚠️ Superaste el presupuesto
        </div>
      )}
      {!progress.isOverLimit && progress.percentageUsed >= 80 && (
        <div className="mt-2 text-sm text-amber-600 font-medium">
          ⚠️ Alerta: sobre 80% del presupuesto
        </div>
      )}
    </div>
  );
}


