import { User } from '@/types/user';

// Definimos aquí la interfaz de la respuesta de tokens para usarla en el storage
// (Más adelante la unificaremos en authService)
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData'; // Guardaremos datos básicos aquí si es necesario

const isBrowser = typeof window !== 'undefined';

// --- GESTIÓN DEL ACCESS TOKEN ---
export const setAccessToken = (token: string | null) => {
  if (!isBrowser) return;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

export const getAccessToken = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// --- GESTIÓN DEL REFRESH TOKEN ---
export const setRefreshToken = (token: string | null) => {
  if (!isBrowser) return;
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const getRefreshToken = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// --- GESTIÓN DE TOKENS EN CONJUNTO ---
export const setAuthTokens = (tokens: AuthTokenResponse | null) => {
  if (tokens) {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
  } else {
    clearAuthStorage();
  }
};

// --- GESTIÓN DE DATOS DE USUARIO (Persistencia Opcional/Básica) ---
// Nota: La fuente de la verdad será el store de Zustand, pero esto ayuda a recuperar
// datos básicos síncronamente antes de que cargue el perfil completo.
export const setUserData = (user: User | null) => {
  if (!isBrowser) return;
  if (user) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_DATA_KEY);
  }
};

export const getUserData = (): User | null => {
  if (!isBrowser) return null;
  const data = localStorage.getItem(USER_DATA_KEY);
  try {
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error al parsear datos de usuario del storage', error);
    localStorage.removeItem(USER_DATA_KEY);
    return null;
  }
};

// --- LIMPIEZA TOTAL ---
export const clearAuthStorage = () => {
  if (!isBrowser) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

// --- UTILIDAD DE ESTADO ---
export const getIsAuthenticated = (): boolean => {
  // Simplemente verifica si tenemos ambos tokens
  return !!getAccessToken() && !!getRefreshToken();
};