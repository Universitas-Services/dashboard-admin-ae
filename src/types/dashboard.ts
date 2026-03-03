// src/types/dashboard.ts

// Re-exportar tipos base desde acta.ts para mantener compatibilidad
export {
  type ActaType,
  type ActaStatus,
  type Acta,
  type ActasResponse,
  type ActasStatsResponse,
  type ComplianceStatsResponse,
} from './acta';

// Alias para compatibilidad con código existente
// El dashboard usa ActaBasic pero Acta contiene los mismos campos necesarios
import type { Acta, ActasResponse } from './acta';
export type ActaBasic = Pick<Acta, 'id' | 'type' | 'status'>;
export type AllActasResponse = ActasResponse;

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
