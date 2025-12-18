export interface ActaCompliance {
  id: string;
  numeroCompliance: string;
  nombre_organo_entidad: string;
  rif_organo_entidad: string;
  puntajeCalculado: number;
  status: 'Guardada' | 'Enviada' | 'Descargada'; // Tipado estricto según tus valores
  createdAt?: string; 
}

export interface ComplianceResponse {
  data: ActaCompliance[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface GetComplianceParams {
  page?: number;
  limit?: number;
  search?: string;
}