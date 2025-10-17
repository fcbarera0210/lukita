'use client';

import { useState, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { Navigation, FloatingActionButton } from '@/components/Navigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { AutoLogin } from '@/components/AutoLogin';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

// Context para controlar la visibilidad del FAB
const FabContext = createContext<{
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
}>({
  isFormOpen: false,
  setIsFormOpen: () => {},
});

export const useFabContext = () => useContext(FabContext);

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Rutas que no deben mostrar navegación
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);
  
  // Rutas que no deben mostrar FAB
  const noFabRoutes = ['/transactions/new'];
  const shouldHideFab = noFabRoutes.includes(pathname) || isFormOpen;

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
    <FabContext.Provider value={{ isFormOpen, setIsFormOpen }}>
      <div className="min-h-screen bg-background">
        <OfflineIndicator />
        <AutoLogin />
        <main className="pb-20">
          {children}
        </main>
        <Navigation />
        {!shouldHideFab && <FloatingActionButton />}
      </div>
    </FabContext.Provider>
  );
}
