'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useUserSettings } from '@/lib/settings-context';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserSettings } from '@/types/user';

export type Theme = 'dark' | 'light' | 'system';

export function useTheme() {
  const { user } = useAuth();
  const settings = useUserSettings();
  const [theme, setTheme] = useState<Theme>('dark');
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Detectar tema del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      root.classList.toggle('light', systemTheme === 'light');
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('light', theme === 'light');
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, systemTheme]);

  // Respetar el valor del SettingsProvider si está disponible
  useEffect(() => {
    const saved = settings?.theme;
    if (saved && ['dark','light','system'].includes(saved)) {
      setTheme(saved as Theme);
    } else {
      try {
        const ls = localStorage.getItem('theme') as Theme | null;
        if (ls && ['dark','light','system'].includes(ls)) setTheme(ls);
      } catch {}
    }
  }, [settings?.theme]);

  const updateTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
      localStorage.setItem('user-theme', newTheme);
    } catch {}
    
    // Apply theme immediately
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      if (newTheme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(isDark ? 'dark' : 'light');
      } else {
        root.classList.add(newTheme);
      }
    }
    
    // Guardar en Firestore
    if (user) {
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          { theme: newTheme },
          { merge: true }
        );
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  return {
    theme,
    setTheme: updateTheme,
    systemTheme,
  };
}
