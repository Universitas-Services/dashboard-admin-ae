import { create } from 'zustand';
import { loginUser, logoutUser, type LoginResponse } from '../services/authService';
import { 
  setAuthTokens, 
  setUserData, 
  getUserData, 
  clearAuthStorage, 
  getIsAuthenticated, 
  getRefreshToken 
} from '../lib/authStorage';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface AuthState {
  status: 'idle' | 'loading' | 'error';
  isAuthenticated: boolean;
  user: User | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  setTokens: (data: { access_token: string; refresh_token: string }) => void;
  checkAuthOnLoad: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  isAuthenticated: false, // Se inicializa en checkAuthOnLoad
  user: null,

  login: async (credentials) => {
    set({ status: 'loading' });
    try {
      const response = await loginUser(credentials);
      
      // 1. Guardar en localStorage
      setAuthTokens({ 
        access_token: response.access_token, 
        refresh_token: response.refresh_token 
      });
      setUserData(response.user);

      // 2. Actualizar estado
      set({ 
        isAuthenticated: true, 
        user: response.user, 
        status: 'idle' 
      });
    } catch (error) {
      set({ status: 'error' });
      throw error;
    }
  },

  logout: async () => {
    const refreshToken = getRefreshToken();
    try {
        if (refreshToken) await logoutUser(refreshToken);
    } catch (e) {
        console.error("Error al notificar logout al server", e);
    } finally {
        clearAuthStorage();
        set({ isAuthenticated: false, user: null, status: 'idle' });
        // Opcional: Redirigir a /login usando window.location o router si estás en un componente
        if (typeof window !== 'undefined') window.location.href = '/login';
    }
  },

  setTokens: (tokens) => {
    setAuthTokens(tokens);
  },

  checkAuthOnLoad: () => {
    const isAuth = getIsAuthenticated();
    const user = getUserData();
    if (isAuth && user) {
        set({ isAuthenticated: true, user: user });
    } else {
        // Si hay inconsistencia (token pero no user), limpiar
        clearAuthStorage();
        set({ isAuthenticated: false, user: null });
    }
  }
}));