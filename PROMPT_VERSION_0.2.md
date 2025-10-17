# 🚀 Prompt para Actualización Lukita v0.2

## Contexto
Necesito actualizar la aplicación Lukita de la versión 0.1 a la 0.2 con mejoras significativas en UX/UI y funcionalidades. La app es una PWA de finanzas personales construida con Next.js 15, Firebase, TypeScript y Tailwind CSS.

## 📋 Tareas a Realizar

### 1. **Mejoras de Navegación y UX**
- [x] Agregar padding en la barra de navegación inferior para PWA instalada
- [x] Modificar botones de "nueva transacción" para ir directo al formulario
- [x] Ocultar botón flotante cuando el formulario esté abierto
- [x] Reemplazar botón flotante por menú desplegable con opciones

### 2. **Dashboard Mejorado**
- [x] Eliminar card de "Acciones Rápidas"
- [x] Agregar nueva card de resumen mensual (ingresos/gastos)
- [x] Implementar botón desplegable en la card de resumen
- [x] Mostrar categorías ordenadas por gasto (mayor a menor) en vista expandida

### 3. **Lista de Transacciones**
- [x] Cambiar íconos para mostrar ícono de categoría
- [x] Mover flecha a la derecha del monto (sin círculo de fondo)
- [x] Mantener colores de ingreso/gasto

### 4. **Gestión de Categorías**
- [x] Eliminar selección de tipo ingreso/gasto en categorías
- [x] Mantener solo la selección de tipo en transacciones

### 5. **Sistema de Autenticación**
- [x] Agregar cambio de contraseña en ajustes
- [x] Implementar recuperación de contraseña en login
- [x] Agregar advertencia sobre correos ficticios en registro

### 6. **Funcionalidad de URL con Parámetros**
- [x] Implementar sistema para recibir parámetros por URL
- [x] Pre-llenar formulario de transacción con datos de URL
- [x] Ejemplo: `/transactions/new?type=gasto&amount=5000&note=Almuerzo`

### 7. **Actualización de Versión**
- [x] Cambiar versión a 0.2.0 en ajustes

## 🛠️ Stack Tecnológico
- **Frontend**: Next.js 15 con App Router, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **UI**: Componentes personalizados con Lucide React icons
- **Formularios**: React Hook Form + Zod
- **PWA**: next-pwa

## 📁 Estructura del Proyecto
```
src/
├── app/
│   ├── (auth)/          # Rutas de autenticación
│   ├── (main)/          # Rutas principales con navegación
│   └── ...
├── components/
│   ├── ui/              # Componentes base
│   ├── forms/           # Formularios específicos
│   ├── Navigation.tsx   # Navegación inferior
│   └── ...
├── lib/                 # Helpers y utilidades
└── types/               # Tipos TypeScript
```

## 🎯 Archivos Principales a Modificar
- `src/components/Navigation.tsx` - Navegación y FAB
- `src/app/dashboard/page.tsx` - Dashboard principal
- `src/app/transactions/page.tsx` - Lista de transacciones
- `src/app/categories/page.tsx` - Gestión de categorías
- `src/components/forms/CategoryForm.tsx` - Formulario de categorías
- `src/app/settings/page.tsx` - Ajustes
- `src/app/(auth)/login/page.tsx` - Login
- `src/app/(auth)/register/page.tsx` - Registro

## 🔧 Consideraciones Técnicas
- Mantener compatibilidad con datos existentes
- Usar Firebase Auth para recuperación de contraseña
- Implementar validación de parámetros URL
- Mantener diseño responsive y accesible
- Preservar funcionalidad offline

## 📱 Funcionalidad de Atajos iPhone
Para los atajos de iPhone, implementar:
- Ruta especial para recibir parámetros: `/transactions/new`
- Query parameters: `type`, `amount`, `note`, `categoryId`, `accountId`
- Pre-llenar formulario automáticamente
- Permitir guardar o cancelar la transacción

## 🚀 Resultado Esperado
Una aplicación más intuitiva, con mejor flujo de usuario, funcionalidades de autenticación completas y soporte para atajos externos, manteniendo la esencia de simplicidad y eficiencia de Lukita.

---

**Instrucciones**: Implementa estos cambios de manera incremental, probando cada funcionalidad antes de continuar. Mantén el código limpio, bien documentado y siguiendo las mejores prácticas de React/Next.js.
