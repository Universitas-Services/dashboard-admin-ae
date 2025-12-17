'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';
import { ActaTypeChartData } from '@/types/dashboard';

// Configuración de colores para el gráfico
const chartConfigTipo = {
  cantidad: {
    label: 'Cantidad',
  },
  entrante: {
    label: 'Entrante',
    color: 'hsl(262, 83%, 78%)', // Morado suave
  },
  saliente: {
    label: 'Saliente',
    color: 'hsl(142, 28%, 63%)', // Verde suave
  },
  autoridad: {
    label: 'Max. Autoridad',
    color: 'hsl(24, 94%, 60%)', // Naranja
  },
  compliance: {
    label: 'Compliance',
    color: 'hsl(12, 96%, 73%)', // Rojo/Coral suave
  },
} satisfies ChartConfig;

interface ActasTypeChartProps {
  data: ActaTypeChartData[];
  isLoading?: boolean;
}

/**
 * Gráfico de barras verticales para mostrar tipos de actas de entrega
 */
export function ActasTypeChart({
  data,
  isLoading = false,
}: ActasTypeChartProps) {
  // Calcular el tipo con mayor cantidad para el mensaje del footer
  const maxType = data.reduce(
    (prev, current) => (prev.cantidad > current.cantidad ? prev : current),
    data[0]
  );

  const total = data.reduce((sum, item) => sum + item.cantidad, 0);
  const percentage =
    total > 0 ? Math.round((maxType.cantidad / total) * 100) : 0;

  if (isLoading) {
    return (
      <Card className="flex flex-col shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[250px]">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col shadow-sm">
      <CardHeader>
        <CardTitle>Tipo de actas de entrega</CardTitle>
        <CardDescription>Elaboración - compliance</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfigTipo}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="tipo"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
              className="text-xs font-medium"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="cantidad" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground font-bold"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          El {percentage}% de las actas son de {maxType.tipo.toLowerCase()}{' '}
          <span className="text-muted-foreground">↗</span>
        </div>
        <div className="leading-none text-muted-foreground">
          Puedes verificar las actas realizadas por este mes
        </div>
      </CardFooter>
    </Card>
  );
}
