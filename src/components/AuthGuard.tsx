'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo ejecutar redirección cuando el loading termine y no haya usuario
    if (!loading && !user) {
      // Redirigir al login si no hay sesión activa
      router.push('/(auth)/login');
    }
  }, [user, loading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario después del loading, no renderizar nada
  // (la redirección se maneja en el useEffect)
  if (!user) {
    return null;
  }

  // Si hay usuario, renderizar el contenido protegido
  return <>{children}</>;
}
