'use client';

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { UserSettings } from '@/types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
