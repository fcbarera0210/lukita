# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere al [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [0.4.3] - 18-01-2025

### ✨ Nuevas Funcionalidades
- **Búsqueda Avanzada Completa**: Sistema de filtros avanzados con múltiples criterios
- **Vistas Guardadas**: Capacidad de guardar y cargar configuraciones de filtros personalizadas
- **Filtros Múltiples**: Selección múltiple de cuentas y categorías
- **Rango de Montos**: Filtrado por rango mínimo y máximo de montos
- **Búsqueda de Texto**: Filtrado por contenido en notas de transacciones
- **Rango de Fechas**: Filtrado por período de fechas personalizable

### 🎨 Mejoras de UI/UX
- **Interfaz Optimizada**: Botones reorganizados para mejor flujo de trabajo
- **Modal Centrado**: Vistas guardadas aparecen centradas en pantalla
- **Botón Limpiar**: Acceso rápido para resetear todos los filtros
- **Guardar en Contexto**: Botón de guardar vista ubicado en la card de filtros
- **Cierre Automático**: Modal se cierra al cargar vista o hacer clic fuera

### 🔧 Técnico
- **Componente AdvancedFilters**: Nuevo componente modular para filtros avanzados
- **FilterActionButtons**: Componente especializado para acciones de filtros
- **Utilidades de Filtrado**: Funciones optimizadas para filtrado complejo
- **LocalStorage**: Persistencia de vistas guardadas en navegador
- **TypeScript**: Tipado completo para estados de filtros avanzados

### 🎯 Funcionalidades Implementadas
- ✅ **Filtros Básicos**: Tipo, cuenta, categoría, fechas
- ✅ **Filtros Avanzados**: Múltiples cuentas, múltiples categorías, rango de montos
- ✅ **Búsqueda de Texto**: Filtrado por contenido en notas
- ✅ **Vistas Guardadas**: Guardar, cargar y eliminar configuraciones
- ✅ **Interfaz Intuitiva**: Botones organizados y flujo optimizado
- ✅ **Persistencia**: Vistas guardadas se mantienen entre sesiones

### 📱 Experiencia de Usuario
- **Flujo Optimizado**: Aplicar → Guardar → Cargar → Limpiar
- **Acceso Rápido**: Botones de acción siempre visibles cuando hay filtros
- **Feedback Visual**: Indicadores claros de filtros activos
- **Navegación Intuitiva**: Modal centrado y fácil de cerrar

## [0.3.11] - 18-01-2025

### 🐛 Corregido
- **Categoría de Transferencias en Formularios**: Eliminada la categoría "transferencia entre cuentas" de los formularios de nueva transacción (FAB y página)
- **Icono Inconsistente de Transferencias**: Corregido icono de transferencias en dashboard para usar `ArrowRightLeft` consistente con pantalla de transacciones

### 🔧 Técnico
- **Filtrado de Categorías**: 
  - `src/app/transactions/new/page.tsx`: Filtrado de categoría "transferencia entre cuentas" antes de mostrar en formulario
  - `src/components/Navigation.tsx`: Filtrado de categoría "transferencia entre cuentas" en FAB y recarga de categorías
- **Icono Consistente**:
  - `src/app/dashboard/page.tsx`: Agregado `ArrowRightLeft` import y lógica para detectar transferencias
  - Dashboard ahora usa `ArrowRightLeft` para transferencias, igual que la pantalla de transacciones

### 🎯 Problema Resuelto
- **Antes**: 
  - La categoría "transferencia entre cuentas" aparecía en formularios de nueva transacción (no debería)
  - Dashboard mostraba icono diferente para transferencias que la pantalla de transacciones
- **Ahora**: 
  - La categoría "transferencia entre cuentas" solo es visible en pantalla de categorías (como categoría del sistema)
  - Dashboard y pantalla de transacciones usan el mismo icono `ArrowRightLeft` para transferencias
  - Consistencia visual total en toda la aplicación

### 🔍 Cambios Específicos
- ✅ **Formularios**: Categoría "transferencia entre cuentas" filtrada de FAB y página de nueva transacción
- ✅ **Dashboard**: Icono `ArrowRightLeft` para transferencias con color azul consistente
- ✅ **Pantalla de Transacciones**: Ya tenía el icono correcto, ahora es consistente con dashboard
- ✅ **Categorías**: La categoría sigue siendo visible en pantalla de categorías (como debe ser)

### 🎨 Consistencia Visual
- **Transferencias**: Icono `ArrowRightLeft` azul en dashboard y pantalla de transacciones
- **Otras Categorías**: Iconos específicos de cada categoría usando `getCategoryIcon`
- **Filtrado**: Solo categorías editables por el usuario aparecen en formularios

## [0.3.10] - 18-01-2025

### 🐛 Corregido
- **FAB Desapareciendo**: Corregido problema donde el FAB desaparecía después de actualizar datos desde cualquier modal de formulario
- **Modal de Edición de Transacciones**: Agregado `setIsFormOpen(false)` faltante en `handleEditTransaction`
- **FAB Context**: Integrado `useFabContext` en el componente `FloatingActionButton` para restaurar correctamente el estado del FAB

### 🔧 Técnico
- **Navigation.tsx**: 
  - Agregado `useFabContext` import y hook
  - Agregado `setIsFormOpen(false)` a todos los handlers de creación (`handleCreateTransaction`, `handleCreateAccount`, `handleCreateCategory`, `handleCreateTransfer`)
  - Agregado `setIsFormOpen(false)` a todos los handlers de cierre (`onClose`, `onCancel`) de todos los modales
- **Transactions Page**: Agregado `setIsFormOpen(false)` a `handleEditTransaction`
- **Consistencia**: Todos los modales ahora restauran correctamente el estado del FAB

### 🎯 Problema Resuelto
- **Antes**: 
  - Al actualizar datos desde modales, el FAB desaparecía y no volvía a aparecer hasta recargar la página
  - El estado `isFormOpen` permanecía en `true`, ocultando el FAB globalmente
  - Solo algunos modales tenían `setIsFormOpen(false)`
- **Ahora**: 
  - Todos los modales restauran correctamente el estado del FAB
  - El FAB permanece visible después de cualquier operación de actualización
  - Consistencia total en el manejo del estado del FAB

### 🔍 Modales Corregidos
- ✅ **FAB Modales**: TransactionForm, AccountForm, CategoryForm, TransferForm
- ✅ **Page Modales**: TransactionForm (edición), AccountForm (edición), CategoryForm (edición)
- ✅ **Handlers**: Todos los `onClose` y `onCancel` ahora restauran el FAB
- ✅ **Creación**: Todos los handlers de creación restauran el FAB
- ✅ **Edición**: Todos los handlers de edición restauran el FAB

## [0.3.9] - 18-01-2025

### 🐛 Corregido
- **Discrepancia en Cálculo de Balance**: Corregido problema donde el balance mostrado en el dashboard no coincidía con el de la pantalla de cuentas
- **Cálculo Dinámico Incorrecto**: El dashboard estaba usando `initialBalance` como base para cálculos dinámicos en lugar del campo `balance` fijo
- **Edición de Saldo Inicial**: Prevenido que se pueda editar el campo `initialBalance` después de crear una cuenta

### 🔧 Técnico
- **Dashboard**: Modificado para usar directamente `account.balance` en lugar de `calculateAccountBalance(account.id, account.initialBalance)`
- **AccountForm**: Campo `initialBalance` ahora es de solo lectura cuando se edita una cuenta existente
- **Consistencia de Datos**: Todos los cálculos de balance ahora usan el campo `balance` fijo, no cálculos dinámicos

### 🎯 Problema Resuelto
- **Antes**: 
  - Dashboard calculaba balance dinámicamente usando `initialBalance + transacciones`
  - Pantalla de cuentas mostraba `account.balance` directamente
  - Al editar `initialBalance`, esto afectaba el cálculo del dashboard
- **Ahora**: 
  - Dashboard usa directamente `account.balance` (consistente con pantalla de cuentas)
  - Campo `initialBalance` es de solo lectura al editar cuentas
  - Todos los balances son consistentes en toda la aplicación

### 🚫 Prevención de Errores
- **Campo InitialBalance**: Deshabilitado en formulario de edición con mensaje explicativo
- **Validación Visual**: Campo muestra "(no editable)" en el label cuando se está editando
- **Consistencia**: Eliminada la función `calculateAccountBalance` no utilizada del dashboard

## [0.3.8] - 18-01-2025

### 🐛 Corregido
- **Campo Monto Inicial en Edición de Cuentas**: Corregido problema donde al editar una cuenta, el campo "Monto inicial" mostraba el balance actual en lugar del monto inicial original
- **Preservación del Balance**: El balance actual de la cuenta ya no se sobrescribe al editar la cuenta

### 🔧 Técnico
- **handleEditAccount**: Modificado para excluir el campo `balance` al actualizar cuentas existentes
- **Preservación de Datos**: Solo se actualizan los campos editables (name, type, color, initialBalance) sin afectar el balance actual

### 🎯 Problema Resuelto
- **Antes**: Al editar una cuenta, el balance actual se sobrescribía con el monto inicial, perdiendo el historial de transacciones
- **Ahora**: Al editar una cuenta, el balance actual se preserva y solo se actualizan los campos editables
- **Resultado**: El balance de la cuenta mantiene su valor correcto después de editar, sin necesidad de crear nuevas transacciones

## [0.3.7] - 18-01-2025

### 🐛 Corregido
- **Modal de Edición de Transacciones**: Corregido problema donde el modal no se cerraba después de editar una transacción
- **Consistencia de Modales**: Todos los modales de formularios ahora se cierran correctamente después de operaciones exitosas

### 🔧 Técnico
- **handleEditTransaction**: Agregado `setIsModalOpen(false)` para cerrar el modal después de editar
- **Verificación Completa**: Confirmado que todos los demás formularios ya cerraban correctamente sus modales

### 🎯 Problema Resuelto
- **Antes**: Modal de edición de transacciones permanecía abierto después de guardar cambios
- **Ahora**: Modal se cierra automáticamente después de editar exitosamente
- **Resultado**: Experiencia de usuario mejorada con comportamiento consistente en todos los modales

## [0.3.6] - 18-01-2025

### 🔄 Refactorización Mayor
- **Sistema de Balance Completamente Rediseñado**: Cambio fundamental en la lógica de balance de cuentas
- **Campo Balance Mutable**: Implementado campo `balance` que se actualiza directamente con cada transacción/transferencia
- **Eliminación de Cálculo Dinámico**: Removido el cálculo dinámico de balance basado en transacciones
- **Migración Automática**: Sistema de migración para actualizar cuentas existentes al nuevo modelo

### 🐛 Corregido
- **Balance Inconsistente**: Resuelto problema de discrepancia entre balance mostrado y balance usado en transferencias
- **Campo originalInitialBalance**: Eliminado campo innecesario que causaba confusión
- **Cálculo Incorrecto**: Balance ahora se mantiene consistente entre todas las pantallas
- **Edición de Transacciones**: Balance ahora se actualiza correctamente al editar transacciones
- **Eliminación de Transacciones**: Balance ahora se actualiza correctamente al eliminar transacciones
- **Eliminación de Transferencias**: Balance ahora se actualiza correctamente al eliminar transferencias

### 🔧 Técnico
- **Account Interface**: Agregado campo `balance: number` requerido
- **createAccount**: Inicializa `balance` con `initialBalance`
- **createTransaction**: Actualiza `balance` directamente después de crear transacción
- **updateTransaction**: Actualiza `balance` después de editar transacción
- **deleteTransaction**: Actualiza `balance` después de eliminar transacción
- **createTransfer**: Actualiza `balance` de ambas cuentas directamente
- **deleteTransfer**: Elimina transacciones asociadas y actualiza balances de ambas cuentas
- **updateAccountBalance**: Nueva función para recalcular balance basado en transacciones
- **migrateAccountsToNewBalanceSystem**: Migración automática para cuentas existentes
- **Pantalla de Cuentas**: Muestra `account.balance` directamente en lugar de cálculo dinámico

### 🎯 Problema Resuelto
- **Antes**: Balance calculado dinámicamente → inconsistencia entre pantallas
- **Ahora**: Balance actualizado directamente → consistencia total
- **Resultado**: Balance de transferencias coincide exactamente con balance mostrado en pantalla de cuentas

## [0.3.5] - 18-01-2025

### 🐛 Corregido
- **Cálculo de Balance Crítico**: Corregido problema fundamental en cálculo de balance de transferencias
- **Saldo Inicial Original**: Implementado campo `originalInitialBalance` para mantener referencia original
- **Migración de Datos**: Agregada migración automática para cuentas existentes
- **Consistencia de Datos**: Balance ahora se calcula correctamente usando saldo inicial original

### 🔧 Técnico
- **Account Interface**: Agregado campo `originalInitialBalance` opcional
- **createAccount**: Ahora guarda `originalInitialBalance` al crear cuentas
- **migrateAccounts**: Función de migración para cuentas existentes
- **createTransfer**: Usa `originalInitialBalance` para cálculo correcto
- **Logs de Debug**: Mejorados para diagnosticar problemas de balance

### 🎯 Problema Resuelto
- **Antes**: Transferencias usaban `initialBalance` modificado → cálculo incorrecto
- **Ahora**: Transferencias usan `originalInitialBalance` → cálculo correcto
- **Resultado**: Balance de transferencias coincide con balance mostrado en pantalla de cuentas

## [0.3.4] - 18-01-2025

### 🐛 Corregido
- **Cálculo de Balance**: Corregido cálculo incorrecto de balance en transferencias
- **Saldo Inicial**: Mantenido saldo inicial original de cuentas sin modificar por transferencias
- **Balance Dinámico**: Balance ahora se calcula correctamente desde saldo inicial + transacciones

### 🔧 Técnico
- **createTransfer**: Creada función `calculateAccountBalance` para cálculo correcto
- **initialBalance**: Ya no se modifica por transferencias, se mantiene como referencia original
- **Transacciones**: Las transferencias se reflejan solo en las transacciones, no en initialBalance
- **Logs de Debug**: Mejorados logs para diagnosticar problemas de balance

## [0.3.3] - 18-01-2025

### 🐛 Corregido
- **Transferencias**: Corregido cálculo incorrecto de saldo en transferencias
- **Mensajes de Error**: Mejorados mensajes de error para mostrar información específica al usuario
- **Validación de Saldo**: Agregados logs de debug para diagnosticar problemas de saldo

### 🔧 Técnico
- **createTransfer**: Mejorado cálculo de balance con logs detallados
- **TransferForm**: Mejorado manejo de errores para mostrar mensajes específicos
- **Mensajes de Error**: Ahora muestran saldo disponible vs monto solicitado

## [0.3.2] - 18-01-2025

### 🐛 Corregido
- **Formulario de Transferencias**: Corregido error de validación de formato en campo de monto
- **Input Pattern**: Eliminado atributo `pattern="[0-9]*"` que causaba conflicto con formato CLP
- **Validación HTML5**: Mejorada compatibilidad entre formato CLP y validación del navegador

### 🔧 Técnico
- **TransferForm**: Removido `pattern` que impedía mostrar formato "$5.000"
- **Input Mode**: Mantenido `inputMode="numeric"` para teclado numérico en móviles
- **Formato CLP**: Ahora funciona correctamente sin conflictos de validación

## [0.3.1] - 18-01-2025

### 🐛 Corregido
- **Formulario de Transferencias**: Corregido error "str.replace is not a function" al abrir el formulario
- **Funciones CLP**: Mejorado manejo de valores nulos/indefinidos en `formatCLP` y `parseCLP`
- **Validación de Tipos**: Agregada validación robusta para evitar errores de tipo en campos de monto

### 🔧 Técnico
- **formatCLP**: Ahora maneja valores `undefined`, `null` y `NaN` correctamente
- **parseCLP**: Convertido para aceptar múltiples tipos de entrada y manejar casos edge
- **TransferForm**: Validación mejorada del campo amount antes de formatear

## [0.3.0] - 18-01-2025

### ✨ Agregado
- **URLs Inteligentes Mejoradas**: 
  - Soporte para tipos de transacción case-insensitive (INGRESO/ingreso/i)
  - Abreviaciones para tipos: 'i' para ingreso, 'g' para gasto
  - Búsqueda más robusta de categorías y cuentas por nombre
- **Sistema de Colores para Cuentas**:
  - Paleta de 8 colores únicos para diferenciar cuentas
  - Selector visual de colores en formulario de cuentas
  - Colores no repetibles entre cuentas
  - Asignación automática de colores disponibles
- **Límite de Cuentas**:
  - Máximo de 8 cuentas por usuario
  - Validación en formulario y FAB
  - Mensaje dinámico que cambia a amarillo con 6+ cuentas
  - Botones deshabilitados cuando se alcanza el límite
- **Bordes Coloreados**:
  - Bordes prominentes con color de cuenta en todas las cards
  - Aplicado en listas de transacciones, cuentas y dashboard
  - Identificación visual rápida de cuentas asociadas
- **Gráficos de Resumen Mensual**:
  - Gráfico de barras horizontales en dashboard
  - Gráfico de torta en pantalla de transacciones
  - Porcentajes de gastos por categoría
  - Botones para expandir/colapsar con diseño consistente
- **Transferencias entre Cuentas**:
  - Funcionalidad completa de transferencias
  - Operación atómica con actualización de balances
  - Transacciones automáticas para historial
  - Categoría automática "transferencia entre cuentas"
  - Diseño especial en historial (bordes laterales, icono ArrowRightLeft)
  - Disponible desde FAB y pantalla de transacciones
  - Validación de saldo suficiente

### 🔄 Cambiado
- **Pantalla de Transacciones**:
  - Card de filtros colapsada por defecto
  - Card de gastos mensuales expandida por defecto
  - Diseño consistente con dashboard (título + icono + botón)
  - Gráfico responde a filtros aplicados
- **Pantalla de Cuentas**:
  - Balances calculados dinámicamente (saldo inicial + transacciones)
  - Actualización automática con eventos de transacciones
  - Formato CLP correcto en lugar de "$NaN"
- **Pantalla de Categorías**:
  - Categoría "transferencia entre cuentas" oculta de la lista
  - Protegida contra edición/eliminación
- **Formulario de Transferencias**:
  - Selectores muestran solo nombre de cuenta
  - Cuenta origen filtrada del selector de destino
  - Input de monto con formato CLP completo
  - Vista previa de transferencia con colores de cuentas

### 🐛 Corregido
- **FAB**: Corregido problema donde desaparecía al cerrar modales de transferencias
- **Balances**: Corregido "$NaN" en pantalla de cuentas usando cálculo dinámico
- **Eventos**: Mejorada sincronización entre componentes con sistema de eventos personalizados
- **Formularios**: Corregido formato de opciones en selectores de cuentas
- **Validaciones**: Mejoradas validaciones de límites y saldos

### 🔧 Técnico
- **Sistema de Eventos**: Implementado sistema de eventos personalizados para sincronización
- **Cálculo de Balances**: Función `calculateAccountBalance` para balances dinámicos
- **Operaciones Atómicas**: Uso de `writeBatch` para transferencias
- **Esquemas Dinámicos**: Validación de nombres únicos en cuentas
- **Componentes de Gráficos**: Barras horizontales y torta con CSS/SVG
- **Filtrado Inteligente**: Lógica mejorada para búsquedas y filtros

## [0.2.2] - 16-01-2025

### ✨ Agregado
- **Dashboard Mejorado**: Las transacciones recientes ahora muestran el nombre de la categoría cuando no tienen descripción, manteniendo consistencia con la pantalla de transacciones
- **URLs Inteligentes Mejoradas**: 
  - Búsqueda más flexible de categorías y cuentas por nombre
  - Soporte para coincidencias parciales y sin distinción de mayúsculas/minúsculas
  - Mejor manejo de espacios en blanco en los nombres

### 🔄 Cambiado
- **Formulario de Transacciones**: 
  - Mejorado el manejo de valores por defecto desde URLs
  - Los campos ahora se actualizan correctamente cuando se cargan los datos de forma asíncrona
  - Búsqueda inteligente de categorías y cuentas por nombre

### 🐛 Corregido
- **Selección de Campos**: Corregido problema donde la cuenta y categoría no se seleccionaban automáticamente desde URLs con parámetros
- **React Hooks**: Corregido error de hooks condicionales que causaba problemas de renderizado
- **Timing de Datos**: Mejorado el manejo de carga asíncrona de datos para URLs inteligentes

### 🔧 Técnico
- **TransactionForm**: Agregado `useEffect` para actualizar valores del formulario cuando cambian los `defaultValues`
- **Búsqueda Inteligente**: Implementada lógica de búsqueda más robusta para nombres de categorías y cuentas
- **Performance**: Optimizado el orden de ejecución de hooks para evitar errores de React

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
