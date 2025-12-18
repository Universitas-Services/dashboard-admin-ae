import api from '@/lib/axios';
import { User } from '@/types/user';
import { ActasResponse, GetActasParams } from '@/types/acta';
import { ComplianceResponse, GetComplianceParams } from '@/types/compliance';

// 1. Definimos los tipos para los parámetros y la respuesta paginada de Usuarios
export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Estructura de respuesta paginada (asumimos que es similar a la de Actas)
export interface UsersResponse {
  data: User[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export const adminService = {
  // 2. CORRECCIÓN: Ahora acepta 'params' opcionales
  getAllUsers: async (params?: GetUsersParams): Promise<UsersResponse> => {
    // Pasamos los params a la petición axios
    const response = await api.get<UsersResponse>('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await api.put<User>(`/admin/users/${id}`, data);
    return response.data;
  },

// --- MODIFICACIÓN AQUÍ ---
  // Cambiamos el endpoint a /users/admin/{id} según tu requerimiento explícito
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/admin/${id}`);
    return response.data;
  },

  // Helpers de Roles
  upgradeUserToPro: async (id: string) => {
    const response = await api.put<User>(`/admin/users/${id}`, { role: 'PAID_USER' });
    return response.data;
  },

  updateUserRole: async (id: string, role: string) => {
    const response = await api.put<User>(`/admin/users/${id}`, { role });
    return response.data;
  },

  // Actas del usuario
  getUserActas: async (userId: string, params: GetActasParams): Promise<ActasResponse> => {
    const response = await api.get<ActasResponse>(`/admin/users/${userId}/actas`, { params });
    return response.data;
  },

// --- ACTAS COMPLIANCE (ESTA ES LA QUE FALTABA) ---
  getUserCompliance: async (userId: string, params: GetComplianceParams): Promise<ComplianceResponse> => {
    const response = await api.get<ComplianceResponse>(`/admin/users/${userId}/actas-compliance`, { params });
    return response.data;
  }
};