'use client';

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
import { auth, db } from './firebase';
import { UserSettings } from '@/types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(loading);

  // Mantener la referencia actualizada
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isMounted) {
        setUser(user);
        setLoading(false);
        
        // Limpiar timeout si ya se resolvió la autenticación
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    });

    // Timeout de 3 segundos para evitar carga infinita (solo en cliente)
    if (typeof window !== 'undefined') {
      timeoutId = setTimeout(() => {
        if (isMounted && loadingRef.current) {
          setLoading(false);
          setUser(null);
        }
      }, 3000);
    }

    return () => {
      isMounted = false;
      unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Sin dependencias para evitar loops
  return { user, loading };
};

export const login = async (email: string, password: string) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  // Asegurar documento de usuario
  const ref = doc(db, 'users', cred.user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const defaultSettings: UserSettings = {
      monthCutoffDay: 1,
      theme: 'dark'
    };
    await setDoc(ref, {
      displayName: email.split('@')[0],
      ...defaultSettings
    });
    // Set default theme in localStorage immediately
    try {
      localStorage.setItem('user-theme', 'dark');
    } catch {}
  } else {
    // Load user's theme immediately after login
    const data = snap.data();
    const userTheme = data?.theme || 'dark';
    try {
      localStorage.setItem('user-theme', userTheme);
    } catch {}
  }
  return cred;
};

export const register = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Crear documento de usuario con settings por defecto
  const defaultSettings: UserSettings = {
    monthCutoffDay: 1,
    theme: 'dark'
  };
  
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    displayName: email.split('@')[0],
    ...defaultSettings
  });
  
  return userCredential;
};

export const logout = async () => {
  await signOut(auth);
};

export const getUserSettings = async (uid: string): Promise<UserSettings> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      monthCutoffDay: data.monthCutoffDay || 1,
      theme: data.theme || 'dark'
    };
  }
  return { monthCutoffDay: 1, theme: 'dark' };
};

export const sendPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('Usuario no autenticado');
  }

  // Reautenticar usuario
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Cambiar contraseña
  await updatePassword(user, newPassword);
};
