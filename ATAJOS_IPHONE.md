# 📱 Atajos de iPhone para Lukita PWA

## 🎯 **¿Qué son los Atajos?**

Los **Atajos** (Shortcuts) de iPhone te permiten automatizar acciones comunes, como crear gastos o ingresos rápidamente sin abrir la app completa.

## 🚀 **Crear Atajo para Gasto Rápido**

### **Paso 1: Abrir la App Atajos**

1. **Buscar "Atajos"** en tu iPhone
2. **Abrir la app** (icono azul con círculos)
3. **Tocar "+"** (crear nuevo atajo)

### **Paso 2: Configurar el Atajo**

1. **Agregar acción** → **"Texto"**
   - Escribir: `https://tu-url-vercel.vercel.app/transactions?type=gasto&amount=`

2. **Agregar acción** → **"Pedir entrada"**
   - **Tipo**: Número
   - **Prompt**: "¿Cuánto gastaste?"
   - **Permitir decimales**: Sí

3. **Agregar acción** → **"Texto"** (otro)
   - Escribir: `&note=`

4. **Agregar acción** → **"Pedir entrada"** (otro)
   - **Tipo**: Texto
   - **Prompt**: "¿En qué gastaste?"

5. **Agregar acción** → **"Abrir URLs"**
   - **URL**: Combinar los textos anteriores

### **Paso 3: Configurar el Atajo Final**

```
URL final: https://tu-url-vercel.vercel.app/transactions?type=gasto&amount=[MONTO]&note=[DESCRIPCION]
```

## 💰 **Crear Atajo para Ingreso Rápido**

### **Configuración Similar:**

1. **Agregar acción** → **"Texto"**
   - Escribir: `https://tu-url-vercel.vercel.app/transactions?type=ingreso&amount=`

2. **Agregar acción** → **"Pedir entrada"**
   - **Tipo**: Número
   - **Prompt**: "¿Cuánto ingresaste?"

3. **Agregar acción** → **"Texto"**
   - Escribir: `&note=`

4. **Agregar acción** → **"Pedir entrada"**
   - **Tipo**: Texto
   - **Prompt**: "¿De dónde viene el ingreso?"

5. **Agregar acción** → **"Abrir URLs"**

## 🎨 **Personalizar los Atajos**

### **Agregar Iconos y Colores:**

1. **Tocar el nombre** del atajo
2. **Elegir icono** y **color**
3. **Renombrar**: "Gasto Rápido" / "Ingreso Rápido"

### **Agregar a Pantalla de Inicio:**

1. **Tocar "..."** en el atajo
2. **"Agregar a pantalla de inicio"**
3. **Personalizar nombre** e **icono**
4. **"Agregar"**

## 📱 **Usar los Atajos**

### **Método 1: Desde la App Atajos**
1. **Abrir app Atajos**
2. **Tocar el atajo** que creaste
3. **Responder las preguntas**
4. **Se abre Lukita** con los datos prellenados

### **Método 2: Desde Pantalla de Inicio**
1. **Tocar el icono** del atajo en tu pantalla
2. **Responder las preguntas**
3. **Se abre Lukita** automáticamente

### **Método 3: Desde Siri**
1. **Decir**: "Hey Siri, [nombre del atajo]"
2. **Responder las preguntas**
3. **Se ejecuta automáticamente**

## 🔧 **Atajos Más Avanzados**

### **Atajo con Categorías Predefinidas:**

```
URL: https://tu-url-vercel.vercel.app/transactions?type=gasto&amount=[MONTO]&category=comida&note=[DESCRIPCION]
```

### **Atajo para Gasto Frecuente:**

1. **Agregar acción** → **"Texto"**
   - Escribir: `https://tu-url-vercel.vercel.app/transactions?type=gasto&amount=`

2. **Agregar acción** → **"Menú"**
   - **Opciones**: 
     - Café: `5000&note=Café`
     - Almuerzo: `8000&note=Almuerzo`
     - Transporte: `1000&note=Transporte`

3. **Agregar acción** → **"Abrir URLs"**

## 🎯 **Ejemplos de Atajos Útiles**

### **1. Gasto de Café Rápido:**
```
URL: https://tu-url-vercel.vercel.app/transactions?type=gasto&amount=3000&note=Café&category=comida
```

### **2. Ingreso de Sueldo:**
```
URL: https://tu-url-vercel.vercel.app/transactions?type=ingreso&amount=500000&note=Sueldo&category=trabajo
```

### **3. Gasto de Supermercado:**
```
URL: https://tu-url-vercel.vercel.app/transactions?type=gasto&amount=[MONTO]&note=Supermercado&category=comida
```

## 🚀 **Pro Tips**

### **Crear Atajos por Categorías:**
- **Comida**: Café, Almuerzo, Cena
- **Transporte**: Metro, Uber, Combustible
- **Entretenimiento**: Cine, Restaurante
- **Ingresos**: Sueldo, Freelance, Venta

### **Usar Siri:**
- **"Hey Siri, gasto de café"**
- **"Hey Siri, ingreso de sueldo"**
- **"Hey Siri, gasto de supermercado"**

### **Compartir Atajos:**
1. **Tocar "..."** en el atajo
2. **"Compartir"**
3. **Enviar por mensaje** o **AirDrop**

## 🔧 **Solución de Problemas**

### **No se abre Lukita:**
- Verificar que la URL sea correcta
- Asegurarse de que Lukita esté instalada como PWA

### **No se prellenan los datos:**
- Verificar que los parámetros de URL sean correctos
- Asegurarse de que Lukita soporte esos parámetros

### **Siri no reconoce el atajo:**
- Renombrar el atajo con palabras más simples
- Entrenar a Siri diciendo el nombre varias veces

## 🎉 **¡Listo!**

Con estos atajos podrás:
- ✅ **Crear gastos** en segundos
- ✅ **Registrar ingresos** rápidamente
- ✅ **Usar Siri** para automatizar
- ✅ **Tener acceso rápido** desde pantalla de inicio
- ✅ **Categorizar automáticamente** tus transacciones

¡Tu iPhone se convertirá en una herramienta súper eficiente para manejar tus finanzas! 💰📱
