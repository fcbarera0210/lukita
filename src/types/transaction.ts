export type TxType = 'ingreso' | 'gasto';

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  date: number;
  accountId: string;
  categoryId: string;
  note?: string;
  createdAt: number;
}
