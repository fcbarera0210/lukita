'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionFormData } from '@/schemas/transaction.schema';
import { Transaction } from '@/types/transaction';
import { Account } from '@/types/account';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { formatCLP, parseCLP } from '@/lib/clp';

interface TransactionFormProps {
  transaction?: Transaction;
  accounts: Account[];
  categories: Category[];
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  defaultValues?: Partial<TransactionFormData>;
}

export function TransactionForm({ 
  transaction, 
  accounts, 
  categories, 
  onSubmit, 
  onCancel,
  defaultValues
}: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || defaultValues?.type || 'gasto',
      amount: transaction?.amount || defaultValues?.amount || 0,
      date: transaction?.date || defaultValues?.date || Date.now(),
      accountId: transaction?.accountId || defaultValues?.accountId || '',
      categoryId: transaction?.categoryId || defaultValues?.categoryId || '',
      note: transaction?.note || defaultValues?.note || '',
    },
  });

  const type = watch('type');
  const amount = watch('amount');
  const date = watch('date');

  // Mostrar todas las categorías disponibles (universales)
  const filteredCategories = categories;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseCLP(e.target.value);
    setValue('amount', value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = new Date(e.target.value).getTime();
    setValue('date', value);
  };

  const onFormSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      showToast({
        type: 'success',
        title: transaction ? 'Transacción actualizada' : 'Transacción creada',
        description: `La transacción ha sido ${transaction ? 'actualizada' : 'creada'} exitosamente`,
      });
    } catch (error: unknown) {
      showToast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar la transacción',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-2">
          Tipo
        </label>
        <Select
          id="type"
          {...register('type')}
        >
          <option value="gasto">Gasto</option>
          <option value="ingreso">Ingreso</option>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-2">
          Monto
        </label>
        <Input
          id="amount"
          type="text"
          placeholder="0"
          value={amount ? formatCLP(amount) : ''}
          onChange={handleAmountChange}
        />
        {errors.amount && (
          <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-2">
          Fecha
        </label>
        <Input
          id="date"
          type="date"
          value={new Date(date).toISOString().split('T')[0]}
          onChange={handleDateChange}
        />
        {errors.date && (
          <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="accountId" className="block text-sm font-medium mb-2">
          Cuenta
        </label>
        <Select
          id="accountId"
          {...register('accountId')}
        >
          <option value="">Seleccionar cuenta</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
        {errors.accountId && (
          <p className="text-sm text-destructive mt-1">{errors.accountId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium mb-2">
          Categoría
        </label>
        <Select
          id="categoryId"
          {...register('categoryId')}
        >
          <option value="">Seleccionar categoría</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        {errors.categoryId && (
          <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>
        )}
        {filteredCategories.length === 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            No hay categorías disponibles. Crea una categoría primero.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium mb-2">
          Nota (opcional)
        </label>
        <Input
          id="note"
          placeholder="Descripción de la transacción"
          {...register('note')}
        />
        {errors.note && (
          <p className="text-sm text-destructive mt-1">{errors.note.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Guardando...' : transaction ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
