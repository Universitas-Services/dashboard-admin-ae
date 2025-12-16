import { AdminUser } from '@/types/user';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'UserData'; // Mantenemos tu key

const isBrowser = typeof window !== 'undefined';

// --- ACCESS TOKEN ---
export const getAccessToken = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string | null) => {
  if (!isBrowser) return;
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
};

// --- REFRESH TOKEN ---
export const getRefreshToken = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string | null) => {
  if (!isBrowser) return;
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// --- USER DATA (AdminUser) ---
export const getUserData = (): AdminUser | null => {
  if (!isBrowser) return null;
  const data = localStorage.getItem(USER_DATA_KEY);
  try {
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setUserData = (user: AdminUser | null) => {
  if (!isBrowser) return;
  if (user) localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_DATA_KEY);
};

// --- HELPERS GLOBALES ---
export const clearAuthStorage = () => {
  if (!isBrowser) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem('auth-storage'); // Limpieza de basura vieja
};

export const setAuthTokens = (tokens: { access_Token: string; refresh_Token: string }) => {
  setAccessToken(tokens.access_Token);
  setRefreshToken(tokens.refresh_Token);
};

export const getIsAuthenticated = (): boolean => {
  return !!getAccessToken() && !!getRefreshToken();
};