export interface CategoryBudget {
  id: string;
  categoryId: string;
  defaultAmount: number; // Monto por defecto para todos los meses
  createdAt: number;
}

export interface MonthlyBudgetAdjustment {
  id: string;
  budgetId: string; // Referencia al CategoryBudget
  month: string; // formato MM-YYYY
  adjustedAmount: number; // Monto ajustado para este mes específico
  createdAt: number;
}

export interface BudgetProgress {
  budgetId: string;
  percentageUsed: number; // 0..100
  remainingAmount: number;
  isOverLimit: boolean;
}


