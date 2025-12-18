import api from '@/lib/axios';
import { ActasResponse, GetActasParams } from '@/types/acta';

// Definimos una interfaz simple para la respuesta de envío de correo
interface SendEmailResponse {
  message: string;
  statusCode?: number;
}

export const actasService = {
  getAllActasAdmin: async (params: GetActasParams): Promise<ActasResponse> => {
    const response = await api.get<ActasResponse>('/actas/admin/all', {
      params,
    });
    return response.data;
  },

  // 1. Descargar DOCX (Blob)
  downloadActaDocx: async (id: string): Promise<Blob> => {
    const response = await api.get(`/actas/${id}/descargar-docx`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // 2. Enviar DOCX por correo
  // CORRECCIÓN: Cambiamos Promise<any> por un tipo explícito o void
  sendActaDocx: async (id: string): Promise<SendEmailResponse> => {
    // Agregamos {} como body vacío para asegurar que la petición POST sea válida
    const response = await api.post<SendEmailResponse>(
      `/actas/${id}/enviar-docx`,
      {}
    );
    return response.data;
  },
};
