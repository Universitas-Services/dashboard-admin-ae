import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { authService, LoginFormData } from '@/services/authService';
import { User } from '@/types/user';
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthStorage,
  getIsAuthenticated,
} from '@/lib/authStorage';

interface DecodedToken {
  exp: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'error';

  login: (data: LoginFormData) => Promise<void>;
  logout: () => void;
  checkAuthOnLoad: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: getIsAuthenticated(),
  status: 'idle',

login: async (credentials) => {
    set({ status: 'loading' });
    try {
      // 1. Llamada al backend (ahora devuelve camelCase gracias al servicio)
      const tokens = await authService.login(credentials);

      // 2. Guardar tokens en LocalStorage
      // Ahora 'tokens' sí tiene datos válidos, por lo que se guardarán correctamente
      setAuthTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      // 3. OBTENER USUARIO EXPLÍCITAMENTE
      // Como el login no devuelve el usuario, llamamos a /me usando los tokens recién guardados
      const user = await authService.getMe();

      // 4. Actualizar estado global
      set({
        user: user,
        isAuthenticated: true,
        status: 'idle',
      });

    } catch (error) {
      set({ status: 'error', isAuthenticated: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout().catch((err) => console.error('Logout error:', err));
    clearAuthStorage();
    set({
      user: null,
      isAuthenticated: false,
      status: 'idle',
    });

    // --- CORRECCIÓN AQUÍ ---
    // Solo redirigir si estamos en el navegador Y NO estamos ya en la página de login
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  },

  checkAuthOnLoad: async () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    // --- CORRECCIÓN AQUÍ ---
    // Si no hay tokens, simplemente establecemos que no estamos autenticados y terminamos.
    // NO llamamos a logout() porque logout fuerza una redirección innecesaria aquí.
    if (!accessToken || !refreshToken) {
      set({ isAuthenticated: false, user: null, status: 'idle' });
      return;
    }

    set({ status: 'loading' });

    try {
      let isExpired = false;
      try {
        const decoded = jwtDecode<DecodedToken>(accessToken);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          isExpired = true;
        }
      } catch (e) {
        isExpired = true;
      }

      if (isExpired) {
        console.log('Token expirado al inicio. Intentando refrescar...');
        const newTokens = await authService.refreshToken(refreshToken);
        setAuthTokens(newTokens);
      }

      const user = await authService.getMe();
      
      set({
        user,
        isAuthenticated: true,
        status: 'idle',
      });

    } catch (error) {
      console.error('Error al restaurar sesión:', error);
      get().logout();
    }
  },
}));