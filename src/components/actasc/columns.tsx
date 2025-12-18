'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ActaCompliance } from '@/types/compliance';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Download, Send, Copy } from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mapeo de colores según los estados confirmados
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Enviada':
      return 'default'; // Generalmente negro o color primario
    case 'Descargada':
      return 'secondary'; // Gris o color secundario
    case 'Guardada':
      return 'outline'; // Bordeado, indica borrador/inicial
    default:
      return 'secondary';
  }
};

// Componente de Acciones (Solo visual por ahora)
const ActionCell = ({ acta }: { acta: ActaCompliance }) => {
  const handleDownload = () => {
    toast.info(`Próximamente: Descargar acta ${acta.numeroCompliance}`);
  };

  const handleSend = () => {
    toast.info(`Próximamente: Enviar acta ${acta.numeroCompliance}`);
  };

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
        
        <DropdownMenuItem onClick={() => {
            navigator.clipboard.writeText(acta.numeroCompliance);
            toast.success("Número de acta copiado");
        }}>
          <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
          Copiar Número
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4 text-blue-600" />
          Descargar DOCX
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSend}>
          <Send className="mr-2 h-4 w-4 text-green-600" />
          Enviar por Correo
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<ActaCompliance>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
    accessorKey: 'numeroCompliance',
    header: 'Número de Acta',
    cell: ({ row }) => (
      <div className="font-medium whitespace-nowrap">
        {row.getValue('numeroCompliance') || 'S/N'}
      </div>
    ),
  },
  {
    accessorKey: 'nombre_organo_entidad',
    header: 'Nombre del Órgano',
    cell: ({ row }) => (
      <div className="max-w-[250px] truncate" title={row.getValue('nombre_organo_entidad')}>
        {row.getValue('nombre_organo_entidad') || 'No registrado'}
      </div>
    ),
  },
  {
    accessorKey: 'rif_organo_entidad',
    header: 'RIF',
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue('rif_organo_entidad') || 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: 'puntajeCalculado',
    header: 'Puntuación',
    cell: ({ row }) => {
        const score = row.getValue('puntajeCalculado') as number;
        // Lógica visual: Verde si es alto, Rojo si es bajo
        const colorClass = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
        return (
            <div className={`font-bold ${colorClass}`}>
                {score !== undefined ? `${score.toFixed(2)}%` : '-'}
            </div>
        );
    }
  },
  {
    accessorKey: 'status',
    header: 'Estatus',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={getStatusVariant(status)} className="text-xs">
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Opciones',
    cell: ({ row }) => <ActionCell acta={row.original} />,
  },
];