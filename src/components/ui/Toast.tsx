'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  onClose: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export function Toast({ type, title, description, duration = 5000, onClose, index = 0 }: ToastProps & { index?: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animación de entrada
    const enterTimer = setTimeout(() => setIsVisible(true), 10);
    
    // Animación de salida
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [duration, onClose]);

  const Icon = icons[type];

  return (
    <div
      className={cn(
        'fixed right-4 z-50 w-full max-w-sm p-4 rounded-lg border shadow-lg transition-all duration-300',
        {
          'translate-x-full opacity-0': !isVisible,
          'translate-x-0 opacity-100': isVisible,
        },
        {
          'border-green-500/20 bg-green-500/10 backdrop-blur-sm': type === 'success',
          'border-red-500/20 bg-red-500/10 backdrop-blur-sm': type === 'error',
          'border-blue-500/20 bg-blue-500/10 backdrop-blur-sm': type === 'info',
        }
      )}
      style={{
        top: `${16 + index * 80}px`,
      }}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn('h-5 w-5 mt-0.5 flex-shrink-0', {
            'text-green-500': type === 'success',
            'text-red-500': type === 'error',
            'text-blue-500': type === 'info',
          })}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="h-6 w-6 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Toast context and provider
interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'onClose'>) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const showToast = (toast: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      ...toast,
      id,
      onClose: () => {
        setToasts(prev => prev.filter(t => t.id !== id));
      },
    };
    setToasts(prev => [...prev, newToast]);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 right-0 z-50 pointer-events-none">
        {toasts.map((toast, index) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} index={index} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
