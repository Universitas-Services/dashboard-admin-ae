// src/lib/axios.ts
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { refreshToken as apiRefreshToken } from '../services/authService'; // Renombrado para evitar confusión
import { getAccessToken, getRefreshToken } from '../lib/authStorage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- INTERCEPTOR DE SOLICITUD (Sin cambios) ---
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken(); // Siempre obtiene el token más fresco

    // --- CORRECCIÓN ---
    // Eliminamos la condición '!config.headers['Authorization']'.
    // Debemos *siempre* sobrescribir la cabecera con el token más reciente
    // que tengamos en localStorage. Esto es crucial para los "reintentos"
    // después de un refresco de token.
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    // --- FIN CORRECCIÓN ---

    return config;
  },
  (error) => Promise.reject(error)
);

// --- LÓGICA DE REFRESH MEJORADA (Anti-Race-Condition) ---

// Variable para rastrear si ya hay un refresh en progreso
let isRefreshing = false;
// Array para almacenar las peticiones fallidas mientras se refresca
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Función para procesar la cola de peticiones
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      // Añadimos un check por si el token es null
      prom.resolve(token);
    } else {
      prom.reject(new Error('No token provided on success'));
    }
  });
  failedQueue = [];
};

// --- INTERCEPTOR DE RESPUESTA ---
apiClient.interceptors.response.use(
  (response) => response, // Si todo bien, dejamos pasar la respuesta
  async (error) => {
    const originalRequest = error.config;
    const { logout, setTokens } = useAuthStore.getState();

    // Si el error es 401 y no es un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Si ya hay un refresh en progreso, no inicies uno nuevo.
      // En su lugar, "encola" esta petición fallida.
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token: string) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err: unknown) => {
            return Promise.reject(err);
          });
      }

      // Si no hay refresh en progreso, iniciamos uno.
      originalRequest._retry = true;
      isRefreshing = true; // Marcar que estamos refrescando

      const currentRefreshToken = getRefreshToken();
      if (currentRefreshToken) {
        try {
          // 1. Intentamos obtener nuevos tokens
          const newTokens = await apiRefreshToken(currentRefreshToken);

          // 2. Los guardamos en el store y localStorage
          setTokens(newTokens);

          // 3. Actualizamos la cabecera de la petición original
          originalRequest.headers['Authorization'] =
            `Bearer ${newTokens.access_token}`;

          // 4. Procesamos la cola de peticiones (les damos el nuevo token)
          processQueue(null, newTokens.access_token);

          // 5. Reintentamos la petición original
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Si el refresh token falla, deslogueamos
          console.error('Refresh token fallido:', refreshError);

          // 6. Procesamos la cola (les decimos que falló)
          processQueue(refreshError, null);

          logout(); // Desloguear
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false; // Ya no estamos refrescando
        }
      } else {
        // No hay refresh token, deslogueamos
        console.error('No refresh token, logging out.');
        logout();
        isRefreshing = false; // Asegurarse de resetear
        return Promise.reject(error);
      }
    }

    // Si no es un 401, o si ya es un reintento, rechazar
    return Promise.reject(error);
  }
);

export default apiClient;