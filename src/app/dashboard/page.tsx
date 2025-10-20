'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Wallet, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar, CreditCard, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getAccounts, getTransactions, getTransactionsByDateRange, getCategories } from '@/lib/firestore';
import { Account } from '@/types/account';
import { Transaction } from '@/types/transaction';
import { Category } from '@/types/category';
import { formatCLP } from '@/lib/clp';
import { formatDate, getPeriodFromCutoff } from '@/lib/dates';
import { Button } from '@/components/ui/Button';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { getAccountColorClass } from '@/lib/account-colors';
import { HorizontalBarChart } from '@/components/charts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAccountsExpanded, setIsAccountsExpanded] = useState(false);
  const [monthlyData, setMonthlyData] = useState<{
    income: number;
    expenses: number;
    transactions: Transaction[];
    categoryBreakdown: { categoryId: string; amount: number; category: Category }[];
  }>({
    income: 0,
    expenses: 0,
    transactions: [],
    categoryBreakdown: []
  });

  // Función para cargar datos del dashboard
  const loadData = async () => {
    if (!user) return;

      try {
        const [accountsData, recentTransactionsData, allTransactionsData, categoriesData] = await Promise.all([
          getAccounts(user.uid),
          getTransactions(user.uid, 5), // Últimas 5 transacciones para mostrar
          getTransactions(user.uid), // Todas las transacciones para calcular balance
          getCategories(user.uid),
        ]);

        setAccounts(accountsData);
        setRecentTransactions(recentTransactionsData);
        setAllTransactions(allTransactionsData);
        setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Escuchar eventos de actualización del dashboard
  useEffect(() => {
    const handleRefresh = () => {
      loadData();
    };

    window.addEventListener('refreshDashboard', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshDashboard', handleRefresh);
    };
  }, [user]);

  // Cargar datos del mes seleccionado
  useEffect(() => {
    const loadMonthlyData = async () => {
      if (!user) return;

      try {
        const [startDate, endDate] = getPeriodFromCutoff(selectedMonth, 1); // Usar selectedMonth y día 1 como corte
        const monthlyTransactions = await getTransactionsByDateRange(
          user.uid, 
          startDate.getTime(), 
          endDate.getTime()
        );

        // Cargar transacciones recientes del mes seleccionado (últimas 5)
        const recentMonthlyTransactions = monthlyTransactions
          .sort((a, b) => b.date - a.date)
          .slice(0, 5);
        setRecentTransactions(recentMonthlyTransactions);

        const income = monthlyTransactions
          .filter(t => t.type === 'ingreso')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = monthlyTransactions
          .filter(t => t.type === 'gasto')
          .reduce((sum, t) => sum + t.amount, 0);

        // Calcular breakdown por categoría (solo gastos)
        const categoryBreakdown = monthlyTransactions
          .filter(t => t.type === 'gasto')
          .reduce((acc, transaction) => {
            const category = categories.find(c => c.id === transaction.categoryId);
            if (category) {
              const existing = acc.find(item => item.categoryId === transaction.categoryId);
              if (existing) {
                existing.amount += transaction.amount;
              } else {
                acc.push({
                  categoryId: transaction.categoryId,
                  amount: transaction.amount,
                  category
                });
              }
            }
            return acc;
          }, [] as { categoryId: string; amount: number; category: Category }[])
          .sort((a, b) => b.amount - a.amount);

        setMonthlyData({
          income,
          expenses,
          transactions: monthlyTransactions,
          categoryBreakdown
        });
      } catch (error) {
        console.error('Error loading monthly data:', error);
      }
    };

    if (categories.length > 0) {
      loadMonthlyData();
    }
  }, [user, selectedMonth, categories]);

  // Función para calcular el balance real de una cuenta
  const calculateAccountBalance = (accountId: string, initialBalance: number) => {
    const accountTransactions = allTransactions.filter(t => t.accountId === accountId);
    const balance = accountTransactions.reduce((sum, transaction) => {
      if (transaction.type === 'ingreso') {
        return sum + transaction.amount;
      } else {
        return sum - transaction.amount;
      }
    }, initialBalance);
    return balance;
  };

  const totalBalance = accounts.reduce((sum, account) => {
    return sum + (account.balance || 0);
  }, 0);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedMonth(newDate);
  };

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat('es-CL', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-card rounded-lg"></div>
          <div className="h-20 bg-card rounded-lg"></div>
          <div className="h-20 bg-card rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de tus finanzas
        </p>
      </div>

      {/* Balance Total */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Balance Total</h2>
          </div>
          {accounts.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => setIsAccountsExpanded(!isAccountsExpanded)}
              className="flex items-center gap-2"
            >
              {isAccountsExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Ocultar cuentas
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Ver cuentas
                </>
              )}
            </Button>
          )}
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-3xl font-bold text-primary">
            {formatCLP(totalBalance)}
          </p>

          {isAccountsExpanded && (
            <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
              <h4 className="text-sm font-medium text-muted-foreground">
                Cuentas
              </h4>
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`flex items-center justify-between p-2 bg-muted/50 rounded border-2 ${getAccountColorClass(account.color)}`}
                >
                  <div>
                    <span className="text-sm font-medium">{account.name}</span>
                    <p className="text-xs text-muted-foreground capitalize">
                      {account.type.replace('_', ' ')}
                    </p>
                  </div>
                    <span className="text-sm font-medium">
                      {formatCLP(account.balance || 0)}
                    </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resumen Mensual */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Resumen Mensual</h2>
          </div>
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
            disabled={monthlyData.categoryBreakdown.length === 0}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Ocultar categorías
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Ver categorías
              </>
            )}
          </Button>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('prev')}
              className="bg-muted/50 hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {formatMonthYear(selectedMonth)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('next')}
              className="bg-muted/50 hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Ingresos</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <p className="text-xl font-bold text-green-500">
                {formatCLP(monthlyData.income)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gastos</p>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <p className="text-xl font-bold text-red-500">
                {formatCLP(monthlyData.expenses)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Balance del mes</p>
          <div className="flex items-center gap-2">
            {monthlyData.income - monthlyData.expenses >= 0 ? (
              <TrendingUp className="h-6 w-6 text-green-500" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-500" />
            )}
            <p className={`text-2xl font-bold ${
              monthlyData.income - monthlyData.expenses >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              {formatCLP(monthlyData.income - monthlyData.expenses)}
            </p>
          </div>
        </div>

          {isExpanded && (
            <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
              <h4 className="text-sm font-medium text-muted-foreground">
                Gastos por categoría
              </h4>
              <HorizontalBarChart 
                data={monthlyData.categoryBreakdown.map(item => ({
                  ...item,
                  percentage: monthlyData.expenses > 0 ? (item.amount / monthlyData.expenses) * 100 : 0
                }))}
                maxAmount={monthlyData.expenses}
              />
            </div>
          )}
        </div>
      </div>


      {/* Transacciones Recientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Transacciones Recientes</h2>
          </div>
          <Link href="/transactions">
            <Button variant="outline" size="sm">
              Ver todas
            </Button>
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-4">
              No tienes transacciones registradas
            </p>
            <Link href="/transactions/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear primera transacción
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => {
              const account = accounts.find(acc => acc.id === transaction.accountId);
              const accountColorClass = account ? getAccountColorClass(account.color) : 'border-border';
              
              return (
                <div
                  key={transaction.id}
                  className={`bg-card border-2 ${accountColorClass} rounded-lg p-4`}
                >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted/50">
                      {(() => {
                        const category = categories.find(c => c.id === transaction.categoryId);
                        const isTransfer = category?.name === 'transferencia entre cuentas';
                        
                        if (isTransfer) {
                          return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
                        } else {
                          const Icon = getCategoryIcon(category?.icon);
                          return <Icon className="h-4 w-4 text-muted-foreground" />;
                        }
                      })()}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.note || (() => {
                          const category = categories.find(c => c.id === transaction.categoryId);
                          return category?.name || 'Sin descripción';
                        })()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(() => {
                          const account = accounts.find(acc => acc.id === transaction.accountId);
                          return account?.name || 'Cuenta desconocida';
                        })()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(new Date(transaction.date))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {transaction.type === 'ingreso' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <p className={`font-semibold ${
                      transaction.type === 'ingreso' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatCLP(transaction.amount)}
                    </p>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}