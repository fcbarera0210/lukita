'use client';

import { Transaction } from '@/types/transaction';

const QUEUE_KEY = 'lukita_offline_queue';
const CACHE_KEY = 'lukita_cache';

export interface OfflineTransaction extends Omit<Transaction, 'id' | 'createdAt'> {
  tempId: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

export interface CacheData {
  accounts: unknown[];
  categories: unknown[];
  transactions: unknown[];
  lastSync: number;
}

class OfflineQueue {
  private queue: OfflineTransaction[] = [];
  private cache: CacheData = {
    accounts: [],
    categories: [],
    transactions: [],
    lastSync: 0,
  };

  constructor() {
    this.loadFromStorage();
    this.setupOnlineListener();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const queueData = localStorage.getItem(QUEUE_KEY);
      if (queueData) {
        this.queue = JSON.parse(queueData);
      }

      const cacheData = localStorage.getItem(CACHE_KEY);
      if (cacheData) {
        this.cache = JSON.parse(cacheData);
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  private setupOnlineListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncQueue();
      });
    }
  }

  // Agregar transacción a la cola offline
  addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): string {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineTransaction: OfflineTransaction = {
      ...transaction,
      tempId,
      status: 'pending',
    };

    this.queue.push(offlineTransaction);
    this.saveToStorage();
    
    return tempId;
  }

  // Obtener cola de transacciones pendientes
  getQueue(): OfflineTransaction[] {
    return this.queue.filter(tx => tx.status === 'pending');
  }

  // Marcar transacción como sincronizada
  markAsSynced(tempId: string) {
    const transaction = this.queue.find(tx => tx.tempId === tempId);
    if (transaction) {
      transaction.status = 'synced';
      this.saveToStorage();
    }
  }

  // Marcar transacción como fallida
  markAsFailed(tempId: string) {
    const transaction = this.queue.find(tx => tx.tempId === tempId);
    if (transaction) {
      transaction.status = 'failed';
      this.saveToStorage();
    }
  }

  // Limpiar transacciones sincronizadas
  cleanSyncedTransactions() {
    this.queue = this.queue.filter(tx => tx.status !== 'synced');
    this.saveToStorage();
  }

  // Guardar datos en cache
  setCache(data: Partial<CacheData>) {
    this.cache = {
      ...this.cache,
      ...data,
      lastSync: Date.now(),
    };
    this.saveToStorage();
  }

  // Obtener datos del cache
  getCache(): CacheData {
    return this.cache;
  }

  // Verificar si hay conexión
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  // Sincronizar cola (simulado)
  async syncQueue(): Promise<void> {
    if (!this.isOnline()) return;

    const pendingTransactions = this.getQueue();
    
    for (const transaction of pendingTransactions) {
      try {
        // Aquí iría la lógica real de sincronización con Firebase
        // Por ahora simulamos el proceso
        transaction.status = 'syncing';
        this.saveToStorage();

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simular éxito
        this.markAsSynced(transaction.tempId);
      } catch (error) {
        console.error('Error syncing transaction:', error);
        this.markAsFailed(transaction.tempId);
      }
    }

    // Limpiar transacciones sincronizadas después de un tiempo
    setTimeout(() => {
      this.cleanSyncedTransactions();
    }, 5000);
  }

  // Obtener estado de sincronización
  getSyncStatus() {
    const pending = this.queue.filter(tx => tx.status === 'pending').length;
    const syncing = this.queue.filter(tx => tx.status === 'syncing').length;
    const failed = this.queue.filter(tx => tx.status === 'failed').length;

    return {
      pending,
      syncing,
      failed,
      isOnline: this.isOnline(),
      hasPendingChanges: pending > 0 || syncing > 0,
    };
  }
}

// Instancia singleton
export const offlineQueue = new OfflineQueue();

// Hook para usar la cola offline
export function useOfflineQueue() {
  return {
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => 
      offlineQueue.addTransaction(transaction),
    getQueue: () => offlineQueue.getQueue(),
    getCache: () => offlineQueue.getCache(),
    setCache: (data: Partial<CacheData>) => offlineQueue.setCache(data),
    isOnline: () => offlineQueue.isOnline(),
    getSyncStatus: () => offlineQueue.getSyncStatus(),
    syncQueue: () => offlineQueue.syncQueue(),
  };
}
