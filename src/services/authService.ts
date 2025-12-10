// src/services/authService.ts
import { axiosPublic, default as apiClient } from '@/src/lib/axios';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const loginUser = async (credentials: { email: string; password: string }) => {
  const { data } = await axiosPublic.post<LoginResponse>('/auth/login', credentials);
  return data;
};

export const logoutUser = async (refreshToken: string) => {
    // Usamos apiClient para enviar el token de acceso en el header
    return await apiClient.post('/auth/logout', { refreshToken });
};