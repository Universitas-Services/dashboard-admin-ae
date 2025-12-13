import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

// URL base: Ajusta esto a la URL de tu backend real
const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Interceptor de Request: Agrega el Token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor de Response: Maneja Token Expirado (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si recibimos 401 (No autorizado) y no hemos reintentado aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          throw new Error('No hay refresh token disponible');
        }

        // Llamada al endpoint de refresco (Ajusta la ruta si es diferente)
        // Se asume que el backend espera { refreshToken } en el body
        const { data } = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        // Backend debe devolver el nuevo accessToken
        const newAccessToken = data.accessToken; // Ajusta si tu backend devuelve 'token' u otra clave

        // Guardamos el nuevo token
        useAuthStore.getState().setToken(newAccessToken);

        // Actualizamos el header y reintentamos la petición original
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Si falla el refresco, cerramos sesión
        useAuthStore.getState().logout();
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;