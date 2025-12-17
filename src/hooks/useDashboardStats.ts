// src/hooks/useDashboardStats.ts

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { dashboardService } from '@/services/dashboardService';
import {
  ActasStatsResponse,
  ComplianceStatsResponse,
  ActaTypeChartData,
  ComplianceChartData,
  KpiCardData,
  ActaType,
} from '@/types/dashboard';

// Colores para el gráfico de tipos de actas (CSS variables)
const ACTA_TYPE_COLORS = {
  entrante: 'var(--color-entrante)',
  saliente: 'var(--color-saliente)',
  autoridad: 'var(--color-autoridad)',
  compliance: 'var(--color-compliance)',
};

// Colores para el gráfico de compliance (CSS variables)
const COMPLIANCE_COLORS = {
  total: 'var(--color-total)',
  guardadas: 'var(--color-guardadas)',
  enviadas: 'var(--color-enviadas)',
  descargadas: 'var(--color-descargadas)',
};

interface UseDashboardStatsReturn {
  // Datos para las 4 cards KPI
  kpiCards: KpiCardData[];
  // Datos para el gráfico de tipos de actas
  actasTypeData: ActaTypeChartData[];
  // Datos para el gráfico de compliance
  complianceData: ComplianceChartData[];
  // Estados
  isLoading: boolean;
  error: string | null;
  // Funciones
  refetch: () => Promise<void>;
}

// Valores por defecto cuando hay error o no hay datos
const DEFAULT_KPI_CARDS: KpiCardData[] = [
  { title: 'Total actas elaboradas', value: 0, icon: 'fileText' },
  { title: 'Actas guardadas', value: 0, icon: 'bookmark' },
  { title: 'Actas completadas', value: 0, icon: 'checkSquare' },
  { title: 'Actas entregadas', value: 0, icon: 'send' },
];

const DEFAULT_ACTAS_TYPE_DATA: ActaTypeChartData[] = [
  { tipo: 'Entrante', cantidad: 0, fill: ACTA_TYPE_COLORS.entrante },
  { tipo: 'Saliente', cantidad: 0, fill: ACTA_TYPE_COLORS.saliente },
  { tipo: 'Max. Autoridad', cantidad: 0, fill: ACTA_TYPE_COLORS.autoridad },
  { tipo: 'Compliance', cantidad: 0, fill: ACTA_TYPE_COLORS.compliance },
];

const DEFAULT_COMPLIANCE_DATA: ComplianceChartData[] = [
  { label: 'Total realizadas', valor: 0, fill: COMPLIANCE_COLORS.total },
  { label: 'Guardadas', valor: 0, fill: COMPLIANCE_COLORS.guardadas },
  { label: 'Enviadas', valor: 0, fill: COMPLIANCE_COLORS.enviadas },
  { label: 'Descargadas', valor: 0, fill: COMPLIANCE_COLORS.descargadas },
];

/**
 * Cuenta las actas por categoría (Entrante, Saliente, Max. Autoridad)
 */
function countActasByCategory(actas: { type: ActaType }[]): {
  entrante: number;
  saliente: number;
  autoridad: number;
} {
  return actas.reduce(
    (acc, acta) => {
      if (acta.type === 'ENTRANTE_GRATIS' || acta.type === 'ENTRANTE_PAGA') {
        acc.entrante++;
      } else if (
        acta.type === 'SALIENTE_GRATIS' ||
        acta.type === 'SALIENTE_PAGA'
      ) {
        acc.saliente++;
      } else if (
        acta.type === 'MAXIMA_AUTORIDAD_GRATIS' ||
        acta.type === 'MAXIMA_AUTORIDAD_PAGA'
      ) {
        acc.autoridad++;
      }
      return acc;
    },
    { entrante: 0, saliente: 0, autoridad: 0 }
  );
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [kpiCards, setKpiCards] = useState<KpiCardData[]>(DEFAULT_KPI_CARDS);
  const [actasTypeData, setActasTypeData] = useState<ActaTypeChartData[]>(
    DEFAULT_ACTAS_TYPE_DATA
  );
  const [complianceData, setComplianceData] = useState<ComplianceChartData[]>(
    DEFAULT_COMPLIANCE_DATA
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Ejecutar las 3 llamadas en paralelo
      const [actasStats, complianceStats, allActas] = await Promise.all([
        dashboardService.getActasStats(),
        dashboardService.getComplianceStats(),
        dashboardService.getAllActas(),
      ]);

      // Procesar datos para las 4 cards KPI (del endpoint /actas/admin/stats)
      const processedKpiCards: KpiCardData[] = [
        {
          title: 'Total actas elaboradas',
          value: actasStats.totalActas,
          icon: 'fileText',
        },
        {
          title: 'Actas guardadas',
          value: actasStats.statsByStatus.GUARDADA,
          icon: 'bookmark',
        },
        {
          title: 'Actas completadas',
          value:
            actasStats.statsByStatus.COMPLETADA +
            actasStats.statsByStatus.ENVIADA +
            actasStats.statsByStatus.DESCARGADA,
          icon: 'checkSquare',
        },
        {
          title: 'Actas entregadas',
          value: actasStats.statsByStatus.ENTREGADA,
          icon: 'send',
        },
      ];
      setKpiCards(processedKpiCards);

      // Procesar datos para el gráfico de tipos de actas
      const actasCounts = countActasByCategory(allActas.data);
      const processedActasTypeData: ActaTypeChartData[] = [
        {
          tipo: 'Entrante',
          cantidad: actasCounts.entrante,
          fill: ACTA_TYPE_COLORS.entrante,
        },
        {
          tipo: 'Saliente',
          cantidad: actasCounts.saliente,
          fill: ACTA_TYPE_COLORS.saliente,
        },
        {
          tipo: 'Max. Autoridad',
          cantidad: actasCounts.autoridad,
          fill: ACTA_TYPE_COLORS.autoridad,
        },
        {
          tipo: 'Compliance',
          cantidad: complianceStats.totalCompliance,
          fill: ACTA_TYPE_COLORS.compliance,
        },
      ];
      setActasTypeData(processedActasTypeData);

      // Procesar datos para el gráfico de compliance
      const processedComplianceData: ComplianceChartData[] = [
        {
          label: 'Total realizadas',
          valor: complianceStats.totalCompliance,
          fill: COMPLIANCE_COLORS.total,
        },
        {
          label: 'Guardadas',
          valor: complianceStats.statsByStatus.GUARDADA,
          fill: COMPLIANCE_COLORS.guardadas,
        },
        {
          label: 'Enviadas',
          valor: complianceStats.statsByStatus.ENVIADA,
          fill: COMPLIANCE_COLORS.enviadas,
        },
        {
          label: 'Descargadas',
          valor: complianceStats.statsByStatus.DESCARGADA,
          fill: COMPLIANCE_COLORS.descargadas,
        },
      ];
      setComplianceData(processedComplianceData);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al cargar estadísticas del dashboard';
      setError(errorMessage);
      toast.error('Error al cargar estadísticas', {
        description: errorMessage,
      });
      // Mantener valores por defecto (0) en caso de error
      setKpiCards(DEFAULT_KPI_CARDS);
      setActasTypeData(DEFAULT_ACTAS_TYPE_DATA);
      setComplianceData(DEFAULT_COMPLIANCE_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    kpiCards,
    actasTypeData,
    complianceData,
    isLoading,
    error,
    refetch: fetchData,
  };
}
