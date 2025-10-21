'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useFabContext } from '@/components/ConditionalLayout';
import { 
  Home, 
  CreditCard, 
  Wallet, 
  Tag, 
  Settings,
  Plus,
  ArrowRightLeft,
  TrendingUp,
  PieChart,
  CalendarClock,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { getAccounts, getCategories, createTransaction, createAccount, createCategory, createTransfer } from '@/lib/firestore';
import { Account } from '@/types/account';
import { Category } from '@/types/category';
import { Transaction } from '@/types/transaction';
import { TransferFormData } from '@/schemas/transfer.schema';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { AccountForm } from '@/components/forms/AccountForm';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { TransferForm } from '@/components/forms/TransferForm';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MAX_ACCOUNTS } from '@/lib/account-colors';
import { dispatchCustomEvent, CUSTOM_EVENTS, addCustomEventListener } from '@/lib/custom-events';

// Elementos principales de navegación (siempre visibles)
const primaryNavigationItems = [
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
    name: 'Ajustes',
    href: '/settings',
    icon: Settings,
  },
];

// Elementos secundarios (en menú "Más")
const secondaryNavigationItems = [
  {
    name: 'Categorías',
    href: '/categories',
    icon: Tag,
  },
  {
    name: 'Tendencias',
    href: '/trends',
    icon: TrendingUp,
  },
  {
    name: 'Presupuestos',
    href: '/budgets',
    icon: PieChart,
  },
  {
    name: 'Recurrentes',
    href: '/recurring',
    icon: CalendarClock,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Verificar si algún elemento secundario está activo
  const isSecondaryActive = secondaryNavigationItems.some(item => pathname === item.href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="flex items-center justify-around py-3 pb-6 px-4">
        {/* Elementos principales */}
        {primaryNavigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 relative',
                    {
                      'text-primary bg-primary/10': isActive,
                      'text-muted-foreground hover:text-foreground hover:bg-muted/50': !isActive,
                    }
                  )}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium truncate">{item.name}</span>
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Link>
              );
        })}

        {/* Botón "Más" */}
        <button
          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          className={cn(
            'flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1 relative',
            {
              'text-primary': isMoreMenuOpen || isSecondaryActive,
              'text-muted-foreground hover:text-foreground': !isMoreMenuOpen && !isSecondaryActive,
            }
          )}
        >
          <MoreHorizontal className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium truncate">Más</span>
        </button>
      </div>

      {/* Menú desplegable "Más" */}
      {isMoreMenuOpen && (
        <div className="absolute bottom-full left-0 right-0 bg-card border-t border-border shadow-lg z-50 animate-in slide-in-from-bottom-2 duration-200">
          <div className="grid grid-cols-2 gap-2 p-4">
            {secondaryNavigationItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMoreMenuOpen(false)}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 hover:scale-105',
                    {
                      'text-primary bg-primary/10': isActive,
                      'text-muted-foreground hover:text-foreground hover:bg-muted/50': !isActive,
                    }
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className="h-6 w-6 mb-2" />
                  <span className="text-xs font-medium text-center">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Overlay para cerrar menú */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMoreMenuOpen(false)}
        />
      )}
    </nav>
  );
}

// Floating Action Button con menú desplegable
export function FloatingActionButton() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { setIsFormOpen } = useFabContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'transaction' | 'category' | 'account' | 'transfer' | null>(null);
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
    if (accounts.length >= MAX_ACCOUNTS) {
      showToast({
        type: 'error',
        title: 'Límite alcanzado',
        description: `Solo se permiten un máximo de ${MAX_ACCOUNTS} cuentas`,
      });
      return;
    }
    setActiveModal('account');
    setIsOpen(false);
  };

  const handleNewTransfer = () => {
    if (accounts.length < 2) {
      showToast({
        type: 'error',
        title: 'Cuentas insuficientes',
        description: 'Necesitas al menos 2 cuentas para realizar transferencias',
      });
      return;
    }
    setActiveModal('transfer');
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
        // Filtrar la categoría de transferencias (solo para el sistema)
        const filteredCategories = categoriesData.filter(category => 
          category.name !== 'transferencia entre cuentas'
        );
        setCategories(filteredCategories);
      } catch (error) {
        console.error('Error loading data for FAB:', error);
      }
    };

    loadData();
  }, [user]);

  // Escuchar eventos de actualización de cuentas para mantener el estado sincronizado
  useEffect(() => {
    const removeListener = addCustomEventListener(CUSTOM_EVENTS.REFRESH_ACCOUNTS, async () => {
      if (user) {
        try {
          const accountsData = await getAccounts(user.uid);
          setAccounts(accountsData);
        } catch (error) {
          console.error('Error updating accounts in FAB:', error);
        }
      }
    });

    return removeListener;
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
      setIsFormOpen(false); // ✅ Restaurar el FAB
      // Disparar eventos para actualizar otras páginas
      dispatchCustomEvent(CUSTOM_EVENTS.REFRESH_DASHBOARD);
      dispatchCustomEvent(CUSTOM_EVENTS.REFRESH_TRANSACTIONS);
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
      // Recargar cuentas
      const accountsData = await getAccounts(user.uid);
      setAccounts(accountsData);
      // Cerrar modal después de completar la operación
      setActiveModal(null);
      setIsFormOpen(false); // ✅ Restaurar el FAB
      // Disparar eventos para actualizar otras páginas
      dispatchCustomEvent(CUSTOM_EVENTS.REFRESH_DASHBOARD);
      dispatchCustomEvent(CUSTOM_EVENTS.REFRESH_ACCOUNTS);
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
      setIsFormOpen(false); // ✅ Restaurar el FAB
      // Recargar categorías
      const categoriesData = await getCategories(user.uid);
      // Filtrar la categoría de transferencias (solo para el sistema)
      const filteredCategories = categoriesData.filter(category => 
        category.name !== 'transferencia entre cuentas'
      );
      setCategories(filteredCategories);
      // Disparar eventos para actualizar otras páginas
      dispatchCustomEvent(CUSTOM_EVENTS.REFRESH_DASHBOARD);
      dispatchCustomEvent(CUSTOM_EVENTS.REFRESH_CATEGORIES);
    } catch (error) {
      throw error;
    }
  };

  const handleCreateTransfer = async (data: TransferFormData) => {
    if (!user) return;
    
    try {
      await createTransfer(user.uid, data);
      showToast({
        type: 'success',
        title: 'Transferencia realizada',
        description: 'La transferencia se ha realizado exitosamente',
      });
      setActiveModal(null);
      setIsFormOpen(false); // ✅ Restaurar el FAB
      // Disparar eventos para actualizar otras páginas
      dispatchCustomEvent(CUSTOM_EVENTS.REFRESH_DASHBOARD);
      dispatchCustomEvent(CUSTOM_EVENTS.REFRESH_ACCOUNTS);
      dispatchCustomEvent(CUSTOM_EVENTS.REFRESH_TRANSACTIONS);
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
      label: 'Transferir entre cuentas',
      icon: ArrowRightLeft,
      action: handleNewTransfer,
      disabled: accounts.length < 2,
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
      disabled: accounts.length >= MAX_ACCOUNTS,
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 space-y-2 z-50">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isDisabled = item.disabled || false;
            return (
              <button
                key={item.label}
                onClick={() => !isDisabled && item.action()}
                disabled={isDisabled}
                className={`flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 shadow-lg transition-colors min-w-[180px] w-full text-left ${
                  isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-muted cursor-pointer'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                title={isDisabled ? `Máximo ${MAX_ACCOUNTS} cuentas permitidas` : undefined}
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
          onClose={() => {
            setActiveModal(null);
            setIsFormOpen(false); // ✅ Restaurar el FAB
          }}
          title="Nueva Transacción"
        >
          <TransactionForm
            accounts={accounts}
            categories={categories}
            onSubmit={handleCreateTransaction}
            onCancel={() => {
              setActiveModal(null);
              setIsFormOpen(false); // ✅ Restaurar el FAB
            }}
          />
        </Modal>
      )}

      {activeModal === 'account' && (
        <Modal
          isOpen={true}
          onClose={() => {
            setActiveModal(null);
            setIsFormOpen(false); // ✅ Restaurar el FAB
          }}
          title="Nueva Cuenta"
        >
          <AccountForm
            existingAccounts={accounts}
            onSubmit={handleCreateAccount}
            onCancel={() => {
              setActiveModal(null);
              setIsFormOpen(false); // ✅ Restaurar el FAB
            }}
          />
        </Modal>
      )}

      {activeModal === 'category' && (
        <Modal
          isOpen={true}
          onClose={() => {
            setActiveModal(null);
            setIsFormOpen(false); // ✅ Restaurar el FAB
          }}
          title="Nueva Categoría"
        >
          <CategoryForm
            onSubmit={handleCreateCategory}
            onCancel={() => {
              setActiveModal(null);
              setIsFormOpen(false); // ✅ Restaurar el FAB
            }}
          />
        </Modal>
      )}

      {activeModal === 'transfer' && (
        <Modal
          isOpen={true}
          onClose={() => {
            setActiveModal(null);
            setIsFormOpen(false); // ✅ Restaurar el FAB
          }}
          title="Transferir entre Cuentas"
        >
          <TransferForm
            accounts={accounts}
            onSubmit={handleCreateTransfer}
            onCancel={() => {
              setActiveModal(null);
              setIsFormOpen(false); // ✅ Restaurar el FAB
            }}
          />
        </Modal>
      )}

    </div>
  );
}
