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
  writeBatch,
  deleteField
} from 'firebase/firestore';
import { db } from './firebase';
import { Account } from '@/types/account';
import { Category } from '@/types/category';
import { Transaction } from '@/types/transaction';
import { Transfer } from '@/types/transfer';

// ===== BALANCE MANAGEMENT =====

/**
 * Actualiza el balance de una cuenta basado en todas sus transacciones
 */
export const updateAccountBalance = async (userId: string, accountId: string): Promise<void> => {
  const transactions = await getTransactions(userId);
  const accountTransactions = transactions.filter(t => t.accountId === accountId);
  
  // Obtener el saldo inicial de la cuenta
  const accountDoc = await getDoc(doc(db, 'users', userId, 'accounts', accountId));
  if (!accountDoc.exists()) return;
  
  const account = accountDoc.data() as Account;
  const initialBalance = account.initialBalance;
  
  // Calcular el balance actual
  const currentBalance = accountTransactions.reduce((sum, transaction) => {
    if (transaction.type === 'ingreso') {
      return sum + transaction.amount;
    } else {
      return sum - transaction.amount;
    }
  }, initialBalance);
  
  // Actualizar el balance en la cuenta
  await updateDoc(doc(db, 'users', userId, 'accounts', accountId), {
    balance: currentBalance
  });
  
  console.log(`🔍 Debug Balance Update - Cuenta ${accountId}: ${initialBalance} + transacciones = ${currentBalance}`);
};

/**
 * Migra cuentas existentes para agregar campo balance y eliminar originalInitialBalance
 */
export const migrateAccountsToNewBalanceSystem = async (userId: string): Promise<void> => {
  console.log('🔍 Debug Migration - Iniciando migración a nuevo sistema de balance');
  const accounts = await getAccounts(userId);
  console.log('🔍 Debug Migration - Cuentas encontradas:', accounts.length);
  
  for (const account of accounts) {
    await updateAccountBalance(userId, account.id);
    
    // Eliminar originalInitialBalance si existe
    const accountRef = doc(db, 'users', userId, 'accounts', account.id);
    const accountDoc = await getDoc(accountRef);
    if (accountDoc.exists()) {
      const data = accountDoc.data();
      if (data.originalInitialBalance !== undefined) {
        await updateDoc(accountRef, {
          originalInitialBalance: deleteField()
        });
        console.log('🔍 Debug Migration - Eliminado originalInitialBalance de:', account.name);
      }
    }
  }
  
  console.log('🔍 Debug Migration - Migración completada');
};

// ===== ACCOUNTS =====

export const createAccount = async (userId: string, accountData: Omit<Account, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'users', userId, 'accounts'), {
    ...accountData,
    balance: accountData.initialBalance, // Inicializar balance con el saldo inicial
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
  
  // Actualizar el balance de la cuenta
  await updateAccountBalance(userId, transactionData.accountId);
  
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
  // Obtener la transacción actual para saber qué cuenta afectar
  const transactionDoc = await getDoc(doc(db, 'users', userId, 'transactions', transactionId));
  if (!transactionDoc.exists()) {
    throw new Error('Transacción no encontrada');
  }
  
  const currentTransaction = transactionDoc.data() as Transaction;
  const accountId = currentTransaction.accountId;
  
  // Actualizar la transacción
  await updateDoc(doc(db, 'users', userId, 'transactions', transactionId), updates);
  
  // Actualizar el balance de la cuenta afectada
  await updateAccountBalance(userId, accountId);
  
  console.log(`🔍 Debug Update Transaction - Transacción ${transactionId} actualizada, balance de cuenta ${accountId} recalculado`);
};

export const deleteTransaction = async (userId: string, transactionId: string): Promise<void> => {
  // Obtener la transacción actual para saber qué cuenta afectar
  const transactionDoc = await getDoc(doc(db, 'users', userId, 'transactions', transactionId));
  if (!transactionDoc.exists()) {
    throw new Error('Transacción no encontrada');
  }
  
  const currentTransaction = transactionDoc.data() as Transaction;
  const accountId = currentTransaction.accountId;
  
  // Eliminar la transacción
  await deleteDoc(doc(db, 'users', userId, 'transactions', transactionId));
  
  // Actualizar el balance de la cuenta afectada
  await updateAccountBalance(userId, accountId);
  
  console.log(`🔍 Debug Delete Transaction - Transacción ${transactionId} eliminada, balance de cuenta ${accountId} recalculado`);
};

// ===== TRANSFERS =====

/**
 * Calcula el balance real de una cuenta basado en su saldo inicial original y todas las transacciones
 */
const calculateAccountBalance = async (userId: string, accountId: string, originalInitialBalance: number): Promise<number> => {
  const transactions = await getTransactions(userId);
  console.log(`🔍 Debug Balance - Total transacciones del usuario:`, transactions.length);
  console.log(`🔍 Debug Balance - Transacciones con accountId ${accountId}:`, transactions.filter(t => t.accountId === accountId).length);
  
  const accountTransactions = transactions.filter(t => t.accountId === accountId);
  
  console.log(`🔍 Debug Balance - Cuenta ${accountId}:`);
  console.log(`🔍 Debug Balance - Saldo inicial usado:`, originalInitialBalance);
  console.log(`🔍 Debug Balance - Transacciones encontradas:`, accountTransactions.length);
  console.log(`🔍 Debug Balance - Transacciones:`, accountTransactions.map(t => ({ type: t.type, amount: t.amount, note: t.note })));
  
  const balance = accountTransactions.reduce((sum, transaction) => {
    if (transaction.type === 'ingreso') {
      return sum + transaction.amount;
    } else {
      return sum - transaction.amount;
    }
  }, originalInitialBalance);
  
  console.log(`🔍 Debug Balance - Balance calculado:`, balance);
  return balance;
};

export const createTransfer = async (userId: string, transferData: Omit<Transfer, 'id' | 'createdAt'>): Promise<string> => {
  console.log('🔍 Debug Transfer - Iniciando transferencia para userId:', userId);
  console.log('🔍 Debug Transfer - TransferData:', transferData);
  
  // Migrar cuentas al nuevo sistema si es necesario
  await migrateAccountsToNewBalanceSystem(userId);
  
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

  console.log('🔍 Debug Transfer - Cuenta origen:', fromAccount.name, 'Balance actual:', fromAccount.balance);
  console.log('🔍 Debug Transfer - Cuenta destino:', toAccount.name, 'Balance actual:', toAccount.balance);
  console.log('🔍 Debug Transfer - Monto a transferir:', transferData.amount);

  // Verificar que la cuenta origen tenga suficiente saldo
  if (fromAccount.balance < transferData.amount) {
    throw new Error(`Saldo insuficiente en la cuenta origen. Saldo disponible: $${fromAccount.balance.toLocaleString('es-CL')}, Monto solicitado: $${transferData.amount.toLocaleString('es-CL')}`);
  }

  // Actualizar balances de las cuentas
  batch.update(doc(db, 'users', userId, 'accounts', transferData.fromAccountId), {
    balance: fromAccount.balance - transferData.amount
  });
  
  batch.update(doc(db, 'users', userId, 'accounts', transferData.toAccountId), {
    balance: toAccount.balance + transferData.amount
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
  // Obtener la transferencia para saber qué cuentas afectar
  const transferDoc = await getDoc(doc(db, 'users', userId, 'transfers', transferId));
  if (!transferDoc.exists()) {
    throw new Error('Transferencia no encontrada');
  }
  
  const transfer = transferDoc.data() as Transfer;
  const fromAccountId = transfer.fromAccountId;
  const toAccountId = transfer.toAccountId;
  
  // Buscar y eliminar las transacciones asociadas a esta transferencia
  const transactionsQuery = query(
    collection(db, 'users', userId, 'transactions'),
    where('note', '>=', `Transferencia`),
    where('note', '<=', `Transferencia\uf8ff`)
  );
  
  const transactionsSnapshot = await getDocs(transactionsQuery);
  const transferTransactions = transactionsSnapshot.docs.filter(doc => {
    const note = doc.data().note;
    return note && (
      note.includes(`Transferencia a ${transfer.toAccountId}`) ||
      note.includes(`Transferencia desde ${transfer.fromAccountId}`)
    );
  });
  
  const batch = writeBatch(db);
  
  // Eliminar las transacciones asociadas
  transferTransactions.forEach(transactionDoc => {
    batch.delete(transactionDoc.ref);
  });
  
  // Eliminar la transferencia
  batch.delete(doc(db, 'users', userId, 'transfers', transferId));
  
  await batch.commit();
  
  // Actualizar los balances de ambas cuentas
  await updateAccountBalance(userId, fromAccountId);
  await updateAccountBalance(userId, toAccountId);
  
  console.log(`🔍 Debug Delete Transfer - Transferencia ${transferId} eliminada, balances de cuentas ${fromAccountId} y ${toAccountId} recalculados`);
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
