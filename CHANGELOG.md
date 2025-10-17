# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere al [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 16-10-2025

### 🐛 Corregido
- **Carga Infinita en URLs**: Corregido problema de carga infinita al acceder a `/transactions/new` sin estar autenticado
- **Timeout de Autenticación**: Mejorado el manejo del timeout de autenticación para evitar borrar sesiones activas
- **Validación de Usuario**: Mejorada la lógica de validación de usuario autenticado en páginas protegidas

## [0.2.0] - 16-10-2025

### ✨ Agregado
- **Categorías Universales**: Las categorías ya no están limitadas a ingreso/gasto, se especifica el tipo al crear la transacción
- **Resumen Mensual**: Nueva card en el dashboard con navegación entre meses y desglose por categorías
- **Menú FAB Mejorado**: Botón flotante con menú desplegable para crear transacciones, cuentas y categorías
- **URLs Inteligentes**: Crear transacciones desde URLs con parámetros pre-llenados
  - Soporte para `type`, `amount`, `note`, `category`, `account`, `categoryId`, `accountId`
  - Búsqueda por nombre de categoría y cuenta
  - Ideal para atajos de iPhone e integraciones
- **Sistema de Recuperación de Contraseña**: 
  - Recuperación de contraseña desde la pantalla de login
  - Cambio de contraseña desde ajustes con validación de contraseña actual
- **Diseño Mejorado**: 
  - Interfaz más consistente con iconos y menús desplegables
  - Headers uniformes en todas las pantallas
  - Menús desplegables para editar/eliminar en listas
- **Navegación Optimizada**: 
  - Padding adicional para PWA instalada
  - FAB se oculta automáticamente cuando se abren modales
  - Mejor experiencia móvil

### 🔄 Cambiado
- **Dashboard**: 
  - Eliminada card de "Acciones Rápidas"
  - Saldos de cuentas ahora se calculan sumando/descontando transacciones
  - Resumen mensual con navegación entre meses
  - Iconos de categoría en transacciones recientes
- **Lista de Transacciones**: 
  - Iconos de categoría en lugar de flechas de tipo
  - Menú desplegable para editar/eliminar
  - Diseño consistente con el dashboard
- **Formulario de Categorías**: 
  - Eliminado selector de tipo (ingreso/gasto)
  - Categorías ahora son universales
- **Formulario de Transacciones**: 
  - Muestra todas las categorías disponibles
  - Soporte para valores por defecto desde URL
- **Pantalla de Ajustes**: 
  - Títulos de secciones fuera de las cards
  - Descripciones informativas para cada sección
  - Botón de logout en el header con estilo distintivo
- **Esquemas y Tipos**: 
  - Campo `kind` en categorías ahora es opcional
  - Compatibilidad con categorías existentes

### 🐛 Corregido
- **FAB**: Ya no se superpone con modales abiertos
- **Saldos**: Cálculo correcto de balances de cuentas
- **Navegación**: Padding adecuado para PWA instalada
- **Compilación**: Errores de TypeScript y linting corregidos
- **Suspense**: Wrappers agregados para `useSearchParams`

### 🔧 Técnico
- **Dependencias**: Actualizadas a versiones más recientes
- **TypeScript**: Mejor tipado y validación
- **Performance**: Optimizaciones en carga de datos
- **PWA**: Mejor soporte offline y cache

## [0.1.0] - 15-10-2025

### ✨ Agregado
- **PWA Básica**: Funcionalidad offline e instalable
- **Autenticación**: Sistema de login/registro con Firebase Auth
- **Gestión de Cuentas**: CRUD completo para cuentas bancarias
- **Gestión de Categorías**: CRUD completo para categorías de transacciones
- **Gestión de Transacciones**: CRUD completo para transacciones financieras
- **Dashboard**: Resumen financiero básico con saldos y últimas transacciones
- **Filtros**: Búsqueda y filtrado de transacciones por tipo, cuenta, categoría y fecha
- **Temas**: Soporte para tema oscuro, claro y sistema
- **Configuración**: Corte de mes personalizable
- **Moneda CLP**: Manejo de pesos chilenos sin decimales
- **Responsive**: Diseño adaptativo para móviles y desktop

### 🛠️ Stack Inicial
- **Frontend**: Next.js 15 con App Router, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **PWA**: next-pwa para service worker y cache
- **UI**: Componentes personalizados con Lucide React icons
- **Formularios**: React Hook Form + Zod para validación
- **Fechas**: date-fns con locale es-CL
- **Deploy**: Vercel

---

## Formato de Versiones

- **MAJOR**: Cambios incompatibles en la API
- **MINOR**: Nueva funcionalidad compatible hacia atrás
- **PATCH**: Correcciones de bugs compatibles hacia atrás

## Tipos de Cambios

- ✨ **Agregado**: Nueva funcionalidad
- 🔄 **Cambiado**: Cambios en funcionalidad existente
- 🐛 **Corregido**: Correcciones de bugs
- 🔧 **Técnico**: Cambios técnicos o de infraestructura
- 📚 **Documentación**: Cambios en documentación
- 🎨 **Diseño**: Cambios en UI/UX
- ⚡ **Performance**: Mejoras de rendimiento
- 🔒 **Seguridad**: Mejoras de seguridad
