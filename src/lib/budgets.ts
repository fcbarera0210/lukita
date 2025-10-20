import type { CategoryBudget, MonthlyBudgetAdjustment, BudgetProgress } from '@/types/budget';
import { db } from '@/lib/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { getTransactions } from '@/lib/firestore';

export function calculateBudgetProgress(budget: CategoryBudget & { effectiveAmount: number; spentAmount: number }): BudgetProgress {
  const effectiveAmount = budget.effectiveAmount || budget.defaultAmount || 0;
  const spentAmount = budget.spentAmount || 0;
  
  const remainingAmount = Math.max(0, effectiveAmount - spentAmount);
  const rawPercentage = effectiveAmount > 0 ? (spentAmount / effectiveAmount) * 100 : 0;
  const percentageUsed = Math.min(100, Math.max(0, Math.round(rawPercentage)));
  return {
    budgetId: budget.id,
    percentageUsed,
    remainingAmount,
    isOverLimit: spentAmount > effectiveAmount,
  };
}

export function monthKeyFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${m}-${y}`; // Cambiado a MM-YYYY para consistencia
}

// ===== CRUD para presupuestos por categoría =====
export async function createBudget(userId: string, data: Omit<CategoryBudget, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'users', userId, 'budgets'), {
    ...data,
    createdAt: Timestamp.now().toMillis(),
  });
  return ref.id;
}

export async function getBudgets(userId: string): Promise<CategoryBudget[]> {
  const q = query(collection(db, 'users', userId, 'budgets'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    // Migrar estructura antigua a nueva
    if (data.month && data.limitAmount && !data.defaultAmount) {
      return {
        id: d.id,
        categoryId: data.categoryId,
        defaultAmount: data.limitAmount,
        createdAt: data.createdAt
      };
    }
    return { id: d.id, ...data };
  }) as CategoryBudget[];
}

export async function updateBudget(userId: string, budgetId: string, updates: Partial<CategoryBudget>): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'budgets', budgetId), updates);
}

export async function deleteBudget(userId: string, budgetId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'budgets', budgetId));
}

// ===== CRUD para ajustes mensuales =====
export async function createMonthlyAdjustment(userId: string, data: Omit<MonthlyBudgetAdjustment, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'users', userId, 'budgetAdjustments'), {
    ...data,
    createdAt: Timestamp.now().toMillis(),
  });
  return ref.id;
}

export async function getMonthlyAdjustments(userId: string, month: string): Promise<MonthlyBudgetAdjustment[]> {
  const q = query(collection(db, 'users', userId, 'budgetAdjustments'), where('month', '==', month));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<MonthlyBudgetAdjustment, 'id'>) }));
}

export async function updateMonthlyAdjustment(userId: string, adjustmentId: string, updates: Partial<MonthlyBudgetAdjustment>): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'budgetAdjustments', adjustmentId), updates);
}

export async function deleteMonthlyAdjustment(userId: string, adjustmentId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'budgetAdjustments', adjustmentId));
}

// ===== Funciones de cálculo =====
export async function getEffectiveBudgetAmount(userId: string, budgetId: string, month: string): Promise<number> {
  const budgets = await getBudgets(userId);
  const budget = budgets.find(b => b.id === budgetId);
  if (!budget) return 0;

  const adjustments = await getMonthlyAdjustments(userId, month);
  const adjustment = adjustments.find(a => a.budgetId === budgetId);
  
  return adjustment ? adjustment.adjustedAmount : budget.defaultAmount;
}

export async function getBudgetsForMonth(userId: string, month: string): Promise<(CategoryBudget & { effectiveAmount: number; spentAmount: number })[]> {
  const budgets = await getBudgets(userId);
  const adjustments = await getMonthlyAdjustments(userId, month);
  const spendMap = await getMonthlyCategorySpending(userId, month);

  return budgets.map(budget => {
    const adjustment = adjustments.find(a => a.budgetId === budget.id);
    const effectiveAmount = adjustment ? adjustment.adjustedAmount : (budget.defaultAmount || 0);
    const spentAmount = spendMap[budget.categoryId] || 0;

    return {
      ...budget,
      effectiveAmount,
      spentAmount
    };
  });
}

export async function getMonthlyCategorySpending(
  userId: string,
  month: string // MM-YYYY
): Promise<Record<string, number>> {
  const [monthStr, yearStr] = month.split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1; // 0-based
  const start = new Date(year, monthIndex, 1).getTime();
  const end = new Date(year, monthIndex + 1, 1).getTime();

  const txs = await getTransactions(userId);
  const map: Record<string, number> = {};
  for (const t of txs) {
    if (t.type !== 'gasto') continue;
    if (t.date < start || t.date >= end) continue;
    map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
  }
  return map;
}