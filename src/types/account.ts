import { AccountColorId } from '@/lib/account-colors';

export type AccountType = 'efectivo' | 'cuenta_corriente' | 'tarjeta' | 'ahorro' | 'otro';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number; // Saldo inicial fijo, no cambia
  balance: number; // Balance actual que se actualiza con cada transacción
  color: AccountColorId;
  createdAt: number;
}
