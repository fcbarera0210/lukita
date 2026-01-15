'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema, createAccountSchema, AccountFormData } from '@/schemas/account.schema';
import { Account, AccountType } from '@/types/account';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { formatCLP, parseCLP } from '@/lib/clp';
import { ACCOUNT_COLORS, MAX_ACCOUNTS, getNextAvailableColor } from '@/lib/account-colors';

interface AccountFormProps {
  account?: Account;
  existingAccounts?: Account[];
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

export function AccountForm({ account, existingAccounts = [], onSubmit, onCancel }: AccountFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Verificar si se puede crear una nueva cuenta
  const canCreateAccount = existingAccounts.length < MAX_ACCOUNTS;
  const isAtLimit = existingAccounts.length >= MAX_ACCOUNTS;

  // Obtener colores usados por otras cuentas
  const usedColors = existingAccounts
    .filter(acc => acc.id !== account?.id) // Excluir la cuenta actual si estamos editando
    .map(acc => acc.color);

  // Color por defecto para nuevas cuentas
  const defaultColor = account?.color || getNextAvailableColor(usedColors);

  // Crear esquema dinámico con validación de nombres únicos
  const dynamicSchema = createAccountSchema(existingAccounts, account?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      name: account?.name || '',
      type: account?.type || 'efectivo',
      initialBalance: account?.initialBalance || 0,
      color: defaultColor,
    },
  });

  const initialBalance = watch('initialBalance');
  const selectedColor = watch('color');

  // Asignar color automáticamente cuando se carga el formulario
  useEffect(() => {
    if (!account && !selectedColor) {
      setValue('color', defaultColor);
    }
  }, [account, selectedColor, defaultColor, setValue]);

  const handleInitialBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseCLP(e.target.value);
    // Si el valor es NaN o el campo está vacío, establecer como 0
    setValue('initialBalance', isNaN(value) ? 0 : value);
  };

  const onFormSubmit = async (data: AccountFormData) => {
    // Validar límite de cuentas para nuevas cuentas
    if (!account && isAtLimit) {
      showToast({
        type: 'error',
        title: 'Límite alcanzado',
        description: `Solo se permiten un máximo de ${MAX_ACCOUNTS} cuentas`,
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        ...data,
        balance: data.initialBalance // Inicializar balance con el saldo inicial
      });
      showToast({
        type: 'success',
        title: account ? 'Cuenta actualizada' : 'Cuenta creada',
        description: `La cuenta "${data.name}" ha sido ${account ? 'actualizada' : 'creada'} exitosamente`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showToast({
        type: 'error',
        title: 'Error al guardar cuenta',
        description: `No se pudo guardar la cuenta: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Mensaje de límite de cuentas */}
      {!account && (
        <div className={`border rounded-lg p-3 ${
          existingAccounts.length >= 6 
            ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800' 
            : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
        }`}>
          <p className={`text-sm ${
            existingAccounts.length >= 6 
              ? 'text-yellow-800 dark:text-yellow-200' 
              : 'text-blue-800 dark:text-blue-200'
          }`}>
            <strong>Límite de cuentas:</strong> Puedes crear hasta {MAX_ACCOUNTS} cuentas. 
            Actualmente tienes {existingAccounts.length} de {MAX_ACCOUNTS} cuentas.
          </p>
        </div>
      )}

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
          Saldo inicial {account ? '(no editable)' : '(opcional)'}
        </label>
        <Input
          id="initialBalance"
          type="text"
          placeholder="0"
          value={initialBalance ? formatCLP(initialBalance) : ''}
          onChange={handleInitialBalanceChange}
          disabled={!!account} // Deshabilitar si se está editando
          className={account ? 'bg-muted cursor-not-allowed' : ''}
        />
        {account && (
          <p className="text-xs text-muted-foreground mt-1">
            El saldo inicial no se puede modificar después de crear la cuenta
          </p>
        )}
        {errors.initialBalance && (
          <p className="text-sm text-destructive mt-1">{errors.initialBalance.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium mb-2">
          Color de la cuenta
        </label>
        <div className="grid grid-cols-4 gap-2">
          {ACCOUNT_COLORS.map((color) => {
            const isUsed = usedColors.includes(color.id);
            const isSelected = selectedColor === color.id;
            
            return (
              <button
                key={color.id}
                type="button"
                disabled={isUsed}
                onClick={() => setValue('color', color.id)}
                className={`
                  relative w-full h-12 rounded-lg border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-gray-900 dark:border-gray-100 ring-2 ring-gray-400 dark:ring-gray-600' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }
                  ${isUsed 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer hover:scale-105'
                  }
                `}
                style={{ backgroundColor: color.value }}
                title={isUsed ? `${color.name} (en uso)` : color.name}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-900 dark:text-gray-100" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
                {isUsed && !isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {errors.color && (
          <p className="text-sm text-destructive mt-1">{errors.color.message}</p>
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
          disabled={isLoading || (!account && isAtLimit)}
          className="flex-1"
        >
          {isLoading ? 'Guardando...' : account ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
