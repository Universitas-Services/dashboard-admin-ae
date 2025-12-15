import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthStorage,
} from './authStorage';

// URL base desde variables de entorno
const baseURL = process.env.NEXT_PUBLIC_API_URL;

// Creamos la instancia principal de Axios
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR DE REQUEST ---
// Antes de que salga cualquier petición, inyectamos el token si existe.
api.interceptors.request.use(
  (config) => {
    // Leemos directamente del localStorage (rápido y síncrono)
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTOR DE RESPONSE ---
// Aquí es donde ocurre la magia: interceptamos errores 401.
api.interceptors.response.use(
  (response) => response, // Si todo va bien, pasamos la respuesta
  async (error) => {
    const originalRequest = error.config;

    // Detectamos si es un error 401 (No Autorizado)
    // Y verificamos la bandera '_retry' para evitar bucles infinitos
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marcamos que ya intentamos refrescar esta petición

      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          // Si no hay token de refresco, no hay nada que hacer -> Logout
          throw new Error('No refresh token available');
        }

        // IMPORTANTE: Hacemos la llamada de refresh usando axios puro (NO la instancia 'api')
        // Esto evita que esta petición pase por los interceptores y cree un bucle.
        const response = await axios.post(`${baseURL}/admin/auth/refresh`, {
          refreshToken: refreshToken,
        });

        // Asumimos que el backend devuelve la estructura AuthTokenResponse { accessToken, refreshToken }
        const newTokens = response.data;

        // 1. Guardamos los nuevos tokens en el storage
        setAuthTokens(newTokens);

        // 2. Actualizamos el header de la instancia 'api' para futuras peticiones
        api.defaults.headers.common.Authorization = `Bearer ${newTokens.accessToken}`;
        
        // 3. Actualizamos el header de la petición que falló originalmente
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

        // 4. Reintentamos la petición original con el nuevo token
        return api(originalRequest);

      } catch (refreshError) {
        // Si el refresco falla (ej. refresh token también expiró o fue revocado)
        console.error('La sesión ha expirado o el refresh token es inválido.', refreshError);
        
        // Limpiamos todo rastro de la sesión
        clearAuthStorage();
        
        // Redirigimos al login forzosamente
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Si es otro tipo de error, lo dejamos pasar
    return Promise.reject(error);
  }
);

export default api;