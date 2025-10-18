export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  note?: string;
  createdAt: number;
}

export interface TransferFormData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  note?: string;
}

export interface TransferDisplay {
  id: string;
  fromAccount: {
    id: string;
    name: string;
    color: string;
  };
  toAccount: {
    id: string;
    name: string;
    color: string;
  };
  amount: number;
  note?: string;
  createdAt: number;
}