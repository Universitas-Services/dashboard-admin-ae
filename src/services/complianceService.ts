// complianceService.ts
import api from '@/lib/axios';
import {
  ComplianceResponse,
  GetComplianceParams,
  ComplianceInfoDetails,
} from '@/types/compliance';

interface SendEmailResponse {
  message: string;
}

export const complianceService = {
  // 1. Obtener listado
  getAllActasCompliance: async (
    params: GetComplianceParams
  ): Promise<ComplianceResponse> => {
    const response = await api.get<ComplianceResponse>(
      '/acta-compliance/admin/all',
      { params }
    );
    return response.data;
  },

  // 2. Descargar PDF (Lógica centralizada)
  downloadCompliancePdf: async (
    id: string,
    fileName: string
  ): Promise<void> => {
    try {
      const response = await api.get(`/acta-compliance/admin/${id}/download`, {
        responseType: 'blob', // Importante para archivos binarios
      });

      // Creamos el Blob y la URL
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Creamos el elemento temporal para forzar la descarga
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // Usamos el nombre pasado por parámetro
      document.body.appendChild(link);
      link.click();

      // Limpieza
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Relanzamos el error para que el componente muestre el Toast de error
      throw error;
    }
  },

  // 3. Enviar Correo
  sendComplianceEmail: async (id: string): Promise<SendEmailResponse> => {
    const response = await api.post<SendEmailResponse>(
      `/acta-compliance/admin/${id}/email`,
      {}
    );
    return response.data;
  },

  // 4. Obtener información detallada (NUEVO)
  getComplianceInfo: async (id: string): Promise<ComplianceInfoDetails> => {
    const response = await api.get<ComplianceInfoDetails>(
      `/acta-compliance/admin/${id}/info`
    );
    return response.data;
  },
};
