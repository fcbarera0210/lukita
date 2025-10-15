import { z } from 'zod';
import { CategoryKind } from '@/types/category';

export const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  kind: z.enum(['ingreso', 'gasto'] as const),
  icon: z.string().optional()
});

export type CategoryFormData = z.infer<typeof categorySchema>;
