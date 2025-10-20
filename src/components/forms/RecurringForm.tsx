import React, { useState } from 'react';
import type { RecurringTransaction, Recurrence } from '@/types/recurring';
import type { Account } from '@/types/account';
import type { Category } from '@/types/category';

interface RecurringFormProps {
  initial?: Partial<RecurringTransaction>;
  accounts: Account[];
  categories: Category[];
  onSubmit: (data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'isPaused'>) => Promise<void> | void;
  onCancel: () => void;
}

export function RecurringForm({ initial, accounts, categories, onSubmit, onCancel }: RecurringFormProps) {
  const [type, setType] = useState<RecurringTransaction['type']>(initial?.type ?? 'gasto');
  const [amount, setAmount] = useState(initial?.amount ?? 0);
  const [startDate, setStartDate] = useState(() => {
    const d = initial?.startDate ? new Date(initial.startDate) : new Date();
    return d.toISOString().slice(0, 10);
  });
  const [accountId, setAccountId] = useState(initial?.accountId ?? (accounts[0]?.id ?? ''));
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? (categories[0]?.id ?? ''));
  const [note, setNote] = useState(initial?.note ?? '');
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'mensual');
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!accountId || !categoryId || amount <= 0) return;
        setSubmitting(true);
        try {
          await onSubmit({
            type,
            amount,
            startDate: new Date(startDate).getTime(),
            accountId,
            categoryId,
            note,
            recurrence,
          });
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value as RecurringTransaction['type'])} className="w-full border rounded px-3 py-2 bg-background">
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm">Monto</label>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full border rounded px-3 py-2 bg-background" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm">Cuenta</label>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full border rounded px-3 py-2 bg-background">
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm">Categoría</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border rounded px-3 py-2 bg-background">
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm">Inicio</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border rounded px-3 py-2 bg-background" />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Recurrencia</label>
          <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)} className="w-full border rounded px-3 py-2 bg-background">
            <option value="mensual">Mensual</option>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm">Nota</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border rounded px-3 py-2 bg-background" />
      </div>
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded border">Cancelar</button>
        <button disabled={submitting} type="submit" className="px-3 py-2 rounded bg-zinc-900 text-white">
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}


