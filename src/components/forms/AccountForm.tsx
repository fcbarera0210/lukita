'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema, AccountFormData } from '@/schemas/account.schema';
import { Account, AccountType } from '@/types/account';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { formatCLP, parseCLP } from '@/lib/clp';

interface AccountFormProps {
  account?: Account;
  onSubmit: (data: Omit<Account, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

const accountTypes: { value: AccountType; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'cuenta_corriente', label: 'Cuenta Corriente' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'ahorro', label: 'Ahorro' },
  { value: 'otro', label: 'Otro' },
];

export function AccountForm({ account, onSubmit, onCancel }: AccountFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name || '',
      type: account?.type || 'efectivo',
      initialBalance: account?.initialBalance || 0,
    },
  });

  const initialBalance = watch('initialBalance');

  const handleInitialBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseCLP(e.target.value);
    // Si el valor es NaN o el campo está vacío, establecer como 0
    setValue('initialBalance', isNaN(value) ? 0 : value);
  };

  const onFormSubmit = async (data: AccountFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      showToast({
        type: 'success',
        title: account ? 'Cuenta actualizada' : 'Cuenta creada',
        description: `La cuenta "${data.name}" ha sido ${account ? 'actualizada' : 'creada'} exitosamente`,
      });
    } catch (error: unknown) {
      showToast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar la cuenta',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Nombre de la cuenta
        </label>
        <Input
          id="name"
          placeholder="Ej: Cuenta Principal"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-2">
          Tipo de cuenta
        </label>
        <Select
          id="type"
          {...register('type')}
        >
          {accountTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="initialBalance" className="block text-sm font-medium mb-2">
          Saldo inicial (opcional)
        </label>
        <Input
          id="initialBalance"
          type="text"
          placeholder="0"
          value={initialBalance ? formatCLP(initialBalance) : ''}
          onChange={handleInitialBalanceChange}
        />
        {errors.initialBalance && (
          <p className="text-sm text-destructive mt-1">{errors.initialBalance.message}</p>
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
          {isLoading ? 'Guardando...' : account ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
