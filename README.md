# Lukita - PWA de Finanzas Personales

Una Progressive Web App (PWA) para gestionar finanzas personales, construida con Next.js 15, Firebase y TypeScript.

## 🚀 Características

### ✨ Funcionalidades Principales
- **PWA Instalable**: Funciona offline y se puede instalar en dispositivos móviles y desktop
- **Tema Oscuro**: Interfaz oscura por defecto con soporte para tema claro y sistema
- **Moneda CLP**: Manejo de pesos chilenos sin decimales
- **Corte de Mes Configurable**: Período contable personalizable (por defecto día 1)
- **Autenticación Segura**: Sistema de login/registro con Firebase Auth
- **CRUD Completo**: Gestión de cuentas, categorías y transacciones
- **Dashboard Inteligente**: Resumen financiero con saldos calculados y resumen mensual
- **Filtros Avanzados**: Búsqueda y filtrado de transacciones
- **Soporte Offline**: Cola de sincronización para transacciones sin conexión

### 🆕 Novedades v0.4.4
- **💰 Presupuestos por Categoría**: Sistema completo de presupuestos mensuales con ajustes por mes
- **🔄 Transacciones Recurrentes**: Automatización de transacciones regulares con pausa/reanudación
- **📊 Dashboard Mejorado**: Integración de presupuestos y recurrentes en tiempo real
- **🎯 Ajustes Mensuales**: Modificación de presupuestos por mes específico desde el dashboard
- **🔔 Sistema de Toasts**: Notificaciones visuales para todas las operaciones CRUD
- **🎨 Iconos de Categorías**: Visualización correcta de iconos en presupuestos y recurrentes
- **⚡ Actualizaciones en Tiempo Real**: Listeners de Firestore para datos siempre actualizados
- **🎨 Diseño Consistente**: Alineación visual con páginas existentes (categorías, cuentas)

### 🆕 Novedades v0.4.3
- **🔍 Búsqueda Avanzada**: Sistema completo de filtros con múltiples criterios
- **💾 Vistas Guardadas**: Guarda y carga configuraciones de filtros personalizadas
- **🎯 Filtros Múltiples**: Selección múltiple de cuentas y categorías
- **💰 Rango de Montos**: Filtrado por montos mínimo y máximo
- **📝 Búsqueda de Texto**: Filtrado por contenido en notas de transacciones
- **📅 Rango de Fechas**: Filtrado por períodos personalizables
- **🎨 UI Optimizada**: Interfaz mejorada con botones reorganizados y flujo intuitivo

### 🆕 Novedades v0.3.0
- **🎨 Sistema de Colores para Cuentas**: Paleta de 8 colores únicos para diferenciar cuentas visualmente
- **📊 Gráficos de Resumen Mensual**: Barras horizontales en dashboard y gráfico de torta en transacciones
- **💸 Transferencias entre Cuentas**: Funcionalidad completa con operaciones atómicas y diseño especial
- **🔢 Límite de Cuentas**: Máximo de 8 cuentas con validación inteligente y mensajes dinámicos
- **🎯 Bordes Coloreados**: Identificación visual rápida de cuentas en todas las listas
- **🔗 URLs Inteligentes Mejoradas**: Soporte case-insensitive y abreviaciones (i/g para ingreso/gasto)
- **⚡ Sincronización Mejorada**: Sistema de eventos personalizados para actualizaciones en tiempo real

### 🆕 Novedades v0.2.2
- **Dashboard Mejorado**: Las transacciones recientes muestran el nombre de la categoría cuando no tienen descripción
- **URLs Inteligentes Optimizadas**: Búsqueda más flexible de categorías y cuentas por nombre con coincidencias parciales
- **Formularios Mejorados**: Mejor manejo de valores por defecto y carga asíncrona de datos
- **Correcciones de Bugs**: Solucionados problemas de selección automática de campos desde URLs

### 🆕 Novedades v0.2
- **Categorías Universales**: Las categorías ya no están limitadas a ingreso/gasto, se especifica el tipo al crear la transacción
- **Resumen Mensual**: Nueva card en el dashboard con navegación entre meses y desglose por categorías
- **Menú FAB Mejorado**: Botón flotante con menú desplegable para crear transacciones, cuentas y categorías
- **URLs Inteligentes**: Crear transacciones desde URLs con parámetros pre-llenados
- **Recuperación de Contraseña**: Sistema completo de recuperación y cambio de contraseña
- **Diseño Mejorado**: Interfaz más consistente con iconos y menús desplegables
- **Navegación Optimizada**: Padding adicional para PWA instalada y mejor experiencia móvil

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
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Cuentas del usuario
      match /accounts/{accountId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Categorías del usuario
      match /categories/{categoryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Transacciones del usuario
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Transferencias del usuario
      match /transfers/{transferId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Presupuestos por categoría (v0.4.4+)
      match /budgets/{budgetId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Ajustes mensuales de presupuestos (v0.4.4+)
      match /budgetAdjustments/{adjustmentId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Transacciones recurrentes (v0.4.4+)
      match /recurring/{recurringId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
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
│   ├── color?: string
│   └── createdAt: number
├── categories/{categoryId}
│   ├── name: string
│   ├── kind?: "ingreso" | "gasto" (opcional desde v0.2)
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
├── budgets/{budgetId} (v0.4.4+)
│   ├── categoryId: string
│   ├── defaultAmount: number
│   └── createdAt: number
├── budgetAdjustments/{adjustmentId} (v0.4.4+)
│   ├── budgetId: string
│   ├── month: string (MM-YYYY)
│   ├── adjustedAmount: number
│   └── createdAt: number
├── recurring/{recurringId} (v0.4.4+)
│   ├── type: "ingreso" | "gasto"
│   ├── amount: number
│   ├── accountId: string
│   ├── categoryId: string
│   ├── note?: string
│   ├── recurrence: "mensual" | "quincenal" | "semanal"
│   ├── isPaused: boolean
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

## 🔗 URLs Inteligentes (v0.2+)

Lukita soporta la creación de transacciones mediante URLs con parámetros pre-llenados, ideal para atajos de iPhone y integraciones. **v0.3.0** incluye mejoras significativas en flexibilidad y búsqueda inteligente.

### Sintaxis
```
/transactions/new?type=<tipo>&amount=<monto>&note=<descripción>&category=<nombre_categoría>&account=<nombre_cuenta>
```

### Parámetros Disponibles
- `type`: `ingreso`/`gasto` (case-insensitive) o abreviaciones `i`/`g`
- `amount`: Monto numérico (ej: `5000`)
- `note`: Descripción de la transacción
- `category`: Nombre de la categoría (búsqueda inteligente por nombre)
- `account`: Nombre de la cuenta (búsqueda inteligente por nombre)
- `categoryId`: ID de la categoría (alternativo a `category`)
- `accountId`: ID de la cuenta (alternativo a `account`)

### 🔍 Búsqueda Inteligente (v0.2.2+)
La búsqueda de categorías y cuentas por nombre es ahora más flexible:
- **Coincidencias exactas**: `"comidas"` encuentra `"Comidas"`
- **Coincidencias parciales**: `"comida"` encuentra `"Comidas"`
- **Sin distinción de mayúsculas**: `"COMIDA"` encuentra `"comidas"`
- **Espacios ignorados**: `"banco chile"` encuentra `"Banco Chile"`

### Ejemplos
```bash
# Transacción básica
/transactions/new?type=gasto&amount=5000&note=Almuerzo

# Con categoría y cuenta por nombre
/transactions/new?type=gasto&amount=5000&note=Almuerzo&category=Comida&account=Efectivo

# Ingreso completo
/transactions/new?type=ingreso&amount=500000&note=Salario&category=Trabajo&account=Cuenta Corriente
```

### Casos de Uso
- **Atajos de iPhone**: Crear transacciones rápidas desde el centro de control
- **Integraciones**: Sistemas externos pueden crear transacciones via URL
- **Bookmarks**: Guardar URLs para transacciones frecuentes
- **Compartir**: Enviar enlaces para crear transacciones específicas

## 💸 Transferencias entre Cuentas (v0.3+)

Lukita incluye funcionalidad completa de transferencias entre cuentas con operaciones atómicas y diseño especial.

### Características
- **Operación Atómica**: Actualización simultánea de balances usando Firebase batch
- **Transacciones Automáticas**: Se crean automáticamente para el historial
- **Categoría del Sistema**: "transferencia entre cuentas" creada automáticamente
- **Diseño Especial**: Bordes laterales y icono ArrowRightLeft en el historial
- **Validación de Saldo**: Verificación de saldo suficiente antes de transferir
- **Acceso Múltiple**: Disponible desde FAB y pantalla de transacciones

### Requisitos
- Mínimo 2 cuentas creadas
- Saldo suficiente en cuenta origen
- Cuentas diferentes para origen y destino

### Flujo de Transferencia
1. Seleccionar cuenta origen y destino
2. Ingresar monto con formato CLP
3. Agregar nota opcional
4. Confirmar transferencia
5. Balances se actualizan automáticamente
6. Aparece en historial con diseño especial

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