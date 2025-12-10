import { IUser, IBasicUser, AuthTokenResponse } from '../services/authService';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'UserData';
const BASIC_USER_DATA_KEY = 'BasicUserData'; // Datos básicos del my

const isBrowser = typeof window !== 'undefined';

export const setAccessToken = (token: string | null) => {
  if (isBrowser) {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }
};

export const getAccessToken = (): string | null => {
  if (isBrowser) {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
};

export const setRefreshToken = (token: string | null) => {
  if (isBrowser) {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
};

export const getRefreshToken = (): string | null => {
  if (isBrowser) {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

export const setUserData = (userData: IUser | null) => {
  if (isBrowser) {
    // El perfil completo ya no se guarda en localStorage.
    /*
    if (userData) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_DATA_KEY);
    }
    */
  }
};

export const getUserData = (): IUser | null => {
  if (isBrowser) {
    //const data = localStorage.getItem(USER_DATA_KEY);
    //return data ? JSON.parse(data) : null;
    // El perfil completo ya no se guarda en localStorage.
    localStorage.removeItem(USER_DATA_KEY); // Limpiamos cualquier dato antiguo
    return null;
  }
  return null;
};

export const setBasicUserData = (basicUserData: IBasicUser | null) => {
  if (isBrowser) {
    if (basicUserData) {
      localStorage.setItem(BASIC_USER_DATA_KEY, JSON.stringify(basicUserData));
    } else {
      localStorage.removeItem(BASIC_USER_DATA_KEY);
    }
  }
};

export const getBasicUserData = (): IBasicUser | null => {
  if (isBrowser) {
    const data = localStorage.getItem(BASIC_USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const getMyData = (): IBasicUser | null => {
  // Refactorizado para usar getBasicUserData
  return getBasicUserData();
};

export const clearAuthStorage = () => {
  if (isBrowser) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    //localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(BASIC_USER_DATA_KEY); // Limpiar también la nueva clave
    localStorage.removeItem('chatMessages'); // Limpiar mensajes del chat
    localStorage.removeItem('chatSessionId'); // Limpiar ID de sesión del chat
  }
};

export const setAuthTokens = (tokens: AuthTokenResponse | null) => {
  if (tokens) {
    setAccessToken(tokens.access_token);
    setRefreshToken(tokens.refresh_token);
  } else {
    clearAuthStorage();
  }
};

export const getIsAuthenticated = (): boolean => {
  return !!getAccessToken() && !!getRefreshToken();
};
