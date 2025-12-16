import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { authService, LoginFormData } from '@/services/authService';
import { AdminUser } from '@/types/user';
import {
  getAccessToken,
  getRefreshToken,
  getUserData,
  getIsAuthenticated,
  setAuthTokens,
  setUserData,
  clearAuthStorage,
} from '@/lib/authStorage';

interface DecodedToken {
  exp: number;
}

interface AuthState {
  status: 'idle' | 'loading' | 'error';
  isAuthenticated: boolean;
  user: AdminUser | null;
  
  // Acciones
  login: (data: LoginFormData) => Promise<void>;
  logout: () => void;
  checkAuthOnLoad: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // 1. INICIALIZACIÓN SÍNCRONA (Como en la referencia)
  // Al cargar la app, esto lee directo del localStorage.
  status: 'idle',
  isAuthenticated: getIsAuthenticated(),
  user: getUserData(),

  login: async (credentials) => {
    if (get().status === 'loading') return;
    set({ status: 'loading' });

    try {
      // 1. Login API
      const response = await authService.login(credentials);
      
      // 2. Guardar Tokens
      setAuthTokens({
        access_Token: response.access_Token,
        refresh_Token: response.refresh_Token,
      });

      // 3. Obtener Usuario (/me)
      const user = await authService.getMe();
      
      // 4. Guardar Usuario
      setUserData(user);

      // 5. Actualizar Store
      set({
        isAuthenticated: true,
        user: user,
        status: 'idle',
      });
      
    } catch (error) {
      set({ status: 'error' });
      throw error;
    }
  },

  logout: () => {
    if (!get().isAuthenticated) return;

    // Llamada al backend (fire & forget)
    authService.logout().catch(console.error);

    // Limpieza Local
    clearAuthStorage();

    // Reset Store
    set({
      isAuthenticated: false,
      user: null,
      status: 'idle',
    });

    // Redirección forzada (opcional, igual que en referencia)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  checkAuthOnLoad: async () => {
    // Si ya estamos validando, no hacer nada
    if (get().status === 'loading') return;
    
    // Si no hay tokens, asegurarnos de que el estado esté limpio
    const currentAccess = getAccessToken();
    const currentRefresh = getRefreshToken();

    if (!currentAccess || !currentRefresh) {
        // Solo hacemos logout si el estado dice que estamos autenticados, para evitar bucles
        if (get().isAuthenticated) {
            get().logout();
        }
        return;
    }

    set({ status: 'loading' });

    try {
        let isExpired = false;
        try {
            const decoded = jwtDecode<DecodedToken>(currentAccess);
            if (decoded.exp * 1000 < Date.now()) {
                isExpired = true;
            }
        } catch {
            isExpired = true;
        }

        if (isExpired) {
            console.log('Token expirado en carga, refrescando...');
            // Axios interceptor NO se usa aquí directamente porque estamos llamando al servicio manualmente
            // Llamamos directo a refreshToken
            const newTokens = await authService.refreshToken(currentRefresh);
            setAuthTokens(newTokens);
        } else {
            // Si el token es válido, confirmamos estado
            set({ isAuthenticated: true });
        }

        // Cargar datos frescos del usuario
        // Igual que en la referencia: getAuthenticatedUser() -> aquí getMe()
        const user = await authService.getMe();
        setUserData(user);
        set({ user, status: 'idle' });

    } catch (error) {
        console.error('Error en checkAuthOnLoad:', error);
        get().logout();
    }
  },
}));