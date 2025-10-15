'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const applyTheme = (theme: string) => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        // Let CSS handle system theme via media queries
        // Don't add any class, let @media (prefers-color-scheme) handle it
      } else {
        root.classList.add(theme);
      }
    };

    if (user) {
      // Load user's theme from Firestore
      const loadUserTheme = async () => {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            const data = snap.data();
            const theme = data?.theme || 'dark';
            applyTheme(theme);
            
            // Save to localStorage for next load
            try {
              localStorage.setItem('user-theme', theme);
            } catch {}
          }
        } catch (error) {
          console.error('Error loading theme:', error);
        }
      };

      loadUserTheme();
    } else {
      // No user - check localStorage for last theme or default to system
      try {
        const savedTheme = localStorage.getItem('user-theme');
        if (savedTheme) {
          applyTheme(savedTheme);
        } else {
          // Default to system theme for unauthenticated users
          applyTheme('system');
        }
      } catch {
        applyTheme('system');
      }
    }
  }, [isHydrated, user]);

  return <>{children}</>;
}
