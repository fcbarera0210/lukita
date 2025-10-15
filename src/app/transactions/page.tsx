'use client';

import { useEffect, useState } from 'react';
import { Plus, CreditCard, Edit, Trash2, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '@/lib/firestore';
import { getAccounts } from '@/lib/firestore';
import { getCategories } from '@/lib/firestore';
import { Transaction } from '@/types/transaction';
import { Account } from '@/types/account';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { useToast } from '@/components/ui/Toast';
import { formatCLP } from '@/lib/clp';
import { formatDate } from '@/lib/dates';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    accountId: '',
    categoryId: '',
    startDate: '',
    endDate: '',
  });
  const { showToast } = useToast();

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [transactionsData, accountsData, categoriesData] = await Promise.all([
        getTransactions(user.uid),
        getAccounts(user.uid),
        getCategories(user.uid),
      ]);

      setTransactions(transactionsData);
      setAccounts(accountsData);
      setCategories(categoriesData);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'No se pudieron cargar los datos',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      await createTransaction(user.uid, data);
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      throw error; // Re-throw para que el formulario maneje el error
    }
  };

  const handleEditTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user || !editingTransaction) return;
    
    try {
      await updateTransaction(user.uid, editingTransaction.id, data);
      setEditingTransaction(null);
      await loadData();
    } catch (error) {
      throw error; // Re-throw para que el formulario maneje el error
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) return;
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      return;
    }

    try {
      await deleteTransaction(user.uid, transactionId);
      showToast({
        type: 'success',
        title: 'Transacción eliminada',
        description: 'La transacción ha sido eliminada exitosamente',
      });
      await loadData();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'No se pudo eliminar la transacción',
      });
    }
  };

  const openCreateModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Filtrar transacciones
  const filteredTransactions = transactions.filter(transaction => {
    if (filters.type && transaction.type !== filters.type) return false;
    if (filters.accountId && transaction.accountId !== filters.accountId) return false;
    if (filters.categoryId && transaction.categoryId !== filters.categoryId) return false;
    if (filters.startDate && transaction.date < new Date(filters.startDate).getTime()) return false;
    if (filters.endDate && transaction.date > new Date(filters.endDate).getTime()) return false;
    return true;
  });

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.name || 'Cuenta desconocida';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Categoría desconocida';
  };

  if (loading) {
    return (
      
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-card rounded-lg"></div>
            ))}
          </div>
        </div>
      
    );
  }

  return (
    
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Transacciones</h1>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva transacción
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4" />
            <h3 className="font-medium">Filtros</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <Select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="ingreso">Ingresos</option>
                <option value="gasto">Gastos</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cuenta</label>
              <Select
                value={filters.accountId}
                onChange={(e) => setFilters(prev => ({ ...prev, accountId: e.target.value }))}
              >
                <option value="">Todas</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <Select
                value={filters.categoryId}
                onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha desde</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {transactions.length === 0 ? 'No tienes transacciones' : 'No hay transacciones que coincidan con los filtros'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {transactions.length === 0 
                ? 'Crea tu primera transacción para comenzar a registrar tus movimientos'
                : 'Ajusta los filtros para ver más transacciones'
              }
            </p>
            {transactions.length === 0 && (
              <Button onClick={openCreateModal}>
                Crear primera transacción
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'ingreso' 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {transaction.type === 'ingreso' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {transaction.note || getCategoryName(transaction.categoryId)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{getAccountName(transaction.accountId)}</span>
                        <span>•</span>
                        <span>{formatDate(new Date(transaction.date))}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'ingreso' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'ingreso' ? '+' : '-'}
                        {formatCLP(transaction.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingTransaction ? 'Editar transacción' : 'Nueva transacción'}
        >
          <TransactionForm
            transaction={editingTransaction || undefined}
            accounts={accounts}
            categories={categories}
            onSubmit={editingTransaction ? handleEditTransaction : handleCreateTransaction}
            onCancel={closeModal}
          />
        </Modal>
      </div>
    
  );
}
