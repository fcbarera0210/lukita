export type AccountType = 'efectivo' | 'cuenta_corriente' | 'tarjeta' | 'ahorro' | 'otro';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  createdAt: number;
}
