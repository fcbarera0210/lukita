'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsVisible(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsVisible(true);
    };

    // Verificar estado inicial
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
      setIsVisible(!navigator.onLine);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed top-4 left-4 right-4 z-50 p-3 rounded-lg border shadow-lg transition-all duration-300',
      {
        'bg-red-500/10 border-red-500/20': !isOnline,
      }
    )}>
      <div className="flex items-center gap-3">
        {!isOnline ? (
          <>
            <WifiOff className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Sin conexión</p>
              <p className="text-xs text-muted-foreground">
                Los cambios se guardarán cuando vuelva la conexión
              </p>
            </div>
          </>
        ) : (
          <>
            <Wifi className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Conectado</p>
              <p className="text-xs text-muted-foreground">
                Todos los cambios están sincronizados
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}