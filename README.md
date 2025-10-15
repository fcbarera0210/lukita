# Lukita - PWA de Finanzas Personales

Una Progressive Web App (PWA) para gestionar finanzas personales, construida con Next.js 15, Firebase y TypeScript.

## 🚀 Características

- **PWA Instalable**: Funciona offline y se puede instalar en dispositivos móviles y desktop
- **Tema Oscuro**: Interfaz oscura por defecto con soporte para tema claro y sistema
- **Moneda CLP**: Manejo de pesos chilenos sin decimales
- **Corte de Mes Configurable**: Período contable personalizable (por defecto día 1)
- **Autenticación**: Sistema de login/registro con Firebase Auth
- **CRUD Completo**: Gestión de cuentas, categorías y transacciones
- **Dashboard**: Resumen financiero con saldos y últimas transacciones
- **Filtros Avanzados**: Búsqueda y filtrado de transacciones
- **Soporte Offline**: Cola de sincronización para transacciones sin conexión

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 con App Router, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **PWA**: next-pwa para service worker y cache
- **UI**: Componentes personalizados con Lucide React icons
- **Formularios**: React Hook Form + Zod para validación
- **Fechas**: date-fns con locale es-CL
- **Deploy**: Vercel

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd lukita
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar Firebase**
   - Crear un proyecto en [Firebase Console](https://console.firebase.google.com)
   - Habilitar Authentication (Email/Password)
   - Crear una base de datos Firestore
   - Copiar las credenciales de configuración

4. **Configurar variables de entorno**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Editar `.env.local` con tus credenciales de Firebase:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Configurar Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

6. **Ejecutar en desarrollo**
   ```bash
   pnpm dev
   ```

## 🔥 Configuración de Firebase

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Índices Requeridos

Crear los siguientes índices en Firestore:

1. **Transacciones por fecha (descendente)**
   - Colección: `users/{userId}/transactions`
   - Campo: `date` (descendente)

2. **Transacciones por cuenta**
   - Colección: `users/{userId}/transactions`
   - Campo: `accountId` (ascendente)

3. **Transacciones por rango de fechas**
   - Colección: `users/{userId}/transactions`
   - Campos: `date` (ascendente), `accountId` (ascendente)

### Estructura de Datos

```
users/{userId}/
├── accounts/{accountId}
│   ├── name: string
│   ├── type: "efectivo" | "cuenta_corriente" | "tarjeta" | "ahorro" | "otro"
│   ├── initialBalance?: number
│   └── createdAt: number
├── categories/{categoryId}
│   ├── name: string
│   ├── kind: "ingreso" | "gasto"
│   ├── icon?: string
│   └── createdAt: number
├── transactions/{transactionId}
│   ├── type: "ingreso" | "gasto"
│   ├── amount: number
│   ├── date: number
│   ├── accountId: string
│   ├── categoryId: string
│   ├── note?: string
│   └── createdAt: number
└── (user document)
    ├── displayName?: string
    ├── monthCutoffDay: number
    └── theme: "dark" | "light" | "system"
```

## 🚀 Deploy en Vercel

1. **Conectar repositorio a Vercel**
   - Ir a [Vercel Dashboard](https://vercel.com/dashboard)
   - Importar proyecto desde GitHub/GitLab
   - Configurar variables de entorno

2. **Variables de entorno en Vercel**
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Deploy automático**
   - Vercel detectará automáticamente Next.js
   - El build se ejecutará con `pnpm build`
   - La PWA se generará automáticamente

## 📱 Instalación como PWA

### En dispositivos móviles:
1. Abrir la app en el navegador
2. Tocar el menú del navegador
3. Seleccionar "Agregar a pantalla de inicio" o "Instalar app"

### En desktop:
1. Abrir la app en Chrome/Edge
2. Buscar el ícono de instalación en la barra de direcciones
3. Hacer clic en "Instalar Lukita"

## 🎨 Personalización

### Tema
- Tema oscuro por defecto
- Soporte para tema claro y sistema
- Configurable desde Ajustes

### Moneda
- Formato CLP (pesos chilenos)
- Sin decimales
- Formateo automático con `Intl.NumberFormat`

### Corte de Mes
- Configurable por usuario (1-28)
- Afecta reportes y filtros de período
- Por defecto día 1

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm dev

# Build para producción
pnpm build

# Iniciar servidor de producción
pnpm start

# Linting
pnpm lint
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/          # Rutas de autenticación
│   ├── (main)/          # Rutas principales con navegación
│   ├── globals.css      # Estilos globales
│   ├── layout.tsx       # Layout raíz
│   └── page.tsx         # Página de inicio (redirect)
├── components/
│   ├── ui/              # Componentes base (Button, Input, etc.)
│   ├── forms/           # Formularios específicos
│   ├── Navigation.tsx   # Navegación inferior
│   ├── OfflineIndicator.tsx
│   └── ProtectedRoute.tsx
├── lib/
│   ├── auth.ts          # Helpers de autenticación
│   ├── clp.ts           # Formateo de moneda CLP
│   ├── dates.ts         # Helpers de fechas y períodos
│   ├── firebase.ts      # Configuración de Firebase
│   ├── firestore.ts     # CRUD helpers
│   ├── offline-queue.ts # Cola de sincronización offline
│   ├── theme.ts         # Gestión de temas
│   └── utils.ts         # Utilidades generales
├── schemas/             # Validaciones Zod
├── types/               # Tipos TypeScript
└── ...
```

## 🐛 Solución de Problemas

### Error de Firebase
- Verificar que las variables de entorno estén correctas
- Comprobar que Firebase Auth esté habilitado
- Revisar las reglas de Firestore

### PWA no se instala
- Verificar que el manifest.json esté accesible
- Comprobar que el service worker esté registrado
- Usar HTTPS en producción

### Problemas de offline
- Verificar que next-pwa esté configurado correctamente
- Comprobar que el service worker esté funcionando
- Revisar la consola del navegador para errores

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Soporte

Para reportar bugs o solicitar features, crear un issue en GitHub.