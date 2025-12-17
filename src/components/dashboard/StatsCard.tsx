'use client';

import {
  FileText,
  Bookmark,
  CheckSquare,
  Send,
  LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCardData } from '@/types/dashboard';

// Mapeo de nombres de íconos a componentes
const ICON_MAP: Record<KpiCardData['icon'], LucideIcon> = {
  fileText: FileText,
  bookmark: Bookmark,
  checkSquare: CheckSquare,
  send: Send,
};

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: KpiCardData['icon'];
  isLoading?: boolean;
}

/**
 * Componente de tarjeta KPI reutilizable para el dashboard
 */
export function StatsCard({
  title,
  value,
  icon,
  isLoading = false,
}: StatsCardProps) {
  const IconComponent = ICON_MAP[icon];

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[140px]" />
          <Skeleton className="h-5 w-5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-[80px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <IconComponent className="h-5 w-5 text-gray-900" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

interface StatsCardsGridProps {
  cards: KpiCardData[];
  isLoading?: boolean;
}

/**
 * Grid de 4 tarjetas KPI
 */
export function StatsCardsGrid({
  cards,
  isLoading = false,
}: StatsCardsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <StatsCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
