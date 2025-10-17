'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  CreditCard, 
  Wallet, 
  Tag, 
  Settings,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { getAccounts, getCategories, createTransaction, createAccount, createCategory } from '@/lib/firestore';
import { Account } from '@/types/account';
import { Category } from '@/types/category';
import { Transaction } from '@/types/transaction';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { AccountForm } from '@/components/forms/AccountForm';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

const navigationItems = [
  {
    name: 'Inicio',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Transacciones',
    href: '/transactions',
    icon: CreditCard,
  },
  {
    name: 'Cuentas',
    href: '/accounts',
    icon: Wallet,
  },
  {
    name: 'Categorías',
    href: '/categories',
    icon: Tag,
  },
  {
    name: 'Ajustes',
    href: '/settings',
    icon: Settings,
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="flex items-center justify-around py-3 pb-6 px-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1',
                {
                  'text-primary': isActive,
                  'text-muted-foreground hover:text-foreground': !isActive,
                }
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Floating Action Button con menú desplegable
export function FloatingActionButton() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'transaction' | 'category' | 'account' | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const handleNewTransaction = () => {
    setActiveModal('transaction');
    setIsOpen(false);
  };

  const handleNewCategory = () => {
    setActiveModal('category');
    setIsOpen(false);
  };

  const handleNewAccount = () => {
    setActiveModal('account');
    setIsOpen(false);
  };

  // Cargar datos necesarios para los formularios
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        const [accountsData, categoriesData] = await Promise.all([
          getAccounts(user.uid),
          getCategories(user.uid),
        ]);
        setAccounts(accountsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data for FAB:', error);
      }
    };

    loadData();
  }, [user]);

  // Handlers para crear elementos
  const handleCreateTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      await createTransaction(user.uid, data);
      showToast({
        type: 'success',
        title: 'Transacción creada',
        description: 'La transacción ha sido creada exitosamente',
      });
      setActiveModal(null);
      // Disparar evento personalizado para actualizar dashboard
      window.dispatchEvent(new CustomEvent('refreshDashboard'));
    } catch (error) {
      throw error;
    }
  };

  const handleCreateAccount = async (data: Omit<Account, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      await createAccount(user.uid, data);
      showToast({
        type: 'success',
        title: 'Cuenta creada',
        description: 'La cuenta ha sido creada exitosamente',
      });
      setActiveModal(null);
      // Recargar cuentas
      const accountsData = await getAccounts(user.uid);
      setAccounts(accountsData);
      // Disparar evento personalizado para actualizar dashboard
      window.dispatchEvent(new CustomEvent('refreshDashboard'));
    } catch (error) {
      throw error;
    }
  };

  const handleCreateCategory = async (data: Omit<Category, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      await createCategory(user.uid, data);
      showToast({
        type: 'success',
        title: 'Categoría creada',
        description: 'La categoría ha sido creada exitosamente',
      });
      setActiveModal(null);
      // Recargar categorías
      const categoriesData = await getCategories(user.uid);
      setCategories(categoriesData);
      // Disparar evento personalizado para actualizar dashboard
      window.dispatchEvent(new CustomEvent('refreshDashboard'));
    } catch (error) {
      throw error;
    }
  };

  const menuItems = [
    {
      label: 'Nueva transacción',
      icon: Plus,
      action: handleNewTransaction,
    },
    {
      label: 'Nueva categoría',
      icon: Tag,
      action: handleNewCategory,
    },
    {
      label: 'Nueva cuenta',
      icon: Wallet,
      action: handleNewAccount,
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 space-y-2 z-50">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => item.action()}
                className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 shadow-lg hover:bg-muted transition-colors min-w-[180px] w-full text-left"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-all duration-200 transform hover:scale-105"
      >
        <Plus className={`h-6 w-6 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
      </button>

      {/* Overlay para cerrar menú */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Modales */}
      {activeModal === 'transaction' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="Nueva Transacción"
        >
          <TransactionForm
            accounts={accounts}
            categories={categories}
            onSubmit={handleCreateTransaction}
            onCancel={() => setActiveModal(null)}
          />
        </Modal>
      )}

      {activeModal === 'account' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="Nueva Cuenta"
        >
          <AccountForm
            onSubmit={handleCreateAccount}
            onCancel={() => setActiveModal(null)}
          />
        </Modal>
      )}

      {activeModal === 'category' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="Nueva Categoría"
        >
          <CategoryForm
            onSubmit={handleCreateCategory}
            onCancel={() => setActiveModal(null)}
          />
        </Modal>
      )}

    </div>
  );
}
