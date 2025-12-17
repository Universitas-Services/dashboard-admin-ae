import api from '@/lib/axios';
import { ActasResponse, GetActasParams } from '@/types/acta';

export const actasService = {
  getAllActasAdmin: async (params: GetActasParams): Promise<ActasResponse> => {
    // Convertimos params a query string
    const response = await api.get<ActasResponse>('/actas/admin/all', { params });
    return response.data;
  },

  // Agrega aquí otros métodos si los necesitas en el futuro (ej. deleteActa)
};