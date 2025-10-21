'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Wallet, Edit, Trash2, MoreVertical, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getAccounts, createAccount, updateAccount, deleteAccount, getTransactions } from '@/lib/firestore';
import { Account } from '@/types/account';
import { Transaction } from '@/types/transaction';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AccountForm } from '@/components/forms/AccountForm';
import { useToast } from '@/components/ui/Toast';
import { formatCLP } from '@/lib/clp';
import { useFabContext } from '@/components/ConditionalLayout';
import { MAX_ACCOUNTS, getAccountColorClass, getAccountBackgroundClass, getAccountTextClass } from '@/lib/account-colors';
import { addCustomEventListener, CUSTOM_EVENTS, dispatchCustomEvent } from '@/lib/custom-events';
import { CollapsibleDescription } from '@/components/CollapsibleDescription';

function AccountsPageContent() {
  const { user } = useAuth();
  const { setIsFormOpen } = useFabContext();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadAccounts = useCallback(async () => {
    if (!user) return;

    try {
      const [accountsData, transactionsData] = await Promise.all([
        getAccounts(user.uid),
        getTransactions(user.uid), // Cargar todas las transacciones para calcular balances
      ]);
      setAccounts(accountsData);
      setTransactions(transactionsData);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'No se pudieron cargar las cuentas',
      });
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  // Función para calcular el balance real de una cuenta
  const calculateAccountBalance = (accountId: string, initialBalance: number) => {
    const accountTransactions = transactions.filter(t => t.accountId === accountId);
    
    console.log(`🔍 Debug Accounts - Cuenta ${accountId}:`);
    console.log(`🔍 Debug Accounts - Saldo inicial usado:`, initialBalance);
    console.log(`🔍 Debug Accounts - Transacciones encontradas:`, accountTransactions.length);
    console.log(`🔍 Debug Accounts - Transacciones:`, accountTransactions.map(t => ({ type: t.type, amount: t.amount, note: t.note })));
    
    const balance = accountTransactions.reduce((sum, transaction) => {
      if (transaction.type === 'ingreso') {
        return sum + transaction.amount;
      } else {
        return sum - transaction.amount;
      }
    }, initialBalance);
    
    console.log(`🔍 Debug Accounts - Balance calculado:`, balance);
    return balance;
  };

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Detectar parámetro new y abrir modal automáticamente
  useEffect(() => {
    const shouldOpenModal = searchParams.get('new') === 'true';
    if (shouldOpenModal) {
      setIsModalOpen(true);
      // Limpiar la URL sin recargar la página
      const url = new URL(window.location.href);
      url.searchParams.delete('new');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  // Escuchar eventos de actualización de cuentas desde otros componentes
  useEffect(() => {
    const removeListener = addCustomEventListener(CUSTOM_EVENTS.REFRESH_ACCOUNTS, () => {
      loadAccounts();
    });

    return removeListener;
  }, [loadAccounts]);

  // Escuchar eventos de actualización de transacciones para actualizar balances
  useEffect(() => {
    const removeListener = addCustomEventListener(CUSTOM_EVENTS.REFRESH_TRANSACTIONS, () => {
      loadAccounts(); // Recargar cuentas para actualizar balances
    });

    return removeListener;
  }, [loadAccounts]);

  const handleCreateAccount = async (data: Omit<Account, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      await createAccount(user.uid, data);
      await loadAccounts(); // Cargar cuentas antes de cerrar el modal
      setIsModalOpen(false);
      setIsFormOpen(false); // Restaurar el FAB
      // Disparar evento para actualizar dashboard sin afectar el FAB
      dispatchCustomEvent(CUSTOM_EVENTS.REFRESH_DASHBOARD);
    } catch (error) {
      throw error; // Re-throw para que el formulario maneje el error
    }
  };

  const handleEditAccount = async (data: Omit<Account, 'id' | 'createdAt'>) => {
    if (!user || !editingAccount) return;
    
    try {
      // Al editar, solo actualizar los campos que pueden cambiar, no el balance
      const { balance, ...updateData } = data;
      await updateAccount(user.uid, editingAccount.id, updateData);
      await loadAccounts(); // Cargar cuentas antes de cerrar el modal
      setEditingAccount(null);
      setIsModalOpen(false);
      setIsFormOpen(false); // Restaurar el FAB
      // Disparar evento para actualizar dashboard
      dispatchCustomEvent(CUSTOM_EVENTS.REFRESH_DASHBOARD);
    } catch (error) {
      throw error; // Re-throw para que el formulario maneje el error
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!user) return;
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) {
      return;
    }

    try {
      await deleteAccount(user.uid, accountId);
      showToast({
        type: 'success',
        title: 'Cuenta eliminada',
        description: 'La cuenta ha sido eliminada exitosamente',
      });
      await loadAccounts();
      // Disparar evento para actualizar otros componentes
      dispatchCustomEvent(CUSTOM_EVENTS.REFRESH_ACCOUNTS);
      dispatchCustomEvent(CUSTOM_EVENTS.REFRESH_DASHBOARD);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'No se pudo eliminar la cuenta',
      });
    }
  };

  const openCreateModal = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
    setIsFormOpen(true);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    setIsFormOpen(false);
  };

  const toggleMenu = (accountId: string) => {
    setOpenMenuId(openMenuId === accountId ? null : accountId);
  };

  const closeMenu = () => {
    setOpenMenuId(null);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
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
          <Wallet className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Cuentas</h1>
        </div>
        <Button 
          onClick={openCreateModal} 
          size="icon" 
          className="h-10 w-10"
          disabled={accounts.length >= MAX_ACCOUNTS}
          title={accounts.length >= MAX_ACCOUNTS ? `Máximo ${MAX_ACCOUNTS} cuentas permitidas` : 'Crear nueva cuenta'}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Page Description */}
      <CollapsibleDescription
        title="Gestión de Cuentas"
        description="Gestiona todas tus cuentas bancarias y de efectivo. Crea hasta 8 cuentas con colores únicos para fácil identificación. Cada cuenta muestra su balance actual que se actualiza automáticamente con cada transacción. Las transferencias entre cuentas se reflejan aquí."
        icon={<Building2 className="h-5 w-5 text-primary" />}
      />

      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No tienes cuentas</h3>
          <p className="text-muted-foreground mb-4">
            Crea tu primera cuenta para comenzar a gestionar tus finanzas
          </p>
          <Button 
            onClick={openCreateModal}
            disabled={accounts.length >= MAX_ACCOUNTS}
          >
            Crear primera cuenta
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => {
            const isMenuOpen = openMenuId === account.id;
            
            return (
              <div
                key={account.id}
                className={`border-2 ${getAccountColorClass(account.color)} ${getAccountBackgroundClass(account.color)} rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium ${getAccountTextClass(account.color)}`}>{account.name}</h3>
                    <p className={`text-sm ${getAccountTextClass(account.color)} opacity-70 capitalize`}>
                      {account.type.replace('_', ' ')}
                    </p>
                    {account.initialBalance !== undefined && (
                      <p className={`text-lg font-semibold text-primary mt-1`}>
                        {formatCLP(account.balance || 0)}
                      </p>
                    )}
                  </div>

                  {/* Menu button */}
                  <div className="relative">
                    <button
                      onClick={() => toggleMenu(account.id)}
                      className="h-8 w-8 rounded-md hover:bg-white/20 flex items-center justify-center"
                    >
                      <MoreVertical 
                        className="h-4 w-4" 
                        style={{ 
                          color: getAccountTextClass(account.color).includes('blue') ? '#1e40af' : 
                                 getAccountTextClass(account.color).includes('green') ? '#166534' :
                                 getAccountTextClass(account.color).includes('red') ? '#991b1b' :
                                 getAccountTextClass(account.color).includes('yellow') ? '#a16207' :
                                 getAccountTextClass(account.color).includes('purple') ? '#6b21a8' :
                                 getAccountTextClass(account.color).includes('pink') ? '#be185d' :
                                 getAccountTextClass(account.color).includes('cyan') ? '#155e75' :
                                 getAccountTextClass(account.color).includes('orange') ? '#c2410c' : '#000000'
                        }}
                      />
                    </button>

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
                              openEditModal(account);
                              closeMenu();
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteAccount(account.id);
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
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAccount ? 'Editar cuenta' : 'Nueva cuenta'}
      >
        <AccountForm
          account={editingAccount || undefined}
          existingAccounts={accounts}
          onSubmit={editingAccount ? handleEditAccount : handleCreateAccount}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AccountsPageContent />
    </Suspense>
  );
}