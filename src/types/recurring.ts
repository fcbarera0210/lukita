export type Recurrence = 'mensual' | 'semanal' | 'quincenal';

export interface RecurringTransaction {
  id: string;
  type: 'ingreso' | 'gasto';
  amount: number;
  startDate: number; // epoch ms
  endDate?: number; // epoch ms
  accountId: string;
  categoryId: string;
  note?: string;
  recurrence: Recurrence;
  isPaused?: boolean;
  createdAt: number;
}


