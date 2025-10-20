import type { RecurringTransaction } from '@/types/recurring';
import { db } from '@/lib/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, Timestamp, updateDoc } from 'firebase/firestore';

export function getUpcomingOccurrences(
  recurring: RecurringTransaction,
  fromDate: Date,
  count: number = 5
): Date[] {
  if (recurring.isPaused) return [];
  const occurrences: Date[] = [];
  let cursor = new Date(Math.max(fromDate.getTime(), recurring.startDate));

  const limit = recurring.endDate ? new Date(recurring.endDate) : undefined;
  while (occurrences.length < count) {
    if (limit && cursor > limit) break;
    occurrences.push(new Date(cursor));
    cursor = addRecurrence(cursor, recurring.recurrence);
  }
  return occurrences;
}

export function addRecurrence(date: Date, recurrence: RecurringTransaction['recurrence']): Date {
  const next = new Date(date);
  switch (recurrence) {
    case 'mensual':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'semanal':
      next.setDate(next.getDate() + 7);
      break;
    case 'quincenal':
      next.setDate(next.getDate() + 14);
      break;
  }
  return next;
}

// Mock temporal: lista básica para UI
export function getMockRecurring(): RecurringTransaction[] {
  return [
    {
      id: 'r-1',
      type: 'gasto',
      amount: 14990,
      startDate: Date.now(),
      accountId: 'cta-1',
      categoryId: 'suscripciones',
      note: 'Streaming',
      recurrence: 'mensual',
      createdAt: Date.now(),
    },
    {
      id: 'r-2',
      type: 'ingreso',
      amount: 1000000,
      startDate: Date.now(),
      accountId: 'cta-2',
      categoryId: 'sueldo',
      note: 'Sueldo',
      recurrence: 'mensual',
      createdAt: Date.now(),
    },
  ];
}

// ===== Firestore API =====
export async function createRecurring(userId: string, data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'isPaused'>): Promise<string> {
  const ref = await addDoc(collection(db, 'users', userId, 'recurring'), {
    ...data,
    isPaused: false,
    createdAt: Timestamp.now().toMillis(),
  });
  return ref.id;
}

export async function getRecurring(userId: string): Promise<RecurringTransaction[]> {
  const q = query(collection(db, 'users', userId, 'recurring'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<RecurringTransaction, 'id'>) }));
}

export async function updateRecurring(userId: string, recurringId: string, updates: Partial<RecurringTransaction>): Promise<void> {
  await updateDoc(doc(db, 'users', userId, 'recurring', recurringId), updates);
}

export async function deleteRecurring(userId: string, recurringId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'recurring', recurringId));
}


