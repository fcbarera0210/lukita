'use client';

import { useEffect, useState, Suspense } from 'react';
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

function NewTransactionPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [, setLoading] = useState(true);

  // Obtener parámetros de la URL
  const urlType = searchParams.get('type') as 'ingreso' | 'gasto' | null;
  const urlAmount = searchParams.get('amount');
  const urlNote = searchParams.get('note');
  const urlCategoryId = searchParams.get('categoryId');
  const urlAccountId = searchParams.get('accountId');
  const urlCategoryName = searchParams.get('category');
  const urlAccountName = searchParams.get('account');

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

  // Preparar valores por defecto basados en parámetros URL
  const getDefaultValues = () => {
    // Buscar categoría por ID o por nombre
    let categoryId = urlCategoryId || '';
    if (!categoryId && urlCategoryName && categories.length > 0) {
      const foundCategory = categories.find(cat => 
        cat.name.toLowerCase() === urlCategoryName.toLowerCase()
      );
      categoryId = foundCategory?.id || '';
    }

    // Buscar cuenta por ID o por nombre
    let accountId = urlAccountId || '';
    if (!accountId && urlAccountName && accounts.length > 0) {
      const foundAccount = accounts.find(acc => 
        acc.name.toLowerCase() === urlAccountName.toLowerCase()
      );
      accountId = foundAccount?.id || '';
    }

    return {
      type: urlType || 'gasto',
      amount: urlAmount ? parseInt(urlAmount) || 0 : 0,
      date: Date.now(),
      accountId,
      categoryId,
      note: urlNote || '',
    };
  };

  const defaultValues = getDefaultValues();

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
