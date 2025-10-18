import { z } from 'zod';

export const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'Debe seleccionar la cuenta origen'),
  toAccountId: z.string().min(1, 'Debe seleccionar la cuenta destino'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  note: z.string().optional(),
}).refine(
  (data) => data.fromAccountId !== data.toAccountId,
  {
    message: 'Las cuentas origen y destino deben ser diferentes',
    path: ['toAccountId'],
  }
);

export type TransferFormData = z.infer<typeof transferSchema>;