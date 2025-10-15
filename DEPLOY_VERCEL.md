# 🚀 Guía de Despliegue en Vercel - Lukita PWA

## 📋 **Prerrequisitos**

1. **Cuenta de Vercel**: [vercel.com](https://vercel.com) (gratis)
2. **GitHub/GitLab**: Repositorio en GitHub o GitLab
3. **Firebase configurado**: Con las credenciales en `.env.local`

## 🔧 **Paso 1: Preparar el Repositorio**

### 1.1 Subir a GitHub
```bash
# Si no tienes git inicializado
git init
git add .
git commit -m "Initial commit - Lukita PWA"

# Conectar con GitHub (crea repo en github.com primero)
git remote add origin https://github.com/TU_USUARIO/lukita.git
git branch -M main
git push -u origin main
```

### 1.2 Variables de Entorno
Crea un archivo `.env.example` para documentar las variables:
```bash
# .env.example
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🌐 **Paso 2: Desplegar en Vercel**

### 2.1 Método 1: Dashboard de Vercel (Recomendado)

1. **Ir a Vercel**: [vercel.com/new](https://vercel.com/new)
2. **Conectar GitHub**: Hacer clic en "Import Git Repository"
3. **Seleccionar repositorio**: Buscar y seleccionar `lukita`
4. **Configurar proyecto**:
   - **Framework Preset**: Next.js (detectado automáticamente)
   - **Root Directory**: `./` (por defecto)
   - **Build Command**: `pnpm build` (por defecto)
   - **Output Directory**: `.next` (por defecto)
   - **Install Command**: `pnpm install` (por defecto)

### 2.2 Configurar Variables de Entorno

En el dashboard de Vercel:

1. **Ir a Settings** → **Environment Variables**
2. **Agregar cada variable**:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY = tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = tu_proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID = tu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = tu_proyecto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID = tu_app_id
   ```

### 2.3 Desplegar

1. **Hacer clic en "Deploy"**
2. **Esperar el build** (2-3 minutos)
3. **¡Listo!** Tu app estará en `https://lukita-tu-usuario.vercel.app`

## 🔧 **Paso 3: Configuración Adicional**

### 3.1 Dominio Personalizado (Opcional)
1. **Settings** → **Domains**
2. **Add Domain**: `lukita.tudominio.com`
3. **Configurar DNS** según las instrucciones

### 3.2 Configurar PWA (Opcional)
Para habilitar PWA completamente, agrega a `next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración PWA básica
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## 🚀 **Paso 4: Verificar Despliegue**

### 4.1 Probar Funcionalidades
- ✅ **Login/Register**: `test@test.cl` / `123456`
- ✅ **Dashboard**: Ver cuentas y transacciones
- ✅ **CRUD**: Crear/editar/eliminar cuentas, categorías, transacciones
- ✅ **Tema**: Cambiar entre claro/oscuro
- ✅ **PWA**: Instalar en móvil/desktop

### 4.2 Verificar Errores
- ✅ **Sin error de hidratación**
- ✅ **Sin flash de tema**
- ✅ **Tema persiste correctamente**
- ✅ **Logout funciona**

## 🔄 **Paso 5: Actualizaciones Futuras**

### 5.1 Deploy Automático
- **Push a main**: Se despliega automáticamente
- **Pull Requests**: Se crean preview deployments

### 5.2 Comandos Útiles
```bash
# Ver deployments
vercel ls

# Ver logs
vercel logs

# Deploy manual
vercel --prod
```

## 🐛 **Solución de Problemas**

### Error: Build Failed
```bash
# Verificar build local
pnpm build

# Revisar logs en Vercel dashboard
```

### Error: Variables de Entorno
- ✅ Verificar que todas las variables estén en Vercel
- ✅ Verificar que no tengan espacios extra
- ✅ Redeploy después de agregar variables

### Error: Firebase
- ✅ Verificar que las credenciales sean correctas
- ✅ Verificar que Firebase esté configurado
- ✅ Verificar reglas de Firestore

## 📱 **Paso 6: Instalar como PWA**

### 6.1 En Desktop
1. **Abrir en Chrome/Edge**
2. **Clic en icono de instalación** en la barra de direcciones
3. **"Instalar Lukita"**

### 6.2 En Móvil (iOS)
1. **Abrir en Safari**
2. **Compartir** → **"Agregar a pantalla de inicio"**
3. **"Agregar"**

### 6.3 En Móvil (Android)
1. **Abrir en Chrome**
2. **Menú** → **"Agregar a pantalla de inicio"**
3. **"Agregar"**

## 🎉 **¡Listo!**

Tu PWA Lukita estará disponible en:
- **URL**: `https://lukita-tu-usuario.vercel.app`
- **Instalable**: Como app nativa
- **Offline**: Funciona sin conexión
- **Rápida**: Optimizada para producción

## 📞 **Soporte**

Si tienes problemas:
1. **Revisar logs** en Vercel dashboard
2. **Verificar variables** de entorno
3. **Probar build local** con `pnpm build`
4. **Consultar documentación** de Vercel

¡Tu PWA de finanzas personales estará lista para usar! 🚀💰
