import axios from 'axios';
import { getAccessToken, getRefreshToken, setAuthTokens, clearAuthStorage } from '@/lib/authStorage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'; // Ajusta a tu URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Cliente sin interceptores - usar para refresh/logout para evitar recursión
export const plainApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- INTERCEPTOR DE REQUEST ---
// Igual que la referencia: Siempre inyecta el token más fresco del storage
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- LÓGICA DE REFRESH (QUEUE + LOCK) ---
// Variables para controlar la concurrencia y evitar bucles
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    } else {
      prom.reject(new Error('No token provided'));
    }
  });
  failedQueue = [];
};

// --- INTERCEPTOR DE RESPONSE ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es 401 y NO es un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Si ya se está refrescando, encolamos esta petición
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenStr = getRefreshToken();

      if (refreshTokenStr) {
        try {
          // 1. Llamamos al endpoint de refresh usando plainApi (evita recursión con interceptors)
          const resp = await plainApi.post('/admin/auth/refresh', { refresh_token: refreshTokenStr });

          // 2. Mapear respuesta externa (snake_case) a la forma interna y guardar
          const newTokens = {
            access_Token: resp.data.access_token || resp.data.accessToken,
            refresh_Token: resp.data.refresh_token || resp.data.refreshToken,
          };

          setAuthTokens(newTokens);

          // 3. Actualizamos cabecera del request original con nuevo access token
          originalRequest.headers['Authorization'] = `Bearer ${newTokens.access_Token}`;

          // 4. Procesamos cola
          processQueue(null, newTokens.access_Token);

          // 5. Reintentamos la petición original
          return api(originalRequest);

        } catch (refreshError) {
          processQueue(refreshError, null);
          // Si falla el refresh, limpiar storage y forzar login (evitar depender del store aquí)
          try {
            clearAuthStorage();
            if (typeof window !== 'undefined') window.location.href = '/login';
          } catch (e) {
            // silence
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No hay refresh token: limpiar y forzar login
        try {
          clearAuthStorage();
          if (typeof window !== 'undefined') window.location.href = '/login';
        } catch (e) {}
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;