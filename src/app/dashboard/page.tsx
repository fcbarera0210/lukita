'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Wallet, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Eye, EyeOff, Calendar, CreditCard, ArrowRightLeft, Home, Trophy } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getAccounts, getTransactions, getCategories, getTrendData, TrendData, getMonthlyComparisonData, MonthlyComparisonData, getTopCategories, TopCategoryData } from '@/lib/firestore';
import { getBudgetsForMonth, monthKeyFromDate } from '@/lib/budgets';
import { BudgetCard } from '@/components/BudgetCard';
import { getUpcomingOccurrences, getRecurring } from '@/lib/recurring';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { CategoryBudget } from '@/types/budget';
import { Account } from '@/types/account';
import { Transaction } from '@/types/transaction';
import { Category } from '@/types/category';
import { formatCLP } from '@/lib/clp';
import { formatDate } from '@/lib/dates';
import { Button } from '@/components/ui/Button';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { getAccountColorClass, getAccountBackgroundClass, getAccountTextClass, getAccountIconColor } from '@/lib/account-colors';
import { HorizontalBarChart, TrendChart } from '@/components/charts';
import { MonthlyComparison } from '@/components/MonthlyComparison';
import { TopCategories } from '@/components/TopCategories';
import { CollapsibleDescription } from '@/components/CollapsibleDescription';
import { MotivationalQuote } from '@/components/MotivationalQuote';

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
  const [isTrendsExpanded, setIsTrendsExpanded] = useState(false);
  const [isComparisonExpanded, setIsComparisonExpanded] = useState(false);
  const [isTopCategoriesExpanded, setIsTopCategoriesExpanded] = useState(false);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [comparisonData, setComparisonData] = useState<MonthlyComparisonData | null>(null);
  const [topCategoriesData, setTopCategoriesData] = useState<TopCategoryData[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<{ total: number; used: number; percentage: number } | null>(null);
  const [budgetList, setBudgetList] = useState<(CategoryBudget & { effectiveAmount: number; spentAmount: number })[]>([]);
  const [upcoming, setUpcoming] = useState<{ note: string; date: Date }[]>([]);
  const [isBudgetsExpanded, setIsBudgetsExpanded] = useState(true);
  const [isRecurringExpanded, setIsRecurringExpanded] = useState(true);
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
        const [accountsData, recentTransactionsData, allTransactionsData, categoriesData, trendDataResult, comparisonDataResult, topCategoriesResult] = await Promise.all([
          getAccounts(user.uid),
          getTransactions(user.uid, 5), // Últimas 5 transacciones para mostrar
          getTransactions(user.uid), // Todas las transacciones para calcular balance
          getCategories(user.uid),
          getTrendData(user.uid, 'monthly', 12), // Datos de tendencias para últimos 12 meses
          getMonthlyComparisonData(user.uid, selectedMonth), // Datos de comparación mensual
          getTopCategories(user.uid, selectedMonth, 5), // Top 5 categorías del mes
        ]);

        setAccounts(accountsData);
        setRecentTransactions(recentTransactionsData);
        setAllTransactions(allTransactionsData);
        setCategories(categoriesData);
        setTrendData(trendDataResult);
        setComparisonData(comparisonDataResult);
        setTopCategoriesData(topCategoriesResult);
        // Presupuestos del mes
        const budgetMonth = monthKeyFromDate(selectedMonth);
        // Usar nueva lógica de presupuestos
        const budgetsForMonth = await getBudgetsForMonth(user.uid, budgetMonth);
        const total = budgetsForMonth.reduce((s, b) => s + b.effectiveAmount, 0);
        const used = budgetsForMonth.reduce((s, b) => s + b.spentAmount, 0);
        const percentage = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
        setBudgetSummary({ total, used, percentage });
        setBudgetList(budgetsForMonth);

        // Próximas recurrentes reales (3 próximas fechas)
        try {
          const recurring = await getRecurring(user.uid);
          const now = new Date();
          const nexts = recurring
            .filter(r => !r.isPaused)
            .map(r => {
              const occ = getUpcomingOccurrences(r, now, 1)[0];
              return occ ? { note: r.note || r.categoryId, date: occ } : null;
            })
            .filter((x): x is { note: string; date: Date } => !!x)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 3);
          setUpcoming(nexts);
        } catch {}
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [user, selectedMonth]);

  // useEffect para listeners en tiempo real
  useEffect(() => {
    if (!user) return;

    // Listener para presupuestos
    const budgetsQuery = query(
      collection(db, 'users', user.uid, 'budgets'),
      orderBy('createdAt', 'desc')
    );
    
        const unsubscribeBudgets = onSnapshot(budgetsQuery, async (snapshot) => {
          const budgets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as CategoryBudget[];
      
      const budgetMonthKey = monthKeyFromDate(selectedMonth);
      const budgetsForMonth = await getBudgetsForMonth(user.uid, budgetMonthKey);
      
      const total = budgetsForMonth.reduce((s, b) => s + b.effectiveAmount, 0);
      const used = budgetsForMonth.reduce((s, b) => s + b.spentAmount, 0);
      const percentage = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
      
      setBudgetSummary({ total, used, percentage });
      setBudgetList(budgetsForMonth);
    });

    // Listener para transacciones
    const transactionsQuery = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
    
    const unsubscribeTransactions = onSnapshot(transactionsQuery, async (snapshot) => {
      const transactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date)
        };
      }) as Transaction[];
      
      setAllTransactions(transactions);
      
      // Recalcular datos mensuales
      const transactionMonthKey = monthKeyFromDate(selectedMonth);
      const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59);
      
      const monthlyTransactions = transactions.filter(t => {
        return t.date >= monthStart.getTime() && t.date <= monthEnd.getTime();
      });
      
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

      // Actualizar presupuestos con nuevos gastos
      const updateMonthKey = monthKeyFromDate(selectedMonth);
      const budgetsForMonth = await getBudgetsForMonth(user.uid, updateMonthKey);
      
      setBudgetList(budgetsForMonth);
      
      // Recalcular summary con los presupuestos actualizados
      const total = budgetsForMonth.reduce((s, b) => s + b.effectiveAmount, 0);
      const used = budgetsForMonth.reduce((s, b) => s + b.spentAmount, 0);
      const percentage = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
      setBudgetSummary({ total, used, percentage });
    });

    return () => {
      unsubscribeBudgets();
      unsubscribeTransactions();
    };
  }, [user, selectedMonth, categories]);

  // Recargar tendencias cuando cambie el mes seleccionado
  useEffect(() => {
    if (user && trendData.length > 0) {
      loadTrendDataForMonth();
    }
  }, [user, selectedMonth]);

  // Recargar datos de comparación cuando cambie el mes
  useEffect(() => {
    if (user) {
      loadComparisonData();
    }
  }, [user, selectedMonth]);

  // Recargar top categorías cuando cambie el mes
  useEffect(() => {
    if (user) {
      loadTopCategoriesData();
    }
  }, [user, selectedMonth]);

  const loadTrendDataForMonth = async () => {
    if (!user) return;
    
    try {
      const data = await getTrendData(user.uid, 'monthly', 12);
      setTrendData(data);
    } catch (error) {
      console.error('Error loading trend data for month:', error);
    }
  };

  const loadComparisonData = async () => {
    if (!user) return;
    
    try {
      const data = await getMonthlyComparisonData(user.uid, selectedMonth);
      setComparisonData(data);
    } catch (error) {
      console.error('Error loading comparison data:', error);
    }
  };

  const loadTopCategoriesData = async () => {
    if (!user) return;
    
    try {
      const data = await getTopCategories(user.uid, selectedMonth, 5);
      setTopCategoriesData(data);
    } catch (error) {
      console.error('Error loading top categories data:', error);
    }
  };

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

  const currentMonthKey = monthKeyFromDate(selectedMonth);

  // Función para generar mensaje de bienvenida aleatorio (solo una vez)
  const [welcomeMessage] = useState(() => {
    const messages = [
      "¡Hola! 👋 ¿Cómo van tus finanzas hoy?",
      "¡Buenos días! ☀️ Tiempo de revisar tu dinero",
      "¡Hola! 💰 Vamos a hacer que tus ahorros crezcan",
      "¡Bienvenido! 🚀 Tu futuro financiero te espera",
      "¡Hola! 💎 Cada peso cuenta para tus metas",
      "¡Buenos días! 🌟 Controla tu dinero, controla tu vida",
      "¡Hola! 🎯 Tus objetivos financieros están más cerca",
      "¡Bienvenido! 💪 La disciplina financiera es poder",
      "¡Hola! 🌈 Construye tu libertad financiera paso a paso",
      "¡Buenos días! 🏆 El éxito financiero comienza aquí"
    ];
    
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  });

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
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-1">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {welcomeMessage.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()}
            </span>
            <span>
              {welcomeMessage.match(/[\u{1F300}-\u{1F9FF}]/gu)?.join('') || ''}
            </span>
          </h1>
          <p className="text-muted-foreground">
            Resumen de tus finanzas
          </p>
        </div>
        
        {/* Frase motivadora */}
        <MotivationalQuote />
      </div>

      {/* Page Description */}
      <CollapsibleDescription
        title="Panel de Control Financiero"
        description="Bienvenido a tu panel de control financiero. Aquí puedes ver un resumen completo de tus finanzas: balance total, transacciones recientes, resumen mensual con gráficos por categoría, y comparaciones con meses anteriores. Usa los controles de fecha para navegar entre diferentes períodos."
        icon={<Home className="h-5 w-5 text-primary" />}
      />

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
                  <EyeOff className="h-4 w-4" />
                  Ocultar cuentas
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
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
                <EyeOff className="h-4 w-4" />
                Ocultar categorías
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
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

      {/* Presupuestos del mes - estilo consistente con headers y toggle */}
      {budgetSummary && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Presupuestos ({currentMonthKey.split('-').reverse().join('-')})</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setIsBudgetsExpanded(!isBudgetsExpanded)} className="flex items-center gap-2">
                {isBudgetsExpanded ? (<><EyeOff className="h-4 w-4" /> Ocultar</>) : (<><Eye className="h-4 w-4" /> Mostrar</>)}
              </Button>
            </div>
          </div>
          {isBudgetsExpanded && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div>
                <div className="h-3 w-full rounded bg-muted">
                  <div className={`h-3 rounded ${budgetSummary.percentage >= 100 ? 'bg-red-600' : budgetSummary.percentage >= 80 ? 'bg-amber-500' : 'bg-green-600'}`} style={{ width: `${budgetSummary.percentage}%` }} />
                </div>
                <p className="mt-2 text-sm text-foreground">
                  Usado: {formatCLP(budgetSummary.used)} / Límite: {formatCLP(budgetSummary.total)} ({budgetSummary.percentage}%)
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {budgetList.map(b => {
                  const category = categories.find(c => c.id === b.categoryId);
                  const display = { 
                    ...b, 
                    categoryId: category?.name || b.categoryId,
                    categoryIcon: category?.icon
                  };
                  return (
                    <BudgetCard 
                      key={b.id} 
                      budget={display} 
                      month={currentMonthKey}
                      onUpdate={async () => {
                        if (!user) return;
                        const budgetsForMonth = await getBudgetsForMonth(user.uid, currentMonthKey);
                        setBudgetList(budgetsForMonth);
                        const total = budgetsForMonth.reduce((s, b) => s + b.effectiveAmount, 0);
                        const used = budgetsForMonth.reduce((s, b) => s + b.spentAmount, 0);
                        const percentage = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
                        setBudgetSummary({ total, used, percentage });
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Próximas recurrentes - estilo consistente con headers y toggle */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Próximas recurrentes</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setIsRecurringExpanded(!isRecurringExpanded)} className="flex items-center gap-2">
              {isRecurringExpanded ? (<><EyeOff className="h-4 w-4" /> Ocultar</>) : (<><Eye className="h-4 w-4" /> Mostrar</>)}
            </Button>
          </div>
        </div>
        {isRecurringExpanded && (
          <div className="bg-card border border-border rounded-lg p-6">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay próximas recurrentes configuradas aquí. Adminístralas en la sección Recurrentes.</p>
            ) : (
              <ul className="text-sm">
                {upcoming.map((u, i) => (
                  <li key={i} className="flex items-center justify-between py-1">
                    <span>{u.note}</span>
                    <span>{formatDate(u.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Comparación Mensual */}
      {comparisonData && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Comparación Mensual</h2>
            </div>
            <Button
              variant="ghost"
              onClick={() => setIsComparisonExpanded(!isComparisonExpanded)}
              className="flex items-center gap-2"
            >
              {isComparisonExpanded ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Ocultar comparación
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Ver comparación
                </>
              )}
            </Button>
          </div>
          
          {isComparisonExpanded && (
            <MonthlyComparison 
              data={[
                {
                  current: comparisonData.current.income,
                  previous: comparisonData.previous.income,
                  label: 'Ingresos',
                  type: 'income'
                },
                {
                  current: comparisonData.current.expense,
                  previous: comparisonData.previous.expense,
                  label: 'Gastos',
                  type: 'expense'
                },
                {
                  current: comparisonData.current.balance,
                  previous: comparisonData.previous.balance,
                  label: 'Balance',
                  type: 'balance'
                }
              ]}
            />
          )}
        </div>
      )}

      {/* Tendencias Mensuales */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Tendencias Mensuales</h2>
          </div>
          <Button
            variant="ghost"
            onClick={() => setIsTrendsExpanded(!isTrendsExpanded)}
            className="flex items-center gap-2"
          >
            {isTrendsExpanded ? (
              <>
                <EyeOff className="h-4 w-4" />
                Ocultar tendencias
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Ver tendencias
              </>
            )}
          </Button>
        </div>

        {isTrendsExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TrendChart
              data={trendData}
              type="income"
              period="monthly"
            />
            <TrendChart
              data={trendData}
              type="expense"
              period="monthly"
            />
            <TrendChart
              data={trendData}
              type="balance"
              period="monthly"
            />
          </div>
        )}
      </div>

      {/* Top Categorías */}
      {topCategoriesData.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Top Categorías</h2>
            </div>
            <Button
              variant="ghost"
              onClick={() => setIsTopCategoriesExpanded(!isTopCategoriesExpanded)}
              className="flex items-center gap-2"
            >
              {isTopCategoriesExpanded ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Ocultar ranking
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Ver ranking
                </>
              )}
            </Button>
          </div>
          
          {isTopCategoriesExpanded && (
            <TopCategories data={topCategoriesData} />
          )}
        </div>
      )}


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
              const accountBgClass = account ? getAccountBackgroundClass(account.color) : 'bg-card';
              const accountTextClass = account ? getAccountTextClass(account.color) : 'text-foreground';
              const accountIconColor = account ? getAccountIconColor(account.color) : 'text-muted-foreground';
              
              return (
                <div
                  key={transaction.id}
                  className={`border-2 ${accountColorClass} ${accountBgClass} rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}
                >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const category = categories.find(c => c.id === transaction.categoryId);
                        const isTransfer = category?.name === 'transferencia entre cuentas';
                        
                        if (isTransfer) {
                          return <ArrowRightLeft className={`h-4 w-4 ${accountIconColor}`} />;
                        } else {
                          const Icon = getCategoryIcon(category?.icon);
                          return <Icon className={`h-4 w-4 ${accountIconColor}`} />;
                        }
                      })()}
                      <p className={`font-medium ${accountTextClass}`}>
                        {transaction.note || (() => {
                          const category = categories.find(c => c.id === transaction.categoryId);
                          return category?.name || 'Sin descripción';
                        })()}
                      </p>
                    </div>
                    <p className={`text-sm ${accountTextClass} opacity-70`}>
                      {(() => {
                        const account = accounts.find(acc => acc.id === transaction.accountId);
                        return `${account?.name || 'Cuenta desconocida'} • ${formatDate(new Date(transaction.date))}`;
                      })()}
                    </p>
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