'use client';

import { ColumnDef } from '@tanstack/react-table';
import { AxiosError } from 'axios';
import { Acta, ActaStatus } from '@/types/acta';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Download, Send } from 'lucide-react';
import { toast } from 'sonner';
import { actasService } from '@/services/actasService';
import { ActaDetailsSheet } from './ActaDetailsSheet'; // Importamos tu nuevo componente

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// --- COMPONENTE INTERNO PARA MANEJAR ACCIONES (Dropdown de 3 puntos) ---
const ActaActionCell = ({ acta }: { acta: Acta }) => {
  
  const isGuardada = acta.status === 'GUARDADA';

  const handleDownload = async () => {
    if (isGuardada) {
        toast.error("El acta debe estar COMPLETADA para poder descargarla.");
        return;
    }

    const toastId = toast.loading('Generando documento...');
    try {
      const blob = await actasService.downloadActaDocx(acta.id);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Acta-${acta.numeroActa || 'Borrador'}.docx`);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Descarga iniciada', { id: toastId });
    } catch (error) {
      console.error(error);
      let errorMessage = 'Error al descargar el acta.';
      
      if (error instanceof AxiosError && error.response?.data?.message) {
        const msg = error.response.data.message;
        errorMessage = Array.isArray(msg) ? msg[0] : msg;
      }
      
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleSendEmail = async () => {
    if (isGuardada) {
        toast.error("El acta debe estar COMPLETADA para poder enviarla.");
        return;
    }

    const toastId = toast.loading('Enviando acta por correo...');
    try {
      await actasService.sendActaDocx(acta.id);
      toast.success('Documento enviado exitosamente al correo del usuario', { id: toastId });
    } catch (error) {
      console.error(error);
      let errorMessage = 'Error al enviar el correo.';
      
      if (error instanceof AxiosError && error.response?.data?.message) {
         const msg = error.response.data.message;
         errorMessage = Array.isArray(msg) ? msg[0] : msg;
      }
      
      toast.error(errorMessage, { id: toastId });
    }
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
        
        <DropdownMenuItem 
            onClick={handleDownload} 
            className={isGuardada ? "opacity-50 cursor-not-allowed" : ""}
        >
          <Download className="mr-2 h-4 w-4 text-blue-600" />
          Descargar DOCX
        </DropdownMenuItem>

        <DropdownMenuItem 
            onClick={handleSendEmail} 
            className={isGuardada ? "opacity-50 cursor-not-allowed" : ""}
        >
          <Send className="mr-2 h-4 w-4 text-green-600" />
          Enviar por Correo
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// --- DEFINICIONES DE COLUMNAS ---

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
  {
    accessorKey: 'tiempoRealizacion',
    header: 'Lapsos',
    cell: ({ row }) => {
      const valRoot = row.original.tiempoRealizacion;
      const valMeta = row.original.metadata?.['tiempoRealizacion'] as number | string | undefined;
      const valor = valRoot ?? valMeta ?? 0;

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
      const isCritical = dias < 5; 

      return (
        <div className={`font-medium ${isCritical ? 'text-red-600' : 'text-green-600'}`}>
           {dias} días
        </div>
      );
    },
  },
  // ESTA ES LA ÚNICA DEFINICIÓN DE LA COLUMNA ACCIONES
  {
    id: 'actions',
    header: 'Opciones',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {/* Tu nuevo Sheet */}
        <ActaDetailsSheet 
            actaId={row.original.id} 
            numeroActa={row.original.numeroActa} 
        />
        
        {/* El menú de 3 puntos original */}
        <ActaActionCell acta={row.original} />
      </div>
    ),
  },
];