// src/services/adminService.ts
import apiClient from '../lib/axios';


// Usuarios
export const getUsers = async (page = 1, filters = {}) => {
  const params = new URLSearchParams({ page: page.toString(), ...filters });
  const { data } = await apiClient.get(`/users?${params.toString()}`);
  return data;
};

// Roles
export const getRoles = async () => {
  const { data } = await apiClient.get('/roles');
  return data;
};

// Actas
export const getActas = async (page = 1) => {
  const { data } = await apiClient.get(`/actas?page=${page}`);
  return data;
};