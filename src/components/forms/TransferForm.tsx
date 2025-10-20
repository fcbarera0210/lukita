'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { formatCLP, parseCLP } from '@/lib/clp';
import { Account } from '@/types/account';
import { transferSchema, TransferFormData } from '@/schemas/transfer.schema';
import { getAccountColorClass } from '@/lib/account-colors';

interface TransferFormProps {
  accounts: Account[];
  onSubmit: (data: TransferFormData) => Promise<void>;
  onCancel: () => void;
}

export function TransferForm({ accounts, onSubmit, onCancel }: TransferFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: '',
      toAccountId: '',
      amount: 0,
      note: '',
    },
  });

  const fromAccountId = watch('fromAccountId');
  const toAccountId = watch('toAccountId');
  const amount = watch('amount');

  const fromAccount = accounts.find(acc => acc.id === fromAccountId);
  const toAccount = accounts.find(acc => acc.id === toAccountId);

  const onFormSubmit = async (data: TransferFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      showToast({
        type: 'success',
        title: 'Transferencia realizada',
        description: 'La transferencia se ha realizado exitosamente',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo realizar la transferencia';
      showToast({
        type: 'error',
        title: 'Error en la transferencia',
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Cuenta Origen */}
      <div>
        <label className="block text-sm font-medium mb-1">Cuenta Origen</label>
        <Select
          {...register('fromAccountId')}
          className={errors.fromAccountId ? 'border-red-500' : ''}
        >
          <option value="">Seleccionar cuenta origen</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
        {errors.fromAccountId && (
          <p className="text-red-500 text-sm mt-1">{errors.fromAccountId.message}</p>
        )}
      </div>

      {/* Cuenta Destino */}
      <div>
        <label className="block text-sm font-medium mb-1">Cuenta Destino</label>
        <Select
          {...register('toAccountId')}
          className={errors.toAccountId ? 'border-red-500' : ''}
        >
          <option value="">Seleccionar cuenta destino</option>
          {accounts
            .filter(account => account.id !== fromAccountId) // Excluir cuenta origen
            .map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
        </Select>
        {errors.toAccountId && (
          <p className="text-red-500 text-sm mt-1">{errors.toAccountId.message}</p>
        )}
      </div>

      {/* Monto */}
      <div>
        <label className="block text-sm font-medium mb-1">Monto</label>
        <Input
          type="text" // Usar text para permitir formato CLP
          inputMode="numeric"
          {...register('amount', {
            setValueAs: (value) => parseCLP(value),
          })}
          value={amount ? formatCLP(amount) : ''}
          onChange={(e) => {
            const parsed = parseCLP(e.target.value);
            setValue('amount', parsed);
          }}
          className={errors.amount ? 'border-red-500' : ''}
          placeholder="$0"
        />
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      {/* Nota */}
      <div>
        <label className="block text-sm font-medium mb-1">Nota (opcional)</label>
        <Input
          {...register('note')}
          placeholder="Descripción de la transferencia"
        />
      </div>

      {/* Vista previa */}
      {fromAccount && toAccount && amount > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm">Vista previa de la transferencia:</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getAccountColorClass(fromAccount.color)}`}></div>
              <span className="text-sm">{fromAccount.name}</span>
            </div>
            <span className="text-sm font-medium text-red-500">
              -{formatCLP(amount)}
            </span>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getAccountColorClass(toAccount.color)}`}></div>
              <span className="text-sm">{toAccount.name}</span>
            </div>
            <span className="text-sm font-medium text-green-500">
              +{formatCLP(amount)}
            </span>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading || !fromAccountId || !toAccountId || amount <= 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Procesando...
            </>
          ) : (
            <>
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transferir
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
