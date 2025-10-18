import { z } from 'zod';
import { AccountType } from '@/types/account';
import { ACCOUNT_COLORS } from '@/lib/account-colors';

export const createAccountSchema = (existingAccounts: Array<{ id: string; name: string }>, editingAccountId?: string) => {
  return z.object({
    name: z.string()
      .min(1, 'El nombre es requerido')
      .max(50, 'El nombre es muy largo')
      .refine(
        (name) => {
          // Excluir la cuenta que se está editando
          const otherAccounts = existingAccounts.filter(acc => acc.id !== editingAccountId);
          return !otherAccounts.some(acc => acc.name.toLowerCase().trim() === name.toLowerCase().trim());
        },
        {
          message: 'Ya existe una cuenta con este nombre'
        }
      ),
    type: z.enum(['efectivo', 'cuenta_corriente', 'tarjeta', 'ahorro', 'otro'] as const),
    initialBalance: z.number().int().min(0, 'El saldo inicial debe ser positivo'),
    color: z.enum(['blue', 'cyan', 'green', 'orange', 'pink', 'purple', 'red', 'yellow'] as const, {
      message: 'Debe seleccionar un color'
    })
  });
};

// Esquema básico para casos donde no necesitamos validación de nombres únicos
export const accountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  type: z.enum(['efectivo', 'cuenta_corriente', 'tarjeta', 'ahorro', 'otro'] as const),
  initialBalance: z.number().int().min(0, 'El saldo inicial debe ser positivo'),
  color: z.enum(['blue', 'cyan', 'green', 'orange', 'pink', 'purple', 'red', 'yellow'] as const, {
    message: 'Debe seleccionar un color'
  })
});

export type AccountFormData = z.infer<typeof accountSchema>;
