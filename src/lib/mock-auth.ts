'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';

// Mock user para pruebas sin autenticación
const mockUser: User = {
  uid: 'mock-user-123',
  email: 'test@lukita.com',
  emailVerified: true,
  displayName: 'Usuario de Prueba',
  photoURL: null,
  phoneNumber: null,
  providerId: 'mock',
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({
    token: 'mock-token',
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    signInProvider: 'mock',
    signInSecondFactor: null,
    claims: {},
  }),
  reload: async () => {},
  toJSON: () => ({}),
};

export const useMockAuth = () => {
  const [user, setUser] = useState<User | null>(mockUser);
  const [loading, setLoading] = useState(false);

  return { user, loading };
};

export const mockLogin = async (email: string, password: string) => {
  // Simular login exitoso
  return { user: mockUser };
};

export const mockRegister = async (email: string, password: string) => {
  // Simular registro exitoso
  return { user: mockUser };
};

export const mockLogout = async () => {
  // Simular logout
  return Promise.resolve();
};
