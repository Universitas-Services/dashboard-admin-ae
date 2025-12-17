// src/types/dashboard.ts

// Tipos de acta disponibles en el backend
export type ActaType =
  | 'ENTRANTE_GRATIS'
  | 'SALIENTE_GRATIS'
  | 'MAXIMA_AUTORIDAD_GRATIS'
  | 'ENTRANTE_PAGA'
  | 'SALIENTE_PAGA'
  | 'MAXIMA_AUTORIDAD_PAGA';

// Estados de acta disponibles
export type ActaStatus =
  | 'GUARDADA'
  | 'COMPLETADA'
  | 'ENTREGADA'
  | 'DESCARGADA'
  | 'ENVIADA';

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

// Estructura básica de un acta para contar por tipo
export interface ActaBasic {
  id: string;
  type: ActaType;
  status: ActaStatus;
  // otros campos que no necesitamos para el dashboard
}

// Respuesta paginada de GET /actas/admin/all
export interface AllActasResponse {
  data: ActaBasic[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

// Datos procesados para el gráfico de tipos de actas
export interface ActaTypeChartData {
  tipo: string;
  cantidad: number;
  fill: string;
}

// Datos procesados para el gráfico de compliance
export interface ComplianceChartData {
  label: string;
  valor: number;
  fill: string;
}

// Datos para las tarjetas KPI
export interface KpiCardData {
  title: string;
  value: number;
  icon: 'fileText' | 'bookmark' | 'checkSquare' | 'send';
}
