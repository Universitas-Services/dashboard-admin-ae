import api from '@/lib/axios';
import {
  ActasResponse,
  GetActasParams,
  ActasStatsResponse,
  ComplianceStatsResponse,
  ActaInfoDetails,
} from '@/types/acta';

// Definimos una interfaz simple para la respuesta de envío de correo
interface SendEmailResponse {
  message: string;
  statusCode?: number;
}

export const actasService = {
  /**
   * Obtiene estadísticas generales de actas
   * Endpoint: GET /actas/admin/stats
   */
  getActasStats: async (): Promise<ActasStatsResponse> => {
    const response = await api.get<ActasStatsResponse>('/actas/admin/stats');
    return response.data;
  },

  /**
   * Obtiene estadísticas de compliance/auditorías
   * Endpoint: GET /acta-compliance/admin/stats
   */
  getComplianceStats: async (): Promise<ComplianceStatsResponse> => {
    const response = await api.get<ComplianceStatsResponse>(
      '/acta-compliance/admin/stats'
    );
    return response.data;
  },

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

  // 3. Obtener información detallada de los involucrados (NUEVO)
  getActaInfo: async (id: string): Promise<ActaInfoDetails> => {
    const response = await api.get<ActaInfoDetails>(`/actas/admin/${id}/info`);
    return response.data;
  },
};
