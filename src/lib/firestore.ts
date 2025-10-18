import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Account } from '@/types/account';
import { Category } from '@/types/category';
import { Transaction } from '@/types/transaction';
import { Transfer } from '@/types/transfer';

// ===== ACCOUNTS =====

export const createAccount = async (userId: string, accountData: Omit<Account, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'users', userId, 'accounts'), {
    ...accountData,
    createdAt: Timestamp.now().toMillis()
  });
  return docRef.id;
};

export const getAccounts = async (userId: string): Promise<Account[]> => {
  const q = query(collection(db, 'users', userId, 'accounts'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Account));
};

export const updateAccount = async (userId: string, accountId: string, updates: Partial<Account>): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'accounts', accountId), updates);
};

export const deleteAccount = async (userId: string, accountId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'accounts', accountId));
};

// ===== CATEGORIES =====

export const createCategory = async (userId: string, categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'users', userId, 'categories'), {
    ...categoryData,
    createdAt: Timestamp.now().toMillis()
  });
  return docRef.id;
};

export const getCategories = async (userId: string): Promise<Category[]> => {
  const q = query(collection(db, 'users', userId, 'categories'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Category));
};

export const getCategoriesByKind = async (userId: string, kind: 'ingreso' | 'gasto'): Promise<Category[]> => {
  const q = query(
    collection(db, 'users', userId, 'categories'), 
    where('kind', '==', kind),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Category));
};

export const updateCategory = async (userId: string, categoryId: string, updates: Partial<Category>): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'categories', categoryId), updates);
};

export const deleteCategory = async (userId: string, categoryId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'categories', categoryId));
};

// ===== TRANSACTIONS =====

export const createTransaction = async (userId: string, transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'users', userId, 'transactions'), {
    ...transactionData,
    createdAt: Timestamp.now().toMillis()
  });
  return docRef.id;
};

export const getTransactions = async (userId: string, limitCount?: number): Promise<Transaction[]> => {
  let q = query(
    collection(db, 'users', userId, 'transactions'), 
    orderBy('date', 'desc')
  );
  
  if (limitCount) {
    q = query(q, limit(limitCount));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Transaction));
};

export const getTransactionsByAccount = async (userId: string, accountId: string): Promise<Transaction[]> => {
  const q = query(
    collection(db, 'users', userId, 'transactions'),
    where('accountId', '==', accountId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Transaction));
};

export const getTransactionsByDateRange = async (userId: string, startDate: number, endDate: number): Promise<Transaction[]> => {
  const q = query(
    collection(db, 'users', userId, 'transactions'),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Transaction));
};

export const updateTransaction = async (userId: string, transactionId: string, updates: Partial<Transaction>): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'transactions', transactionId), updates);
};

export const deleteTransaction = async (userId: string, transactionId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'transactions', transactionId));
};

// ===== TRANSFERS =====

export const createTransfer = async (userId: string, transferData: Omit<Transfer, 'id' | 'createdAt'>): Promise<string> => {
  const batch = writeBatch(db);
  
  // Crear la transferencia
  const transferRef = doc(collection(db, 'users', userId, 'transfers'));
  batch.set(transferRef, {
    ...transferData,
    createdAt: Timestamp.now(),
  });

  // Obtener las cuentas para actualizar balances
  const fromAccountRef = doc(db, 'users', userId, 'accounts', transferData.fromAccountId);
  const toAccountRef = doc(db, 'users', userId, 'accounts', transferData.toAccountId);
  
  const [fromAccountDoc, toAccountDoc] = await Promise.all([
    getDoc(fromAccountRef),
    getDoc(toAccountRef)
  ]);

  if (!fromAccountDoc.exists() || !toAccountDoc.exists()) {
    throw new Error('Una o ambas cuentas no existen');
  }

  const fromAccount = fromAccountDoc.data() as Account;
  const toAccount = toAccountDoc.data() as Account;

  // Calcular balance actual de la cuenta origen
  const fromAccountTransactions = await getTransactions(userId);
  const fromAccountBalance = fromAccountTransactions
    .filter(t => t.accountId === fromAccount.id)
    .reduce((sum, transaction) => {
      if (transaction.type === 'ingreso') {
        return sum + transaction.amount;
      } else {
        return sum - transaction.amount;
      }
    }, fromAccount.initialBalance);

  // Verificar que la cuenta origen tenga suficiente saldo
  if (fromAccountBalance < transferData.amount) {
    throw new Error('Saldo insuficiente en la cuenta origen');
  }

  // Calcular balance actual de la cuenta destino
  const toAccountBalance = fromAccountTransactions
    .filter(t => t.accountId === toAccount.id)
    .reduce((sum, transaction) => {
      if (transaction.type === 'ingreso') {
        return sum + transaction.amount;
      } else {
        return sum - transaction.amount;
      }
    }, toAccount.initialBalance);

  // Actualizar balances (usando initialBalance como campo de almacenamiento)
  batch.update(fromAccountRef, {
    initialBalance: fromAccountBalance - transferData.amount
  });
  
  batch.update(toAccountRef, {
    initialBalance: toAccountBalance + transferData.amount
  });

  // Crear transacciones automáticas para el historial
  const transferCategoryId = await getOrCreateTransferCategory(userId);
  
  // Transacción de débito (cuenta origen)
  const debitTransactionRef = doc(collection(db, 'users', userId, 'transactions'));
  batch.set(debitTransactionRef, {
    type: 'gasto',
    amount: transferData.amount,
    date: Timestamp.now().toMillis(),
    accountId: transferData.fromAccountId,
    categoryId: transferCategoryId,
    note: transferData.note || `Transferencia a ${toAccount.name}`,
    createdAt: Timestamp.now().toMillis(),
  });

  // Transacción de crédito (cuenta destino)
  const creditTransactionRef = doc(collection(db, 'users', userId, 'transactions'));
  batch.set(creditTransactionRef, {
    type: 'ingreso',
    amount: transferData.amount,
    date: Timestamp.now().toMillis(),
    accountId: transferData.toAccountId,
    categoryId: transferCategoryId,
    note: transferData.note || `Transferencia desde ${fromAccount.name}`,
    createdAt: Timestamp.now().toMillis(),
  });

  // Ejecutar todas las operaciones
  await batch.commit();
  
  console.log('✅ Transferencia creada exitosamente:', transferRef.id);
  console.log('✅ Transacciones automáticas creadas para historial');
  
  return transferRef.id;
};

export const getTransfers = async (userId: string): Promise<Transfer[]> => {
  const q = query(
    collection(db, 'users', userId, 'transfers'),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toMillis(),
  })) as Transfer[];
};

export const deleteTransfer = async (userId: string, transferId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'transfers', transferId));
};

// ===== HELPER FUNCTIONS =====

const getOrCreateTransferCategory = async (userId: string): Promise<string> => {
  // Buscar categoría de transferencias existente
  const q = query(
    collection(db, 'users', userId, 'categories'),
    where('name', '==', 'transferencia entre cuentas')
  );
  
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }
  
  // Crear nueva categoría de transferencias
  const categoryRef = await addDoc(collection(db, 'users', userId, 'categories'), {
    name: 'transferencia entre cuentas',
    icon: 'arrow-right-left',
    kind: 'transfer',
    createdAt: Timestamp.now(),
  });
  
  return categoryRef.id;
};
