import api from '@/lib/axios';
import { GetUsersParams, User, UsersResponse, UserRole } from '@/types/user';

export const adminService = {
  // ... (métodos existentes: getAllUsers, getUserById, updateUserRole, upgradeUserToPro) ...

  // 1. Obtener lista de usuarios (MANTENER CÓDIGO EXISTENTE)
  getAllUsers: async (params: GetUsersParams): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (userId: string, newRole: UserRole): Promise<User> => {
    const response = await api.patch<User>('/admin/users/role', {
      userId,
      newRole,
    });
    return response.data;
  },

  upgradeUserToPro: async (id: string): Promise<User> => {
    const response = await api.patch<User>(`/admin/users/${id}/upgrade-to-pro`);
    return response.data;
  },

  // --- NUEVO MÉTODO AGREGADO ---
  // 5. Eliminar usuario (Simulación hasta que exista endpoint)
  deleteUser: async (id: string): Promise<boolean> => {
    // Simulamos un delay de red pequeño para realismo
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Retornamos true simulando éxito (Promise.resolve(true))
    return Promise.resolve(true);
  },
};