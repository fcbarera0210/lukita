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
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Account } from '@/types/account';
import { Category } from '@/types/category';
import { Transaction } from '@/types/transaction';

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
