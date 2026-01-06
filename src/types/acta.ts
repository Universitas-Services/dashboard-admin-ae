export type ActaStatus =
  | 'GUARDADA'
  | 'COMPLETADA'
  | 'ENTREGADA'
  | 'DESCARGADA'
  | 'ENVIADA';
export type ActaType =
  | 'ENTRANTE_GRATIS'
  | 'SALIENTE_GRATIS'
  | 'MAXIMA_AUTORIDAD_GRATIS'
  | 'MAXIMA_AUTORIDAD_PAGA'
  | 'ENTRANTE_PAGA'
  | 'SALIENTE_PAGA';

export interface ActaMetadata {
  rifOrgano?: string;
  [key: string]: unknown; // Permite otras propiedades pero obliga a validarlas
}

export interface Acta {
  id: string;
  numeroActa: string | null;
  nombreEntidad: string | null;
  type: ActaType;
  status: ActaStatus;
  metadata: ActaMetadata;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
  tiempoRealizacion: number;
  diasRestantes?: number;
  alertaVencimiento?: boolean;
  fechaSuscripcion?: string;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ActasResponse {
  data: Acta[];
  meta: PaginationMeta;
}

export interface GetActasParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ActaStatus;
}

// Respuesta de GET /actas/admin/stats
export interface ActasStatsResponse {
  totalActas: number;
  totalActasActivas: number;
  statsByStatus: {
    GUARDADA: number;
    COMPLETADA: number;
    ENTREGADA: number;
    DESCARGADA: number;
    ENVIADA: number;
  };
}

// Respuesta de GET /acta-compliance/admin/stats
export interface ComplianceStatsResponse {
  totalCompliance: number;
  totalRelevantes: number;
  statsByStatus: {
    GUARDADA: number;
    COMPLETADA: number;
    ENTREGADA: number;
    DESCARGADA: number;
    ENVIADA: number;
  };
}
// NUEVA INTERFAZ: Detalles extendidos del acta elaborada
export interface ActaInfoDetails {
  email: string;
  nombreServidorSaliente: string;
  designacionServidorSaliente: string;
  nombreServidorRecibe: string;
  designacionServidorRecibe: string;
  nombreServidorEntrante: string;
  designacionServidorEntrante: string;
  nombreAuditor: string;
  profesionAuditor: string;
  nombreTestigo1: string;
  profesionTestigo1: string;
  nombreTestigo2: string;
  profesionTestigo2: string;
}
