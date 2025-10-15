'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  CreditCard, 
  Wallet, 
  Tag, 
  Settings,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Inicio',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Transacciones',
    href: '/transactions',
    icon: CreditCard,
  },
  {
    name: 'Cuentas',
    href: '/accounts',
    icon: Wallet,
  },
  {
    name: 'Categorías',
    href: '/categories',
    icon: Tag,
  },
  {
    name: 'Ajustes',
    href: '/settings',
    icon: Settings,
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="flex items-center justify-around py-2 px-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1',
                {
                  'text-primary': isActive,
                  'text-muted-foreground hover:text-foreground': !isActive,
                }
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Floating Action Button para crear transacciones rápidas
export function FloatingActionButton() {
  return (
    <Link
      href="/transactions"
      className="fixed bottom-20 right-4 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors"
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}
