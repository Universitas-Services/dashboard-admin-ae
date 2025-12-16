// src/types/user.ts

// Mapea el Enum UserRole de Prisma del Backend
export type UserRole = 'USER' | 'PAID_USER' | 'ADMIN';

// Estructura del Usuario que devuelve el endpoint GET /admin/users
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string | null;
  role: UserRole;
  telefono: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  nombreCompleto: string;
  email: string;
}

// Estructura de la metadata de paginación que devuelve el backend
export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

// Respuesta completa de la lista de usuarios
export interface UsersResponse {
  data: User[];
  meta: PaginationMeta;
}

// Filtros para la consulta (DTO)
export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}