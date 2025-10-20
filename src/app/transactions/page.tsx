'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, CreditCard, Edit, Trash2, Filter, TrendingUp, TrendingDown, MoreVertical, ChevronDown, ChevronUp, ArrowRightLeft, Receipt, Download } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, createTransfer } from '@/lib/firestore';
import { getAccounts } from '@/lib/firestore';
import { getCategories } from '@/lib/firestore';
import { Transaction } from '@/types/transaction';
import { Account } from '@/types/account';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { TransferForm } from '@/components/forms/TransferForm';
import { TransferFormData } from '@/schemas/transfer.schema';
import { useToast } from '@/components/ui/Toast';
import { formatCLP } from '@/lib/clp';
import { formatDate } from '@/lib/dates';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { useFabContext } from '@/components/ConditionalLayout';
import { getAccountColorClass } from '@/lib/account-colors';
import { PieChart } from '@/components/charts';
import { ExportData } from '@/components/ExportData';
import { addCustomEventListener, CUSTOM_EVENTS } from '@/lib/custom-events';
import { PageDescription } from '@/components/PageDescription';
import { AdvancedFilters, AdvancedFiltersState, SavedView } from '@/components/AdvancedFilters';
import { FilterActionButtons } from '@/components/FilterActionButtons';
import { 
  filterTransactions, 
  createDefaultFilters, 
  clearAllFilters, 
  saveViewToStorage, 
  getSavedViewsFromStorage, 
  deleteViewFromStorage,
  hasActiveFilters
} from '@/lib/advanced-filters';

export default function TransactionsPage() {
  const { user } = useAuth();
  const { setIsFormOpen } = useFabContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdvancedFiltersState>(createDefaultFilters());
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleExport = (data: Record<string, unknown>[], filename: string) => {
    showToast({
      type: 'success',
      title: 'Exportación exitosa',
      description: `Se exportaron ${data.length} transacciones en ${filename}`
    });
    setIsExportModalOpen(false);
    setIsFormOpen(false); // ✅ Restaurar FAB después de exportar
  };

  const loadData = useCallback(async () => {
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
      
      // Cargar vistas guardadas
      const views = getSavedViewsFromStorage(user.uid);
      setSavedViews(views);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'No se pudieron cargar los datos',
      });
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  // Funciones para manejar vistas guardadas
  const handleSaveView = useCallback((name: string, filters: AdvancedFiltersState) => {
    if (!user) return;
    
    try {
      const newView = saveViewToStorage(name, filters, user.uid);
      setSavedViews(prev => [...prev, newView]);
      showToast({
        type: 'success',
        title: 'Vista guardada',
        description: `La vista "${name}" se guardó correctamente`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'No se pudo guardar la vista'
      });
    }
  }, [user, showToast]);

  const handleLoadView = useCallback((view: SavedView) => {
    setFilters(view.filters);
    showToast({
      type: 'success',
      title: 'Vista cargada',
      description: `Se cargó la vista "${view.name}"`
    });
  }, [showToast]);

  const handleDeleteView = useCallback((viewId: string) => {
    if (!user) return;
    
    try {
      deleteViewFromStorage(viewId, user.uid);
      setSavedViews(prev => prev.filter(view => view.id !== viewId));
      showToast({
        type: 'success',
        title: 'Vista eliminada',
        description: 'La vista se eliminó correctamente'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'No se pudo eliminar la vista'
      });
    }
  }, [user, showToast]);

  const handleClearFilters = useCallback(() => {
    setFilters(clearAllFilters());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Escuchar eventos de actualización de transacciones
  useEffect(() => {
    const removeListener = addCustomEventListener(CUSTOM_EVENTS.REFRESH_TRANSACTIONS, () => {
      loadData();
    });

    return removeListener;
  }, [loadData]);

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
      setIsModalOpen(false); // Cerrar el modal después de editar
      setIsFormOpen(false); // ✅ Restaurar el FAB
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

  const handleCreateTransfer = async (data: TransferFormData) => {
    if (!user) return;
    
    try {
      await createTransfer(user.uid, data);
      setIsTransferModalOpen(false);
      setIsFormOpen(false); // ✅ Restaurar FAB
      await loadData();
      showToast({
        type: 'success',
        title: 'Transferencia realizada',
        description: 'La transferencia se ha realizado exitosamente',
      });
    } catch (error) {
      throw error; // Re-throw para que el formulario maneje el error
    }
  };

  const openCreateModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
    setIsFormOpen(true);
  };

  const openTransferModal = () => {
    if (accounts.length < 2) {
      showToast({
        type: 'error',
        title: 'Cuentas insuficientes',
        description: 'Necesitas al menos 2 cuentas para realizar transferencias',
      });
      return;
    }
    setIsTransferModalOpen(true);
    setIsFormOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setIsFormOpen(false);
  };

  const toggleMenu = (transactionId: string) => {
    setOpenMenuId(openMenuId === transactionId ? null : transactionId);
  };

  const closeMenu = () => {
    setOpenMenuId(null);
  };

  // Filtrar transacciones usando la nueva función avanzada
  const filteredTransactions = filterTransactions(transactions, filters);

  // Calcular datos para el gráfico de torta (solo gastos del mes actual, respetando filtros)
  const getMonthlyExpensesData = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime();
    
    // Usar transacciones filtradas pero solo gastos del mes actual
    const monthlyExpenses = filteredTransactions.filter(transaction => 
      transaction.type === 'gasto' && 
      transaction.date >= startOfMonth && 
      transaction.date <= endOfMonth
    );

    const categoryTotals = monthlyExpenses.reduce((acc, transaction) => {
      const categoryId = transaction.categoryId;
      if (!acc[categoryId]) {
        acc[categoryId] = { amount: 0, category: categories.find(c => c.id === categoryId) };
      }
      acc[categoryId].amount += transaction.amount;
      return acc;
    }, {} as Record<string, { amount: number; category: Category | undefined }>);

    const totalExpenses = Object.values(categoryTotals).reduce((sum, item) => sum + item.amount, 0);
    
    return Object.entries(categoryTotals)
      .filter(([_, data]) => data.category) // Solo categorías válidas
      .map(([categoryId, data]) => ({
        categoryId,
        amount: data.amount,
        category: data.category!,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount); // Ordenar por monto descendente
  };

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
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Transacciones</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={openTransferModal} 
              variant="outline" 
              size="icon" 
              className="h-10 w-10"
              title="Transferir entre cuentas"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            <Button onClick={openCreateModal} size="icon" className="h-10 w-10">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Page Description */}
        <PageDescription
          title="Gestión de Transacciones"
          description="Administra y revisa todas tus transacciones financieras. Puedes filtrar por fecha, categoría, cuenta y tipo de transacción. Visualiza tus gastos mensuales con el gráfico de torta, crea nuevas transacciones, edita las existentes y exporta tus datos para análisis externos."
          icon={<Receipt className="h-5 w-5 text-primary" />}
        />

        {/* Filtros */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Filtros</h2>
            </div>
            <div className="flex items-center gap-2">
              <FilterActionButtons
                filters={filters}
                savedViews={savedViews}
                onSaveView={handleSaveView}
                onLoadView={handleLoadView}
                onDeleteView={handleDeleteView}
              />
              <Button
                variant="outline"
                onClick={() => {
                  setIsExportModalOpen(true);
                  setIsFormOpen(true); // ✅ Ocultar FAB al abrir modal
                }}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
                title={showAdvancedFilters ? "Ocultar filtros" : "Mostrar filtros"}
              >
                {showAdvancedFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Componente de filtros avanzados */}
          <AdvancedFilters
            accounts={accounts}
            categories={categories}
            filters={filters}
            onFiltersChange={setFilters}
            isExpanded={showAdvancedFilters}
            onSaveView={handleSaveView}
            hasActiveFilters={hasActiveFilters(filters)}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Gráfico de Gastos Mensuales */}
        {getMonthlyExpensesData().length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Gastos del Mes</h2>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowChart(!showChart)}
                className="flex items-center gap-2"
              >
                {showChart ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Ocultar gráfico
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Ver gráfico
                  </>
                )}
              </Button>
            </div>
            
            {showChart && (
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <PieChart data={getMonthlyExpensesData()} />
                </div>
              </div>
            )}
          </div>
        )}

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
            {filteredTransactions.map((transaction) => {
              const category = categories.find(c => c.id === transaction.categoryId);
              const account = accounts.find(a => a.id === transaction.accountId);
              const CategoryIcon = getCategoryIcon(category?.icon);
              const isMenuOpen = openMenuId === transaction.id;
              const accountColorClass = account ? getAccountColorClass(account.color) : 'border-border';
              
              // Detectar si es una transferencia
              const isTransfer = category?.name === 'transferencia entre cuentas';
              
              return (
                <div
                  key={transaction.id}
                  className={`bg-card border-2 ${accountColorClass} rounded-lg p-4 ${
                    isTransfer ? 'border-l-4 border-r-4' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left side - Category icon */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-full ${isTransfer ? 'bg-blue-500/20' : 'bg-muted/50'}`}>
                        {isTransfer ? (
                          <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                        ) : (
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      
                      {/* Transaction details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground">
                          {transaction.note || category?.name || 'Sin descripción'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {account?.name || 'Cuenta desconocida'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(new Date(transaction.date))}
                        </p>
                      </div>
                    </div>

                    {/* Right side - Amount and menu */}
                    <div className="flex items-center gap-2">
                      {/* Amount with trend icon */}
                      <div className="flex items-center gap-1">
                        {transaction.type === 'ingreso' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`font-semibold ${
                          transaction.type === 'ingreso' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatCLP(transaction.amount)}
                        </span>
                      </div>

                      {/* Menu button */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleMenu(transaction.id)}
                          className="h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>

                        {/* Dropdown menu */}
                        {isMenuOpen && (
                          <>
                            {/* Overlay to close menu */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={closeMenu}
                            />
                            <div className="absolute right-0 top-8 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                              <button
                                onClick={() => {
                                  openEditModal(transaction);
                                  closeMenu();
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteTransaction(transaction.id);
                                  closeMenu();
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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

        <Modal
          isOpen={isTransferModalOpen}
          onClose={() => {
            setIsTransferModalOpen(false);
            setIsFormOpen(false); // ✅ Restaurar FAB al cerrar
          }}
          title="Transferir entre Cuentas"
        >
          <TransferForm
            accounts={accounts}
            onSubmit={handleCreateTransfer}
            onCancel={() => {
              setIsTransferModalOpen(false);
              setIsFormOpen(false); // ✅ Restaurar FAB al cancelar
            }}
          />
        </Modal>

        {/* Modal de Exportación */}
        <Modal
          isOpen={isExportModalOpen}
          onClose={() => {
            setIsExportModalOpen(false);
            setIsFormOpen(false); // ✅ Restaurar FAB al cerrar modal
          }}
          title="Exportar Transacciones"
        >
          <ExportData
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            onExport={handleExport}
          />
        </Modal>
      </div>
    );
  }
