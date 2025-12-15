"use client"

import { FileText, Bookmark, CheckSquare, Send } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

// --- DATOS MOCK ---

// Datos para las 4 Tarjetas Superiores
const kpiData = [
  { title: "Total actas elaboradas", value: "100", icon: FileText, color: "text-gray-900" },
  { title: "Actas guardadas", value: "50", icon: Bookmark, color: "text-gray-900" },
  { title: "Actas completadas", value: "25", icon: CheckSquare, color: "text-gray-900" },
  { title: "Actas entregadas", value: "25", icon: Send, color: "text-gray-900" },
]

// Datos para Gráfico Izquierdo (Tipo de actas)
const chartDataTipo = [
  { tipo: "Entrante", cantidad: 20, fill: "var(--color-entrante)" },
  { tipo: "Saliente", cantidad: 50, fill: "var(--color-saliente)" },
  { tipo: "Max. Autoridad", cantidad: 30, fill: "var(--color-autoridad)" },
  { tipo: "Compliance", cantidad: 10, fill: "var(--color-compliance)" },
]

// Configuración de colores Gráfico Izquierdo
const chartConfigTipo = {
  cantidad: {
    label: "Cantidad",
  },
  entrante: {
    label: "Entrante",
    color: "hsl(262, 83%, 78%)", // Morado suave
  },
  saliente: {
    label: "Saliente",
    color: "hsl(142, 28%, 63%)", // Verde suave
  },
  autoridad: {
    label: "Max. Autoridad",
    color: "hsl(24, 94%, 60%)", // Naranja
  },
  compliance: {
    label: "Compliance",
    color: "hsl(12, 96%, 73%)", // Rojo/Coral suave
  },
} satisfies ChartConfig

// Datos para Gráfico Derecho (Compliance - Horizontal)
const chartDataCompliance = [
  { label: "Total realizadas", valor: 15, fill: "var(--color-total)" },
  { label: "Guardadas", valor: 7, fill: "var(--color-guardadas)" },
  { label: "Enviadas", valor: 5, fill: "var(--color-enviadas)" },
  { label: "Descargadas", valor: 3, fill: "var(--color-descargadas)" },
]

// Configuración de colores Gráfico Derecho
const chartConfigCompliance = {
  valor: {
    label: "Valor",
  },
  total: {
    label: "Total realizadas",
    color: "hsl(142, 76%, 36%)", // Verde fuerte
  },
  guardadas: {
    label: "Guardadas",
    color: "hsl(262, 53%, 67%)", // Morado medio
  },
  enviadas: {
    label: "Enviadas",
    color: "hsl(24, 75%, 50%)", // Naranja fuerte
  },
  descargadas: {
    label: "Descargadas",
    color: "hsl(180, 70%, 45%)", // Cyan/Teal
  },
} satisfies ChartConfig


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 w-full p-6">
      
      {/* 1. SECCIÓN DE TARJETAS SUPERIORES (KPIs) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((item, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. SECCIÓN DE GRÁFICOS */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* GRÁFICO IZQUIERDO: TIPO DE ACTAS (Barras Verticales) */}
        <Card className="flex flex-col shadow-sm">
          <CardHeader>
            <CardTitle>Tipo de actas de entrega</CardTitle>
            <CardDescription>Elaboración - compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigTipo}>
              <BarChart accessibilityLayer data={chartDataTipo}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="tipo"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value} // Muestra el nombre completo
                  className="text-xs font-medium"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="cantidad" radius={8}>
                    {/* Etiqueta arriba de la barra con el número */}
                   <LabelList position="top" offset={12} className="fill-foreground font-bold" fontSize={12} />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              El 50% de las actas son de saliente <span className="text-muted-foreground">↗</span>
            </div>
            <div className="leading-none text-muted-foreground">
              Puedes verificar las actas realizadas por este mes
            </div>
          </CardFooter>
        </Card>

        {/* GRÁFICO DERECHO: COMPLIANCE (Barras Horizontales) */}
        <Card className="flex flex-col shadow-sm">
          <CardHeader>
            <CardTitle>Compliance acta de entrega</CardTitle>
            <CardDescription>Enero - Febrero 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigCompliance}>
              {/* layout="vertical" hace que las barras sean horizontales */}
              <BarChart
                accessibilityLayer
                data={chartDataCompliance}
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
                  hide // Ocultamos el eje Y por defecto para poner el texto DENTRO de la barra si quisiéramos, pero aquí usaremos el tooltip
                />
                <XAxis dataKey="valor" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                
                {/* Barras con bordes redondeados y etiquetas dentro */}
                <Bar dataKey="valor" layout="vertical" radius={5}>
                   <LabelList 
                        dataKey="label" 
                        position="insideLeft" 
                        offset={10} 
                        className="fill-white font-medium drop-shadow-md" 
                        fontSize={12} 
                    />
                   <LabelList 
                        dataKey="valor" 
                        position="right" 
                        offset={10} 
                        className="fill-foreground font-bold" 
                        fontSize={12} 
                    />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Este mes los reportes son guardadas <span className="text-muted-foreground">↗</span>
            </div>
            <div className="leading-none text-muted-foreground">
              Compliances de actas de entrega
            </div>
          </CardFooter>
        </Card>

      </div>
    </div>
  )
}