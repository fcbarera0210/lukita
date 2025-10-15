'use client';

import { useEffect, useState } from 'react';
import { Plus, Wallet, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '@/lib/firestore';
import { Account } from '@/types/account';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AccountForm } from '@/components/forms/AccountForm';
import { useToast } from '@/components/ui/Toast';
import { formatCLP } from '@/lib/clp';

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
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
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
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
        <h1 className="text-2xl font-bold">Cuentas</h1>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva cuenta
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
          {accounts.map((account) => (
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditModal(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
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