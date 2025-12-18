import api from '@/lib/axios';
import { ComplianceResponse, GetComplianceParams } from '@/types/compliance';

export const complianceService = {
  getAllActasCompliance: async (params: GetComplianceParams): Promise<ComplianceResponse> => {
    // Se pasan los params (page, limit, search) automáticamente
    const response = await api.get<ComplianceResponse>('/acta-compliance/admin/all', { params });
    return response.data;
  },
};