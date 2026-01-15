# Instrucciones Técnicas para Replicar el Footer

## Descripción General

El footer debe mostrar un texto de crédito seguido del logo SVG de charl!deas, todo centrado horizontalmente en la parte inferior de la página.

## Estructura del Componente

### Contenedor Principal
- Crear un elemento `<footer>` con la clase `footer`
- Dentro, crear un contenedor con la clase `footer__content` que agrupa todo el contenido

### Texto del Footer
- Crear un elemento `<span>` con la clase `footer__text` que contiene el texto "Página desarrollada por "
- Dentro, crear un `<span>` con la clase `footer__brand` que contiene el nombre de la marca dividido en partes:
  - "charl" con clase `footer__brand--normal`
  - "!" con clase `footer__brand--cyan` (este carácter debe tener color cyan #00b4b9)
  - "d" con clase `footer__brand--normal`
  - "eas" con clase `footer__brand--normal`

### Logo SVG
- Crear un contenedor `<div>` con la clase `footer__logo`
- Dentro, insertar un elemento `<svg>` con:
  - Atributo `version="1.2"`
  - Atributo `xmlns="http://www.w3.org/2000/svg"`
  - Atributo `viewBox="0 0 792 612"`
  - Clase `footer__logo-img`
  - Atributo `aria-label="charl!deas logo"` para accesibilidad
- El SVG debe contener tres elementos `<path>`:
  - Primer path con `fill="#00b4b9"` y el atributo `d` con el valor: `m537.01 579.62h-281.41c-72.93 0-132.6-59.68-132.6-132.61v-281.41c0-72.93 59.67-132.6 132.6-132.6h281.41c72.93 0 132.61 59.67 132.61 132.6v281.41c0 72.93-59.68 132.61-132.61 132.61z`
  - Segundo path con `fill="#fefefe"` y el atributo `d` con el valor: `m432.96 433.01c-31.49 35.85-73.83 56.75-109.78 52.7-81.34-9.15-122.19-75.82-114.83-141.24 4.91-43.62 31.95-82.36 72.79-105.82 42.15-24.5 80.15-27.99 106.67-25 22.4 2.52 40.53 11.13 50.28 19.98 7.58 6.83 9.74 14.23 8.74 23.07-2.44 16.44-20.8 31.08-30.24 30.02-4.12-0.46-8.05-2.7-12.23-7.94-22.96-24.07-41.94-35.76-57.85-37.55-22.99-2.58-53.21 16.7-60.37 80.35-8.82 78.4 45.5 110.17 70.84 113.02 24.16 2.72 42.58-1.77 65.85-17.66z`
  - Tercer path con `fill="#fefefe"` y el atributo `d` con el valor: `m485.64 91.76c20.16 0 49.23 3.55 49.82 26.09 0 7.12-1.19 17.8-2.38 26.1-5.92 37.96-23.13 165.09-33.21 239.83h-28.47c-8.3-68.8-25.5-197.13-32.62-238.05-1.78-7.12-4.15-20.76-4.15-27.88 0-20.76 29.65-26.09 51.01-26.09zm0.89 417.98c-26.74 0-48.34-22.13-48.34-49.52 0-27.39 21.6-49.52 48.34-49.52 26.73 0 48.34 22.13 48.34 49.52 0 27.39-21.61 49.52-48.34 49.52z`

## Estilos CSS

### Clase `.footer`
- Padding vertical: usar variable `--spacing-md` (o 1rem si no hay variables)
- Padding horizontal: usar variable `--spacing-lg` (o 1.5rem si no hay variables)
- Margin-top: `auto` (para que se posicione al final cuando el layout usa flexbox)

### Clase `.footer__content`
- Display: `flex`
- Align-items: `center`
- Justify-content: `center`
- Gap: usar variable `--spacing-sm` (o 0.5rem si no hay variables)
- Flex-wrap: `wrap`

### Media Query para pantallas pequeñas (max-width: 640px)
- Para `.footer__content`: cambiar `flex-wrap` a `nowrap` y `gap` a `--spacing-xs` (o 0.25rem)

### Clase `.footer__text`
- Color: usar variable `--text-secondary` (o #5a5a5a en modo claro, #b5b5b5 en modo oscuro)
- Font-size: usar variable `--font-size-sm` (o 0.875rem)
- Display: `flex`
- Align-items: `center`
- Gap: `0.25em`

### Media Query para pantallas pequeñas (max-width: 640px)
- Para `.footer__text`: cambiar `font-size` a `--font-size-xs` (o 0.75rem) y agregar `white-space: nowrap`

### Clase `.footer__brand`
- Display: `inline-flex`
- Align-items: `center`
- Font-weight: usar variable `--font-weight-semibold` (o 600)

### Clase `.footer__brand--normal`
- Color: usar variable `--text-secondary` (o #5a5a5a en modo claro, #b5b5b5 en modo oscuro)

### Clase `.footer__brand--cyan`
- Color: `#00b4b9` (color fijo, no variable)

### Clase `.footer__logo`
- Display: `flex`
- Align-items: `center`
- Margin-left: usar variable `--spacing-xs` (o 0.25rem)

### Media Query para pantallas pequeñas (max-width: 640px)
- Para `.footer__logo`: mantener `margin-left` con `--spacing-xs` y agregar `flex-shrink: 0`

### Clase `.footer__logo-img`
- Width: `32px` (en desktop)
- Height: `24px` (en desktop)
- Display: `block`
- Flex-shrink: `0`

### Media Query para pantallas pequeñas (max-width: 640px)
- Para `.footer__logo-img`: cambiar `width` a `24px` y `height` a `18px`

## Variables CSS Requeridas

Si el proyecto usa variables CSS, asegúrate de tener definidas:
- `--spacing-xs`: 0.25rem
- `--spacing-sm`: 0.5rem
- `--spacing-md`: 1rem
- `--spacing-lg`: 1.5rem
- `--text-secondary`: #5a5a5a (modo claro) o #b5b5b5 (modo oscuro)
- `--font-size-xs`: 0.75rem
- `--font-size-sm`: 0.875rem
- `--font-weight-semibold`: 600

Si no usas variables CSS, reemplaza cada referencia por los valores fijos indicados entre paréntesis.

## Configuración del Layout Principal

Para que el footer se posicione correctamente al final de la página:
- El contenedor principal de la aplicación debe tener `display: flex` y `flex-direction: column`
- El contenedor principal debe tener `min-height: 100vh`
- El contenido principal (antes del footer) debe tener `flex: 1` para ocupar el espacio disponible
- El footer con `margin-top: auto` se posicionará automáticamente al final

## Resultado Visual Esperado

- Texto: "Página desarrollada por charl!deas" (con el "!" en color cyan #00b4b9)
- Logo SVG de charl!deas a la derecha del texto
- Todo centrado horizontalmente
- El footer se mantiene al final de la página incluso cuando hay poco contenido
- En pantallas pequeñas (menos de 640px), el texto y el logo se mantienen en una sola línea sin saltos, y ambos elementos se reducen ligeramente de tamaño

## Dependencias

- No requiere librerías adicionales, solo Vue 3 (o el framework que estés usando)
- El SVG está embebido en el componente, no requiere archivos externos