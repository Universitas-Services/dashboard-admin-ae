import api from '../lib/axios';
import { z } from 'zod';
import { User } from '../stores/useAuthStore';

// Esquema de validación para el formulario
export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Tipo de respuesta del Backend (Ajusta según tu API)
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  login: async (credentials: LoginFormData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/admin/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    // Si tu backend requiere notificar el logout, descomenta:
    // await api.post('/auth/logout');
  }
};