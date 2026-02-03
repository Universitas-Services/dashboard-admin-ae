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
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import { ComplianceChartData } from '@/types/dashboard';

// Configuración de colores para el gráfico
const chartConfigCompliance = {
  valor: {
    label: 'Valor',
  },
  total: {
    label: 'Total realizadas',
    color: 'hsl(142, 76%, 36%)', // Verde fuerte
  },
  guardadas: {
    label: 'Guardadas',
    color: 'hsl(262, 53%, 67%)', // Morado medio
  },
  enviadas: {
    label: 'Enviadas',
    color: 'hsl(24, 75%, 50%)', // Naranja fuerte
  },
  descargadas: {
    label: 'Descargadas',
    color: 'hsl(180, 70%, 45%)', // Cyan/Teal
  },
} satisfies ChartConfig;

interface ComplianceChartProps {
  data: ComplianceChartData[];
  isLoading?: boolean;
}

/**
 * Gráfico de barras horizontales para mostrar estadísticas de compliance
 */
export function ComplianceChart({
  data,
  isLoading = false,
}: ComplianceChartProps) {
  // Encontrar el estado con mayor valor (excluyendo "Total realizadas")
  const statusData = data.filter((item) => item.label !== 'Total realizadas');
  const maxStatus = statusData.reduce(
    (prev, current) => (prev.valor > current.valor ? prev : current),
    statusData[0]
  );

  // Obtener el mes actual para el subtítulo
  const currentDate = new Date();
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  if (isLoading) {
    return (
      <Card className="flex flex-col shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-[220px]" />
          <Skeleton className="h-4 w-[150px]" />
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[250px]">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col shadow-sm">
      <CardHeader>
        <CardTitle>Actas de entrega - Compliance</CardTitle>
        <CardDescription>
          {currentMonth} - {currentYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfigCompliance}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis dataKey="valor" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="valor" layout="vertical" radius={5}>
              <LabelList
                dataKey="label"
                position="insideLeft"
                offset={10}
                fontSize={12}
                content={({ x, y, width, height, value, index }) => {
                  const itemValue = data[index as number]?.valor ?? 0;
                  const textColor =
                    itemValue === 0 ? 'hsl(var(--foreground))' : 'white';
                  // Si el valor es 0, posicionar el texto más a la izquierda ya que no hay barra
                  const xPos =
                    itemValue === 0 ? (x as number) : (x as number) + 10;
                  return (
                    <text
                      x={xPos}
                      y={(y as number) + (height as number) / 2}
                      fill={textColor}
                      dominantBaseline="middle"
                      fontSize={12}
                      fontWeight={500}
                      style={{
                        filter:
                          itemValue === 0
                            ? 'none'
                            : 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                      }}
                    >
                      {value}
                    </text>
                  );
                }}
              />
              <LabelList
                dataKey="valor"
                fontSize={12}
                content={({ x, y, width, height, value, index }) => {
                  const itemValue = data[index as number]?.valor ?? 0;
                  const labelText = data[index as number]?.label ?? '';
                  // Calcular el ancho aproximado del texto del label (aprox 7px por carácter)
                  const labelWidth = labelText.length * 7;
                  // Si el valor es 0, posicionar el número después del texto del label
                  const xPos =
                    itemValue === 0
                      ? (x as number) + labelWidth + 15
                      : (x as number) + (width as number) + 10;
                  return (
                    <text
                      x={xPos}
                      y={(y as number) + (height as number) / 2}
                      fill="hsl(var(--foreground))"
                      dominantBaseline="middle"
                      fontSize={12}
                      fontWeight={700}
                    >
                      {value}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Este mes la cantidad de reportes{' '}
          {maxStatus?.label?.toLowerCase() || 'guardadas'} es:{' '}
          {maxStatus?.valor || 0}{' '}
          <span className="text-muted-foreground">↗</span>
        </div>
        <div className="leading-none text-muted-foreground">
          Actas de entrega - Compliance
        </div>
      </CardFooter>
    </Card>
  );
}
