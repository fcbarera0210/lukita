'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getAccounts, getCategories, createTransaction } from '@/lib/firestore';
import { Account } from '@/types/account';
import { Category } from '@/types/category';
import { Transaction } from '@/types/transaction';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, LogIn } from 'lucide-react';
import { 
  parseTransactionType, 
  parseAmount, 
  findCategoryByName, 
  findAccountByName,
  parseTransactionUrlParams 
} from '@/lib/url-parsing';

function NewTransactionPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [, setLoading] = useState(true);

  // Obtener parámetros de la URL usando las nuevas utilidades
  const urlParams = parseTransactionUrlParams(searchParams);
  const urlType = parseTransactionType(urlParams.type);
  const urlAmount = parseAmount(urlParams.amount);
  const urlNote = urlParams.note || '';
  const urlCategoryId = urlParams.categoryId || '';
  const urlAccountId = urlParams.accountId || '';
  const urlCategoryName = urlParams.category || '';
  const urlAccountName = urlParams.account || '';

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

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
        showToast({
          type: 'error',
          title: 'Error',
          description: 'No se pudieron cargar los datos',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, showToast]);

  const handleCreateTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      await createTransaction(user.uid, data);
      showToast({
        type: 'success',
        title: 'Transacción creada',
        description: 'La transacción ha sido creada exitosamente',
      });
      router.push('/transactions');
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/transactions');
  };

  // Preparar valores por defecto basados en parámetros URL
  const defaultValues = useMemo(() => {
    // Buscar categoría por ID o por nombre usando la nueva utilidad
    let categoryId = urlCategoryId || '';
    if (!categoryId && urlCategoryName && categories.length > 0) {
      categoryId = findCategoryByName(urlCategoryName, categories);
    }

    // Buscar cuenta por ID o por nombre usando la nueva utilidad
    let accountId = urlAccountId || '';
    if (!accountId && urlAccountName && accounts.length > 0) {
      accountId = findAccountByName(urlAccountName, accounts);
    }

    return {
      type: urlType || 'gasto',
      amount: urlAmount,
      date: Date.now(),
      accountId,
      categoryId,
      note: urlNote,
    };
  }, [urlType, urlAmount, urlNote, urlCategoryId, urlAccountId, urlCategoryName, urlAccountName, categories, accounts]);

  // Mostrar loading solo si authLoading es true
  if (authLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-card rounded"></div>
          <div className="h-64 bg-card rounded"></div>
        </div>
      </div>
    );
  }

  // Validar si el usuario está autenticado
  if (!user) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Nueva Transacción</h1>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <LogIn className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Inicia sesión requerido</h2>
          <p className="text-muted-foreground mb-6">
            Para crear una transacción, primero debes iniciar sesión en tu cuenta.
          </p>
          <Button 
            onClick={() => router.push('/login')}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Ir al Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Nueva Transacción</h1>
      </div>

      <TransactionForm
        accounts={accounts}
        categories={categories}
        onSubmit={handleCreateTransaction}
        onCancel={handleCancel}
        defaultValues={defaultValues}
      />
    </div>
  );
}

export default function NewTransactionPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <NewTransactionPageContent />
    </Suspense>
  );
}
