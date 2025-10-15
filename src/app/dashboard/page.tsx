'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Wallet, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getAccounts, getTransactions } from '@/lib/firestore';
import { Account } from '@/types/account';
import { Transaction } from '@/types/transaction';
import { formatCLP } from '@/lib/clp';
import { formatDate } from '@/lib/dates';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [accountsData, transactionsData] = await Promise.all([
          getAccounts(user.uid),
          getTransactions(user.uid, 5), // Últimas 5 transacciones
        ]);

        setAccounts(accountsData);
        setRecentTransactions(transactionsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const totalBalance = accounts.reduce((sum, account) => {
    return sum + (account.initialBalance || 0);
  }, 0);

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
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Balance Total</h2>
          <Wallet className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-3xl font-bold text-primary">
          {formatCLP(totalBalance)}
        </p>
      </div>

      {/* Cuentas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cuentas</h2>
          <Link href="/accounts">
            <Button variant="outline" size="sm">
              Ver todas
            </Button>
          </Link>
        </div>

        {accounts.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-4">
              No tienes cuentas creadas
            </p>
            <Link href="/accounts">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear primera cuenta
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.slice(0, 3).map((account) => (
              <div
                key={account.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {account.type.replace('_', ' ')}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">
                    {formatCLP(account.initialBalance || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transacciones Recientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Transacciones Recientes</h2>
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
            <Link href="/transactions">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear primera transacción
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'ingreso' 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {transaction.type === 'ingreso' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.note || 'Sin descripción'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(new Date(transaction.date))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'ingreso' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.type === 'ingreso' ? '+' : '-'}
                      {formatCLP(transaction.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/transactions">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva transacción
            </Button>
          </Link>
          <Link href="/accounts">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Gestionar cuentas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}