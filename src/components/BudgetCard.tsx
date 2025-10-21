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
    if (progress.isOverLimit) return 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900';
    if (progress.percentageUsed >= 80) return 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900';
    return 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900';
  };

  const getProgressColor = () => {
    if (progress.isOverLimit) return 'bg-red-600';
    if (progress.percentageUsed >= 80) return 'bg-amber-500';
    return 'bg-green-600';
  };

  const getTextColor = () => {
    if (progress.isOverLimit) return 'text-red-900 dark:text-red-100';
    if (progress.percentageUsed >= 80) return 'text-amber-900 dark:text-amber-100';
    return 'text-green-900 dark:text-green-100';
  };

  const getIconColor = () => {
    if (progress.isOverLimit) return 'text-red-700 dark:text-red-300';
    if (progress.percentageUsed >= 80) return 'text-amber-700 dark:text-amber-300';
    return 'text-green-700 dark:text-green-300';
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {React.createElement(getCategoryIcon(budget.categoryIcon), { className: `h-4 w-4 ${getIconColor()}` })}
          <h3 className={`font-semibold ${getTextColor()}`}>{budget.categoryId}</h3>
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
              <span className={`text-muted-foreground ${getTextColor()} opacity-70`}>Gastado:</span>
              <span className={`font-medium ${getTextColor()}`}>${(budget.spentAmount || 0).toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-muted-foreground ${getTextColor()} opacity-70`}>Límite:</span>
              {month && onUpdate ? (
                <MonthlyBudgetAdjustment
                  budgetId={budget.id}
                  defaultAmount={budget.defaultAmount}
                  month={month}
                  currentAmount={budget.effectiveAmount}
                  onUpdate={onUpdate}
                  textColor={getTextColor()}
                  iconColor={getIconColor()}
                />
              ) : (
                <span className={`font-medium ${getTextColor()}`}>${(budget.effectiveAmount || budget.defaultAmount || 0).toLocaleString('es-CL')}</span>
              )}
            </div>
            <div className="flex justify-between mt-1 pt-1 border-t">
              <span className={`text-muted-foreground ${getTextColor()} opacity-70`}>Restante:</span>
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


