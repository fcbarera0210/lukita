import React, { useState } from 'react';
import type { CategoryBudget } from '@/types/budget';
import type { Category } from '@/types/category';

interface BudgetFormProps {
  initial?: Partial<CategoryBudget>;
  categories: Category[];
  onSubmit: (data: Omit<CategoryBudget, 'id' | 'createdAt' | 'spentAmount'>) => Promise<void> | void;
  onCancel: () => void;
}

export function BudgetForm({ initial, categories, onSubmit, onCancel }: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? (categories[0]?.id ?? ''));
  const [defaultAmount, setDefaultAmount] = useState(initial?.defaultAmount ?? 0);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!categoryId || defaultAmount <= 0) return;
        setSubmitting(true);
        try {
          await onSubmit({ categoryId, defaultAmount });
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm">Categoría</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border rounded px-3 py-2 bg-background"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm">Monto por defecto</label>
        <input
          type="number"
          value={defaultAmount}
          onChange={(e) => setDefaultAmount(Number(e.target.value))}
          className="w-full border rounded px-3 py-2 bg-background"
          placeholder="Ej: 200000"
        />
        <p className="text-xs text-muted-foreground">
          Este monto se aplicará a todos los meses. Podrás ajustarlo mensualmente desde el dashboard.
        </p>
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


