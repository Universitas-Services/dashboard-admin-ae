'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Acta, ActaStatus } from '@/types/acta';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Función auxiliar para colores de Badge según Status
const getStatusVariant = (status: ActaStatus) => {
  switch (status) {
    case 'ENTREGADA':
    case 'ENVIADA':
      return 'default';
    case 'COMPLETADA':
    case 'DESCARGADA':
      return 'secondary';
    case 'GUARDADA':
      return 'outline';
    default:
      return 'default';
  }
};

export const columns: ColumnDef<Acta>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'numeroActa',
    header: 'Número de Acta',
    cell: ({ row }) => (
      <div className="font-medium whitespace-nowrap">
        {row.original.numeroActa || 'S/N'}
      </div>
    ),
  },
  {
    accessorKey: 'nombreEntidad',
    header: 'Nombre del Órgano',
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.original.nombreEntidad || ''}>
        {row.original.nombreEntidad || 'No registrado'}
      </div>
    ),
  },
  {
    id: 'rif',
    header: 'RIF',
    cell: ({ row }) => {
      const metadata = row.original.metadata;
      // Busca rifOrgano o rif, o muestra N/A
      const rifValue = (metadata?.rifOrgano as string) || (metadata?.rif as string) || 'N/A';
      
      return <div className="font-mono text-sm">{rifValue}</div>;
    },
  },
  {
    accessorKey: 'type',
    header: 'Tipo de Acta',
    cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const formatted = type ? type.replace(/_/g, ' ').toLowerCase() : 'N/A';
        return <div className="capitalize whitespace-nowrap">{formatted}</div>;
    }
  },
  {
    accessorKey: 'status',
    header: 'Estatus',
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.original.status)} className="text-xs">
        {row.original.status}
      </Badge>
    ),
  },
  
  // --- COLUMNA LAPSOS (TIEMPO REALIZACIÓN) SIMPLE ---
  {
    accessorKey: 'tiempoRealizacion',
    header: 'Lapsos',
    cell: ({ row }) => {
      // 1. Buscamos el valor en la raíz
      const valRoot = row.original.tiempoRealizacion;
      
      // 2. Buscamos en metadata por si acaso
      const valMeta = row.original.metadata?.['tiempoRealizacion'] as number | string | undefined;
      
      // 3. Obtenemos el valor final (sin conversión extraña, solo mostramos lo que llegue)
      const valor = valRoot ?? valMeta ?? 0;

      // 4. Renderizado directo: Muestra el número tal cual (ej: 0, 1, 3, 120...)
      return (
        <div className="text-muted-foreground font-medium">
          {valor}
        </div>
      );
    },
  },

  {
    accessorKey: 'diasRestantes',
    header: 'Moratoria',
    cell: ({ row }) => {
      const dias = row.original.diasRestantes ?? 0;
      // Rojo si es negativo o menor a 5
      const isCritical = dias < 5; 

      return (
        <div className={`font-medium ${isCritical ? 'text-red-600' : 'text-green-600'}`}>
           {dias} días
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Opciones',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(row.original.id)}
            >
              Copiar ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];