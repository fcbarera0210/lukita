# Desplegar Reglas de Firestore

Para corregir los errores de permisos, necesitas desplegar las nuevas reglas de Firestore:

## Opción 1: Firebase CLI (Recomendado)

1. **Instalar Firebase CLI** (si no lo tienes):
   ```bash
   npm install -g firebase-tools
   ```

2. **Iniciar sesión en Firebase**:
   ```bash
   firebase login
   ```

3. **Inicializar Firebase en el proyecto** (si no está inicializado):
   ```bash
   firebase init firestore
   ```

4. **Desplegar las reglas**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Opción 2: Firebase Console (Manual)

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto `lukita-d6a05`
3. Ve a **Firestore Database** → **Rules**
4. Reemplaza las reglas actuales con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuario principal
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Cuentas del usuario
    match /users/{userId}/accounts/{accountId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Categorías del usuario
    match /users/{userId}/categories/{categoryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Transacciones del usuario
    match /users/{userId}/transactions/{transactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Haz clic en **Publish**

## Verificar que funciona

Después de desplegar las reglas:

1. Recarga la página de la app
2. Deberías ver "✅ Autenticado como: test@test.cl" en la esquina superior derecha
3. Ahora puedes crear cuentas, categorías y transacciones sin errores de permisos
