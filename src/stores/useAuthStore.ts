import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define la estructura de tu usuario (ajusta según lo que devuelva tu backend)
export interface User {
  id: string;
  email: string;
  role: string;
  nombre?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  // Acciones
  setAuth: (token: string, refreshToken: string, user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, refreshToken, user) => 
        set({ token, refreshToken, user, isAuthenticated: true }),

      setToken: (token) => 
        set({ token }),

      logout: () => 
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // Nombre clave para guardar en localStorage
    }
  )
);