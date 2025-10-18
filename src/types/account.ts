import { AccountColorId } from '@/lib/account-colors';

export type AccountType = 'efectivo' | 'cuenta_corriente' | 'tarjeta' | 'ahorro' | 'otro';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  color: AccountColorId;
  createdAt: number;
}
