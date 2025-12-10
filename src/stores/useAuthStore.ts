import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import {
  getMyProfile,
  getAuthenticatedUser,
  loginUser,
  refreshToken as apiRefreshToken,
  type LoginData,
  type IUser,
  type IBasicUser,
  type IUserProfile,
  type AuthTokenResponse,
} from '../services/authService';
import { axiosPublic } from '../lib/axios';
import {
  setAuthTokens,
  setUserData,
  getUserData,
  setBasicUserData,
  getBasicUserData,
  clearAuthStorage,
  getIsAuthenticated,
  getAccessToken,
  getRefreshToken,
} from '../lib/authStorage';

interface AuthState {
  status: 'idle' | 'loading' | 'loadingProfile' | 'error';
  showFirstLoginPopup: boolean;
  isAuthenticated: boolean;
  user: IUser | null;
  basic: IBasicUser | null;
  login: (data: LoginData) => Promise<void>;
  fetchUser: () => Promise<void>;
  setTokens: (tokens: AuthTokenResponse) => void;
  logout: () => void;
  checkAuthOnLoad: () => Promise<void>;
  setShowFirstLoginPopup: (isOpen: boolean) => void;
  setUserProfile: (profile: IUserProfile) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  showFirstLoginPopup: false,
  isAuthenticated: getIsAuthenticated(),
  user: getUserData(),
  basic: getBasicUserData(), // Inicializar con la nueva función

  login: async (data) => {
    // Añadimos un guardia para evitar dobles clics
    if (get().status === 'loading') return;
    set({ status: 'loading' });

    try {
      console.log('useAuthStore: Iniciando login...');
      const tokens = await loginUser(data);
      console.log('useAuthStore: Tokens recibidos:', tokens);

      setAuthTokens(tokens); // Guardar tokens directamente en localStorage

      // Actualizar el estado de Zustand
      set({
        isAuthenticated: getIsAuthenticated(),
        status: 'loading', // Aún cargando el perfil completo
      });

      // Después del login, obtenemos los datos básicos y el perfil completo
      const basicUser = await getAuthenticatedUser();
      setBasicUserData(basicUser); // Guardar datos básicos en localStorage
      set({ basic: basicUser }); // Actualizar estado 'basic'

      await get().fetchUser(); // Esto cargará el perfil completo y actualizará 'user'
      console.log('useAuthStore: Login exitoso y usuario cargado.');
    } catch (error) {
      set({ status: 'error' });
      console.error(
        'useAuthStore: Error en el store al iniciar sesión:',
        error
      );
      throw error;
    }
  },

  fetchUser: async () => {
    if (get().status === 'loadingProfile') return; // LÍNEA (con estado propio)
    set({ status: 'loadingProfile' });

    try {
      console.log(
        'useAuthStore: Iniciando fetchFullProfile (GET /users/profile)...'
      );
      // Llama a GET /users/profile
      const fullProfileData = await getMyProfile();
      console.log('useAuthStore: Perfil completo recibido:', fullProfileData);

      // Fusiona los datos completos en el estado de Zustand
      set((state) => ({
        user: { ...state.user, ...fullProfileData },
        status: 'idle',
      }));
      setUserData(fullProfileData); // Actualiza localStorage con el perfil completo

      // --- LÓGICA DEL POPUP ---
      // Comprueba la bandera del backend
      if (!fullProfileData.profileCompleted) {
        console.log(
          'useAuthStore: Perfil incompleto (profileCompleted:false). Mostrando popup.'
        );
        set({ showFirstLoginPopup: true });
      }
      // Si es 'true', no hace nada y el popup no se muestra.
    } catch (error) {
      console.error('useAuthStore: Error al obtener perfil completo:', error);
      set({ status: 'error' });
      get().logout();
    }
  },

  setTokens: (tokens) => {
    console.log('useAuthStore: Tokens actualizados por interceptor.');
    setAuthTokens(tokens); // Guardar tokens directamente en localStorage
    set({ isAuthenticated: getIsAuthenticated() }); // Actualizar estado de autenticación
  },

  logout: () => {
    // Si ya estamos deslogueados (isAuthenticated es false),
    // no hacer nada. Esto previene las llamadas en bucle.
    if (!get().isAuthenticated) {
      console.log('useAuthStore: Logout abortado, ya está desautenticado.');
      return;
    }

    console.log('useAuthStore: Iniciando logout...');

    // Obtenemos el REFRESH token para invalidarlo
    const tokenToInvalidate = getRefreshToken();
    const accessToken = getAccessToken();

    clearAuthStorage(); // Limpiar nuestro localStorage

    set({
      isAuthenticated: false,
      user: null,
      basic: null, // Limpiar también el estado basic
      showFirstLoginPopup: false,
      status: 'idle',
    });
    console.log('useAuthStore: Estado de autenticación limpiado.');

    if (tokenToInvalidate && accessToken) {
      // Enviamos el refreshToken en el body
      axiosPublic
        .post(
          '/auth/logout',
          { refreshToken: tokenToInvalidate }, // El token va aquí
          {
            // INYECTAMOS EL HEADER MANUALMENTE
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .catch((err) => {
          console.error(
            'useAuthStore: Error (ignorado) al notificar al servidor el logout:',
            err.message
          );
        });
    }
    // ProtectedRoute se encargará de la redirección
  },

  checkAuthOnLoad: async () => {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    console.log('useAuthStore: Iniciando checkAuthOnLoad...');

    const currentAccessToken = getAccessToken();
    const currentRefreshToken = getRefreshToken();
    const { logout, setTokens, fetchUser } = get();

    if (!currentAccessToken || !currentRefreshToken) {
      console.log('useAuthStore: No hay tokens, deslogueando.');
      logout();
      return;
    }

    let isTokenInvalidOrExpired = false;
    try {
      // Intentamos decodificar.
      const decodedToken: { exp: number } = jwtDecode(currentAccessToken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        // Marcado como expirado si el tiempo pasó
        isTokenInvalidOrExpired = true;
      }
    } catch (error) {
      // Marcado como inválido si jwtDecode falla (token corrupto o "basura")
      console.warn(
        'useAuthStore: Token inválido o corrupto. Forzando refresh.'
      );
      isTokenInvalidOrExpired = true;
    }

    // Ahora, manejamos el refresh si es necesario.
    if (isTokenInvalidOrExpired) {
      console.log(
        'useAuthStore: Access token expirado o inválido, intentando refrescar...'
      );
      try {
        // Usar el refresh token para obtener nuevos tokens
        const newTokens = await apiRefreshToken(currentRefreshToken);
        setTokens(newTokens); // Guardar los nuevos tokens
        // Después del refresh, obtenemos los datos básicos y el perfil completo
        const basicUser = await getAuthenticatedUser();
        setBasicUserData(basicUser); // Guardar datos básicos en localStorage
        set({ basic: basicUser }); // Actualizar estado 'basic'
        await fetchUser(); // Cargar usuario con los nuevos tokens (perfil completo)
        console.log('useAuthStore: Tokens refrescados y usuario cargado.');
      } catch (refreshError) {
        // Si el refresh falla (ej. refresh token también expiró o es inválido)
        console.error(
          'useAuthStore: Falló el refresh token, deslogueando.',
          refreshError
        );
        logout(); // Ahora sí, deslogueamos.
        return;
      }
    } else {
      set({ isAuthenticated: true });
    }

    // --- LÓGICA DE CARGA DE DATOS AL RECARGAR PÁGINA ---
    try {
      // Siempre obtenemos los datos BÁSICOS primero
      const basicUser = await getAuthenticatedUser(); // GET /my
      setBasicUserData(basicUser); // Actualiza localStorage con datos básicos
      // Actualiza el estado 'basic' del store y se pone status 'idle'
      set({ basic: basicUser, status: 'idle' });

      // Luego, intentamos obtener el perfil completo si no está ya cargado o si es necesario
      /* const currentUser = getUserData();
      if (!currentUser || !currentUser.profileCompleted) {
        await fetchUser(); // Cargar el perfil completo si no está o está incompleto
      } else {
        set({ user: currentUser, status: 'idle' }); // Si ya está completo, solo actualiza el estado 'user'
      }*/

      console.log('useAuthStore: Sesión válida, usuario básico (/my) cargado.');
    } catch (fetchError) {
      console.error('useAuthStore: Falló fetch al recargar, deslogueando.');
      get().logout();
    }
  },

  setShowFirstLoginPopup: (isOpen: boolean) => {
    console.log('useAuthStore: Estableciendo showFirstLoginPopup a', isOpen);
    set({ showFirstLoginPopup: isOpen });
  },

  setUserProfile: (profile) => {
    set((state) => {
      const currentUser = getUserData();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          profile: profile,
          profileCompleted: true,
        }; // Marcar como completo
        setUserData(updatedUser);
        return { user: updatedUser };
      }
      return {};
    });
    console.log('useAuthStore: Perfil de usuario actualizado localmente.');
  },
}));