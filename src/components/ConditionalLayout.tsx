'use client';

import { usePathname } from 'next/navigation';
import { Navigation, FloatingActionButton } from '@/components/Navigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { AutoLogin } from '@/components/AutoLogin';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Rutas que no deben mostrar navegación
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-background">
        <OfflineIndicator />
        <main>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      <AutoLogin />
      <main className="pb-20">
        {children}
      </main>
      <Navigation />
      <FloatingActionButton />
    </div>
  );
}
