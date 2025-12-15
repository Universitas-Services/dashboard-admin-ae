import api from '@/lib/axios';
import { GetUsersParams, User, UsersResponse, UserRole } from '@/types/user';

export const  adminService = {
  // 1. Obtener lista de usuarios (paginada y filtrada)
  // Endpoint Backend: GET /admin/users
  getAllUsers: async (params: GetUsersParams): Promise<UsersResponse> => {
    // Convertimos los params a query string
    const response = await api.get<UsersResponse>('/admin/users', { params });
    return response.data;
  },

  // 2. Obtener detalle de un usuario
  // Endpoint Backend: GET /admin/users/:id
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  // 3. Actualizar rol de usuario
  // Endpoint Backend: PATCH /admin/users/role
  updateUserRole: async (userId: string, newRole: UserRole): Promise<User> => {
    const response = await api.patch<User>('/admin/users/role', {
      userId,
      newRole,
    });
    return response.data;
  },

  // 4. Ascender a PRO (Acción rápida)
  // Endpoint Backend: PATCH /admin/users/:id/upgrade-to-pro
  upgradeUserToPro: async (id: string): Promise<User> => {
    const response = await api.patch<User>(`/admin/users/${id}/upgrade-to-pro`);
    return response.data;
  },
};