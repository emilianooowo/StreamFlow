'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { createMockUser, saveMockUser, getMockUser, clearMockAuth, mockToken, isMockAuth } from '@/lib/mockData';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }
    
    // ## Si estamos usando mock, cargar usuario mock de localStorage
    if (isMockAuth()) {
      const user = getMockUser();
      if (user) {
        setState({ user, isLoading: false, isAuthenticated: true });
      } else {
        // Si no hay usuario, limpiar y cerrar sesión
        clearMockAuth();
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
      return;
    }

    // ## Descomentar cuando el backend esté listo
    // try {
    //   const user = await apiClient.get<User>('/v1/auth/me', token);
    //   setState({ user, isLoading: false, isAuthenticated: true });
    // } catch {
    //   localStorage.removeItem('auth_token');
    //   setState({ user: null, isLoading: false, isAuthenticated: false });
    // }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/google`;
  };

  const loginWithEmail = async (email: string, password: string) => {
    // ## Mock temporal - Descomentar cuando el backend esté listo
    // try {
    //   const response = await apiClient.post<{ token: string; user: User }>('/v1/auth/login', { email, password }, '');
    //   if (response.token) {
    //     localStorage.setItem('auth_token', response.token);
    //     setState({ user: response.user, isLoading: false, isAuthenticated: true });
    //   }
    // } catch (error) {
    //   throw error;
    // }

    // Mock login (simula delay de red)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Buscar si el usuario ya existe en localStorage
    const existingUser = getMockUser();
    if (existingUser && existingUser.email === email) {
      setState({ user: existingUser, isLoading: false, isAuthenticated: true });
    } else {
      throw new Error('Usuario no encontrado. Por favor regístrate primero.');
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    // ## Mock temporal - Descomentar cuando el backend esté listo
    // try {
    //   const response = await apiClient.post<{ token: string; user: User }>('/v1/auth/register', { name, email, password }, '');
    //   if (response.token) {
    //     localStorage.setItem('auth_token', response.token);
    //     setState({ user: response.user, isLoading: false, isAuthenticated: true });
    //   }
    // } catch (error) {
    //   throw error;
    // }

    // Mock register (simula delay de red)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Crear nuevo usuario con los datos proporcionados
    const newUser = createMockUser(name, email);
    saveMockUser(newUser);
    setState({ user: newUser, isLoading: false, isAuthenticated: true });
  };

  const logout = async () => {
    // ## Descomentar cuando el backend esté listo
    // try {
    //   const token = localStorage.getItem('auth_token');
    //   await apiClient.post('/v1/auth/logout', {}, token || '');
    // } catch (error) {
    //   console.error('Logout failed:', error);
    // }
    
    clearMockAuth();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  return {
    ...state,
    login,
    loginWithEmail,
    registerWithEmail,
    logout,
    checkAuth,
  };
}
