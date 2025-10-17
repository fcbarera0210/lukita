'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export function AutoLogin() {
  const { user, loading } = useAuth();
  const [showStatus, setShowStatus] = useState(false);
  const [autoLoginDisabled, setAutoLoginDisabled] = useState(false);

  const handleAutoLogin = async () => {
    try {
      await login('test@test.cl', '123456');
      // limpiar bandera si existía
      localStorage.removeItem('manual-logout');
    } catch (error) {
      console.error('Error en auto login:', error);
    }
  };

  // Auto login cuando no hay usuario (solo si no está deshabilitado)
  useEffect(() => {
    // Deshabilitado temporalmente para evitar errores de credenciales
    // if (!loading && !user && !autoLoginDisabled) {
    //   handleAutoLogin();
    // }
  }, [loading, user, autoLoginDisabled]);

  // Deshabilitar auto-login si el usuario hizo logout manualmente
  useEffect(() => {
    // estado inicial
    try {
      if (localStorage.getItem('manual-logout') === 'true') {
        setAutoLoginDisabled(true);
      }
    } catch {}

    const handleStorageChange = () => {
      if (localStorage.getItem('manual-logout') === 'true') {
        setAutoLoginDisabled(true);
        localStorage.removeItem('manual-logout');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Mostrar estado temporalmente
  useEffect(() => {
    if (user) {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (loading) {
    return null; // No mostrar nada mientras carga
  }

  if (!user) {
    return null; // No mostrar nada si no hay usuario
  }

  if (!showStatus) {
    return null; // No mostrar nada después de 3 segundos
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-500/20 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm">
      <p className="text-sm text-green-500">
        ✅ Autenticado como: {user.email}
      </p>
    </div>
  );
}
