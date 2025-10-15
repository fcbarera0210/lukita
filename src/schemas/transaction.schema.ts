import { z } from 'zod';
import { TxType } from '@/types/transaction';

export const transactionSchema = z.object({
  type: z.enum(['ingreso', 'gasto'] as const),
  amount: z.number().int().min(1, 'El monto debe ser mayor a 0'),
  date: z.number().min(0, 'Fecha inválida'),
  accountId: z.string().min(1, 'Debe seleccionar una cuenta'),
  categoryId: z.string().min(1, 'Debe seleccionar una categoría'),
  note: z.string().max(200, 'La nota es muy larga').optional()
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
