import api from '@/lib/axios';
import { z } from 'zod';
import { User } from '@/types/user';

// --- TIPOS ---

// Interfaz para la respuesta de tokens (Refresh y Login)
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Esquema de validación para el Login (Se mantiene igual)
export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Respuesta del Login: Asumimos que tu backend devuelve tokens + usuario al loguear.
// Si solo devuelve tokens, quitamos "user: User" de aquí.
export interface LoginResponse extends AuthTokenResponse {
  user: User;
}

// --- SERVICIO ---

export const authService = {
  // 1. INICIAR SESIÓN
  // Endpoint: POST /admin/auth/login
  login: async (credentials: LoginFormData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/admin/auth/login', credentials);
    return response.data;
  },

  // 2. REFRESCAR TOKEN
  // Endpoint: POST /admin/auth/refresh
  // Envía el refreshToken actual y recibe un par nuevo de tokens
  refreshToken: async (token: string): Promise<AuthTokenResponse> => {
    const response = await api.post<AuthTokenResponse>('/admin/auth/refresh', {
      refreshToken: token,
    });
    return response.data;
  },

  // 3. OBTENER PERFIL ACTUAL (ME)
  // Endpoint: GET /admin/auth/me
  // Recupera datos frescos del usuario. El token va en el header (manejado por Axios)
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/admin/auth/me');
    return response.data;
  },

  // 4. CERRAR SESIÓN (Opcional en Backend)
  // Endpoint: POST /admin/auth/logout
  // Notifica al servidor para invalidar el refresh token
  logout: async () => {
    return api.post('/admin/auth/logout');
  }
};