'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login, sendPasswordReset } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Footer } from '@/components/Footer';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      showToast({
        type: 'success',
        title: 'Bienvenido',
        description: 'Has iniciado sesión correctamente',
      });
      router.push('/dashboard');
    } catch (error: unknown) {
      showToast({
        type: 'error',
        title: 'Error de autenticación',
        description: error instanceof Error ? error.message : 'No se pudo iniciar sesión',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordRecovery = async () => {
    if (!recoveryEmail) {
      showToast({
        type: 'error',
        title: 'Email requerido',
        description: 'Por favor ingresa tu email para recuperar tu contraseña',
      });
      return;
    }

    setIsSendingRecovery(true);
    try {
      await sendPasswordReset(recoveryEmail);
      showToast({
        type: 'success',
        title: 'Email enviado',
        description: 'Revisa tu correo para restablecer tu contraseña',
      });
      setIsRecoveryMode(false);
      setRecoveryEmail('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showToast({
        type: 'error',
        title: 'Error al enviar email de recuperación',
        description: `No se pudo enviar el email de recuperación: ${errorMessage}`,
      });
    } finally {
      setIsSendingRecovery(false);
    }
  };

  if (isRecoveryMode) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Recuperar Contraseña</h1>
          <p className="text-muted-foreground mt-2">
            Ingresa tu email para recibir un enlace de recuperación
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="recoveryEmail" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="recoveryEmail"
              type="email"
              placeholder="tu@email.com"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
            />
          </div>

          <Button
            onClick={handlePasswordRecovery}
            className="w-full"
            disabled={isSendingRecovery}
          >
            {isSendingRecovery ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsRecoveryMode(false)}
            className="w-full"
          >
            Volver al login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-2">
          {/* Logo con texto blanco para tema oscuro */}
          <img 
            src="/svg/logo-lukita-2.svg" 
            alt="Lukita" 
            className="h-20 dark:block hidden"
          />
          {/* Logo con texto oscuro para tema claro */}
          <img 
            src="/svg/logo-lukita.svg" 
            alt="Lukita" 
            className="h-20 dark:hidden block"
          />
        </div>
        <p className="text-muted-foreground mt-2">
          Inicia sesión en tu cuenta
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Contraseña
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
          )}
          
          <div className="text-right">
            <button
              type="button"
              onClick={() => setIsRecoveryMode(true)}
              className="text-sm text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          ¿No tienes una cuenta?{' '}
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            Regístrate
          </Link>
        </p>
      </div>
      
      <Footer />
    </div>
  );
}
