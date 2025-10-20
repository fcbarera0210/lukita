'use client';

import { useEffect, useState } from 'react';
import { Settings, LogOut, Moon, Sun, Monitor, Calendar, Lock, Eye, EyeOff, Cog } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getUserSettings, changePassword } from '@/lib/auth';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logout } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { UserSettings as UserSettingsType } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { PageDescription } from '@/components/PageDescription';
import { useFabContext } from '@/components/ConditionalLayout';

export default function SettingsPage() {
  const { user } = useAuth();
  const { setIsFormOpen } = useFabContext();
  const { theme, setTheme } = useTheme();
  const [userSettings, setUserSettings] = useState<UserSettingsType>({
    monthCutoffDay: 1,
    theme: 'dark'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Las contraseñas no coinciden',
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'La nueva contraseña debe tener al menos 6 caracteres',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showToast({
        type: 'success',
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido cambiada exitosamente',
      });
      setIsPasswordModalOpen(false);
      setIsFormOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: unknown) {
      showToast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo cambiar la contraseña',
      });
    } finally {
      setIsChangingPassword(false);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Ajustes</h1>
          </div>
          <Button 
            onClick={handleLogout} 
            size="icon" 
            className="h-10 w-10 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Page Description */}
        <PageDescription
          title="Configuración de la Aplicación"
          description="Personaliza tu experiencia con Lukita. Cambia entre tema claro y oscuro, actualiza tu información personal, modifica tu contraseña y gestiona la configuración de la aplicación."
          icon={<Cog className="h-5 w-5 text-primary" />}
        />

        {/* Configuración de Tema */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Moon className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Tema</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Personaliza la apariencia de la aplicación. El tema oscuro es ideal para usar en ambientes con poca luz.
          </p>
          <div className="bg-card border border-border rounded-lg p-4">
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
        </div>

        {/* Configuración de Corte de Mes */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Corte de Mes</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Define el día del mes en que se reinicia tu período contable. Esto afecta cómo se calculan los resúmenes mensuales.
          </p>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="space-y-3">
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
        </div>

        {/* Información de la Cuenta */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Cuenta</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Información básica de tu cuenta de usuario y fecha de registro en la aplicación.
          </p>
          <div className="bg-card border border-border rounded-lg p-4">
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
        </div>

        {/* Seguridad */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Seguridad</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Gestiona la seguridad de tu cuenta. Para cambiar la contraseña, debes ingresar la contraseña actual y usar un mínimo de 6 caracteres.
          </p>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPasswordModalOpen(true);
                  setIsFormOpen(true);
                }}
                className="w-full flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Cambiar contraseña
              </Button>
            </div>
          </div>
        </div>


        {/* Información de la App */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Lukita v0.3.11</p>
          <p>PWA de finanzas personales</p>
        </div>

        {/* Modal de cambio de contraseña */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => {
            setIsPasswordModalOpen(false);
            setIsFormOpen(false);
          }}
          title="Cambiar contraseña"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                Contraseña actual
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setIsFormOpen(false);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="flex-1"
              >
                {isChangingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    
  );
}
