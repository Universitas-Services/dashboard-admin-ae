import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Activity, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {/* Tarjeta 1: Usuarios Totales */}
        <Card x-chunk="dashboard-01-chunk-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Totales
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">
              +180 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta 2: Actas Activas */}
        <Card x-chunk="dashboard-01-chunk-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Actas en Proceso
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              4 requieren atención
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta 3: Actividad */}
        <Card x-chunk="dashboard-01-chunk-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 en la última hora
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta 4: Alertas */}
        <Card x-chunk="dashboard-01-chunk-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas del Sistema</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando correctamente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sección inferior - Ejemplo de contenido amplio */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Resumen de Operaciones</CardTitle>
              <CardDescription>
                Resumen de las transacciones recientes en la plataforma.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border rounded bg-muted/20 text-muted-foreground">
                Espacio para Gráfica o Tabla
            </div>
          </CardContent>
        </Card>
        
        <Card x-chunk="dashboard-01-chunk-5">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="flex items-center gap-4">
               <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Crear Nuevo Usuario</p>
                  <p className="text-sm text-muted-foreground">Registrar un administrador.</p>
               </div>
            </div>
            {/* Más acciones aquí */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}