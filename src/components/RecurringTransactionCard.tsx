import React, { useEffect, useState } from 'react';
import type { RecurringTransaction } from '@/types/recurring';
import type { AccountColorId } from '@/lib/account-colors';
import { getUpcomingOccurrences, updateRecurring } from '@/lib/recurring';
import { useAuth } from '@/lib/auth';
import { getAccountColorClass, getAccountBackgroundClass } from '@/lib/account-colors';
import { TrendingUp, TrendingDown, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface RecurringTransactionCardProps {
  item: RecurringTransaction & { categoryId: string };
  accountColor?: string;
}

export function RecurringTransactionCard({ item, accountColor }: RecurringTransactionCardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [local, setLocal] = useState(item);
  const nextDates = getUpcomingOccurrences(local, new Date(), 3);

  // Sincronizar cuando el item padre cambie (p.ej., tras editar)
  useEffect(() => {
    setLocal(item);
  }, [item]);

  const colorClass = accountColor ? getAccountColorClass(accountColor as AccountColorId) : 'border-border';
  const bgClass = accountColor ? getAccountBackgroundClass(accountColor as AccountColorId) : 'bg-card';
  
  return (
    <div className={`rounded-lg border-2 p-4 ${colorClass} ${bgClass}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{local.note ?? local.categoryId}</h3>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
            {local.recurrence}
          </span>
          {local.isPaused && (
            <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              Pausada
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {local.type === 'ingreso' ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`font-semibold ${local.type === 'ingreso' ? 'text-green-500' : 'text-red-500'}`}>
            ${local.amount.toLocaleString('es-CL')}
          </span>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        Próximas: {nextDates.map(d => d.toLocaleDateString('es-CL')).join(', ')}
      </div>
      
      <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (!user) return;
                try {
                  await updateRecurring(user.uid, local.id, { isPaused: !local.isPaused });
                  setLocal({ ...local, isPaused: !local.isPaused });
                  showToast({
                    type: 'success',
                    title: local.isPaused ? 'Transacción reanudada' : 'Transacción pausada',
                    description: local.isPaused ? 'La transacción recurrente se ha reanudado' : 'La transacción recurrente se ha pausado'
                  });
                } catch (error) {
                  showToast({
                    type: 'error',
                    title: 'Error al cambiar estado',
                    description: 'No se pudo cambiar el estado de la transacción'
                  });
                }
              }}
              className="flex items-center gap-1"
            >
          {local.isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          {local.isPaused ? 'Reanudar' : 'Pausar'}
        </Button>
      </div>
    </div>
  );
}


