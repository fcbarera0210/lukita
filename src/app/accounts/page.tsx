'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Wallet, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '@/lib/firestore';
import { Account } from '@/types/account';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AccountForm } from '@/components/forms/AccountForm';
import { useToast } from '@/components/ui/Toast';
import { formatCLP } from '@/lib/clp';
import { useFabContext } from '@/components/ConditionalLayout';

function AccountsPageContent() {
  const { user } = useAuth();
  const { setIsFormOpen } = useFabContext();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadAccounts = async () => {
    if (!user) return;
    
    try {
      const accountsData = await getAccounts(user.uid);
      setAccounts(accountsData);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'No se pudieron cargar las cuentas',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [user]);

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

  const handleCreateAccount = async (data: Omit<Account, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      await createAccount(user.uid, data);
      setIsModalOpen(false);
      await loadAccounts();
    } catch (error) {
      throw error; // Re-throw para que el formulario maneje el error
    }
  };

  const handleEditAccount = async (data: Omit<Account, 'id' | 'createdAt'>) => {
    if (!user || !editingAccount) return;
    
    try {
      await updateAccount(user.uid, editingAccount.id, data);
      setEditingAccount(null);
      await loadAccounts();
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
        <Button onClick={openCreateModal} size="icon" className="h-10 w-10">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No tienes cuentas</h3>
          <p className="text-muted-foreground mb-4">
            Crea tu primera cuenta para comenzar a gestionar tus finanzas
          </p>
          <Button onClick={openCreateModal}>
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
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {account.type.replace('_', ' ')}
                    </p>
                    {account.initialBalance !== undefined && (
                      <p className="text-lg font-semibold text-primary mt-1">
                        {formatCLP(account.initialBalance)}
                      </p>
                    )}
                  </div>

                  {/* Menu button */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleMenu(account.id)}
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