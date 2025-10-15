'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ThemeMode = 'dark' | 'light' | 'system';

interface SettingsState {
  theme: ThemeMode;
  monthCutoffDay: number;
  loading: boolean;
}

const SettingsContext = createContext<SettingsState | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<SettingsState>({ theme: 'dark', monthCutoffDay: 1, loading: true });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) {
        // Clear user-specific theme when no user
        try { localStorage.removeItem('user-theme'); } catch {}
        setState(prev => ({ ...prev, loading: false }));
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (cancelled) return;
        if (snap.exists()) {
          const data = snap.data();
          const theme: ThemeMode = data.theme || 'dark';
          const day: number = typeof data.monthCutoffDay === 'number' ? data.monthCutoffDay : 1;
          // Sync to localStorage with user-specific key so pre-hydration script applies it on next load
          try { 
            localStorage.setItem('theme', theme);
            localStorage.setItem('user-theme', theme);
          } catch {}
          setState({ theme, monthCutoffDay: day, loading: false });
          
          // Apply theme immediately to avoid flash
          if (typeof window !== 'undefined') {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            if (theme === 'system') {
              const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              root.classList.add(isDark ? 'dark' : 'light');
            } else {
              root.classList.add(theme);
            }
          }
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch {
        setState(prev => ({ ...prev, loading: false }));
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  const value = useMemo(() => state, [state]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useUserSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useUserSettings must be used within SettingsProvider');
  return ctx;
}


