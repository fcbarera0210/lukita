'use client';

import { useEffect, useState } from 'react';
import { Settings, LogOut, Moon, Sun, Monitor, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getUserSettings } from '@/lib/auth';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logout } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { UserSettings as UserSettingsType } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [userSettings, setUserSettings] = useState<UserSettingsType>({
    monthCutoffDay: 1,
    theme: 'dark'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const settings = await getUserSettings(user.uid);
        setUserSettings(settings);
        setTheme(settings.theme);
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Error',
          description: 'No se pudieron cargar las configuraciones',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleThemeChange = async (newTheme: 'dark' | 'light' | 'system') => {
    setTheme(newTheme);
    setUserSettings(prev => ({ ...prev, theme: newTheme }));
    
    // Guardar en Firestore
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { theme: newTheme }).catch(async () => {
          await setDoc(doc(db, 'users', user.uid), { theme: newTheme }, { merge: true });
        });
        // Update localStorage immediately
        try {
          localStorage.setItem('user-theme', newTheme);
        } catch {}
        showToast({
          type: 'success',
          title: 'Tema actualizado',
          description: 'El tema se ha guardado correctamente',
        });
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Error',
          description: 'No se pudo guardar el tema',
        });
      }
    }
  };

  const handleCutoffDayChange = async (day: number) => {
    setUserSettings(prev => ({ ...prev, monthCutoffDay: day }));
    
    // Guardar en Firestore
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { monthCutoffDay: day }).catch(async () => {
          await setDoc(doc(db, 'users', user.uid), { monthCutoffDay: day }, { merge: true });
        });
        showToast({
          type: 'success',
          title: 'Corte de mes actualizado',
          description: 'El día de corte se ha guardado correctamente',
        });
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Error',
          description: 'No se pudo guardar el día de corte',
        });
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Marcar que el logout fue manual
      localStorage.setItem('manual-logout', 'true');
      await logout();
      // redirigir a login
      if (typeof window !== 'undefined') {
        window.location.assign('/login');
      }
      showToast({
        type: 'success',
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión exitosamente',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'No se pudo cerrar la sesión',
      });
    }
  };

  if (loading) {
    return (
      
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-card rounded-lg"></div>
            ))}
          </div>
        </div>
      
    );
  }

  return (
    
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Ajustes</h1>
        </div>

        {/* Configuración de Tema */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Tema</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Oscuro
              </Button>
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Claro
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('system')}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                Sistema
              </Button>
            </div>
          </div>
        </div>

        {/* Configuración de Corte de Mes */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Corte de Mes</h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Selecciona el día del mes en que quieres que se corte tu período contable
            </p>
            <div className="flex items-center gap-3">
              <label htmlFor="cutoffDay" className="text-sm font-medium">
                Día de corte:
              </label>
              <Select
                id="cutoffDay"
                value={userSettings.monthCutoffDay}
                onChange={(e) => handleCutoffDayChange(Number(e.target.value))}
                className="w-20"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Información de la Cuenta */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Cuenta</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usuario desde</p>
              <p className="font-medium">
                {user?.metadata.creationTime 
                  ? new Date(user.metadata.creationTime).toLocaleDateString('es-CL')
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Acciones</h2>
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Información de la App */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Lukita v0.1.0</p>
          <p>PWA de finanzas personales</p>
        </div>
      </div>
    
  );
}
