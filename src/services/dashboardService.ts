// src/services/dashboardService.ts

import api from '@/lib/axios';
import {
  ActasStatsResponse,
  ComplianceStatsResponse,
  AllActasResponse,
} from '@/types/dashboard';

export const dashboardService = {
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

  /**
   * Obtiene todas las actas para contar por tipo
   * Endpoint: GET /actas/admin/all
   * Nota: Usamos limit alto para obtener todas y poder contarlas
   */
  getAllActas: async (limit: number = 1000): Promise<AllActasResponse> => {
    const response = await api.get<AllActasResponse>('/actas/admin/all', {
      params: { limit, page: 1 },
    });
    return response.data;
  },
};
