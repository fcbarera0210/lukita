import { z } from 'zod';
import { AccountType } from '@/types/account';

export const accountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  type: z.enum(['efectivo', 'cuenta_corriente', 'tarjeta', 'ahorro', 'otro'] as const),
  initialBalance: z.number().int().min(0, 'El saldo inicial debe ser positivo')
});

export type AccountFormData = z.infer<typeof accountSchema>;
