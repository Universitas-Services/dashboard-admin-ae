// src/lib/axios.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { getAccessToken, getRefreshToken } from '@/lib/authStorage';

// Asegúrate de tener esta variable en tu .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }, 
});

// --- Interceptor de Request: Inyectar Token ---
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Lógica de Refresh Token (Anti-Race Condition) ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es 401 (No autorizado) y no es un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Si ya se está refrescando, encolar la petición
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        // NOTA: Aquí asumimos que tu endpoint de refresh es /auth/refresh
        // Ajusta la ruta según tu backend real
        const { data } = await axiosPublic.post('/auth/refresh', { refreshToken }); 
        
        const { useAuthStore } = await import('@/stores/useAuthStore');
        useAuthStore.getState().setTokens(data); // Guardar nuevos tokens

        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + data.access_token;
        originalRequest.headers['Authorization'] = 'Bearer ' + data.access_token;

        processQueue(null, data.access_token);
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        const { useAuthStore } = await import('@/stores/useAuthStore');
        useAuthStore.getState().logout(); // Si falla el refresh, adiós sesión
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;