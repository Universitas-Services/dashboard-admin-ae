import api, { plainApi } from '@/lib/axios';
import { z } from 'zod';
import { AdminUser } from '@/types/user';

// --- TIPOS ---

// Interfaz para la respuesta de tokens (Refresh y Login)
export interface AuthTokenResponse {
  access_Token: string;
  refresh_Token: string;
}

// Esquema de validación para el Login (Se mantiene igual)
export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Respuesta del Login: Asumimos que tu backend devuelve tokens + usuario al loguear.
// Si solo devuelve tokens, quitamos "user: User" de aquí.
// Nota: el endpoint de login solo devuelve tokens según especificación del backend

// --- SERVICIO ---

export const authService = {
  // 1. INICIAR SESIÓN
  // Endpoint: POST /admin/auth/login
  login: async (credentials: LoginFormData): Promise<AuthTokenResponse> => {
    const response = await api.post('/admin/auth/login', credentials);
    // Backend devuelve snake_case: access_token, refresh_token
    return {
      access_Token: response.data.access_token || response.data.accessToken,
      refresh_Token: response.data.refresh_token || response.data.refreshToken,
    };
  },

  // 2. REFRESCAR TOKEN
  // Endpoint: POST /admin/auth/refresh
  // Envía el refreshToken actual y recibe un par nuevo de tokens
  refreshToken: async (token: string): Promise<AuthTokenResponse> => {
    const response = await plainApi.post('/admin/auth/refresh', { refresh_token: token });
    return {
      access_Token: response.data.access_token || response.data.accessToken,
      refresh_Token: response.data.refresh_token || response.data.refreshToken,
    };
  },

  // 3. OBTENER PERFIL ACTUAL (ME)
  // Endpoint: GET /admin/auth/me
  // Recupera datos frescos del usuario. El token va en el header (manejado por Axios)
  getMe: async (): Promise<AdminUser> => {
    // Asumiendo que el backend devuelve un objeto con mucha info
    const response = await api.get('admin/auth/me'); // Ajusta la URL según tu backend
    
    const data = response.data;

    // Mapeamos explícitamente para cumplir con AdminUser y descartar basura
    const adminUser: AdminUser = {
      nombreCompleto: data.nombreCompleto || data.name || '', // Ajusta según venga del backend
      email: data.email || '',
    };

    return adminUser;
  },

  // 4. CERRAR SESIÓN (Opcional en Backend)
  // Endpoint: POST /admin/auth/logout
  // Notifica al servidor para invalidar el refresh token
  logout: async () => {
    return plainApi.post('/admin/auth/logout');
  }
};