'use client';

import { useDashboardStats } from '@/hooks/useDashboardStats';
import { StatsCardsGrid } from '@/components/dashboard/StatsCard';
import { ActasTypeChart } from '@/components/dashboard/ActasTypeChart';
import { ComplianceChart } from '@/components/dashboard/ComplianceChart';

export default function DashboardPage() {
  const { kpiCards, actasTypeData, complianceData, isLoading } =
    useDashboardStats();

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      {/* 1. SECCIÓN DE TARJETAS SUPERIORES (KPIs) */}
      <StatsCardsGrid cards={kpiCards} isLoading={isLoading} />

      {/* 2. SECCIÓN DE GRÁFICOS */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* GRÁFICO IZQUIERDO: TIPO DE ACTAS (Barras Verticales) */}
        <ActasTypeChart data={actasTypeData} isLoading={isLoading} />

        {/* GRÁFICO DERECHO: COMPLIANCE (Barras Horizontales) */}
        <ComplianceChart data={complianceData} isLoading={isLoading} />
      </div>
    </div>
  );
}
