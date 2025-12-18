'use client';

import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { ActaCompliance } from '@/types/compliance';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Download, Send, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { complianceService } from '@/services/complianceService';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Enviada':
      return 'default';
    case 'Descargada':
      return 'secondary';
    case 'Guardada':
      return 'outline';
    default:
      return 'secondary';
  }
};

const ActionCell = ({ acta }: { acta: ActaCompliance }) => {
  
  const isGuardada = acta.status === 'Guardada';

  const handleDownload = async () => {
    if (isGuardada) {
      toast.error("El acta debe estar COMPLETADA para poder descargarla.");
      return;
    }

    const toastId = toast.loading('Descargando PDF...');
    
    try {
      // 1. Definimos el nombre del archivo aquí
      const fileName = `Compliance-${acta.numeroCompliance || 'Borrador'}.pdf`;

      // 2. Llamamos al servicio refactorizado
      // La lógica del Blob y el link <a> ahora ocurre dentro de esta función
      await complianceService.downloadCompliancePdf(acta.id, fileName);
      
      toast.dismiss(toastId);
      toast.success('Descarga iniciada');
      
    } catch (error: unknown) {
      console.error("Error en descarga:", error);
      let errorMessage = 'Error al descargar el documento.';
      
      // Mantenemos la lógica de lectura de errores en Blobs 
      // (necesario porque si falla, axios devuelve un Blob con el JSON de error dentro)
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        
        if (data instanceof Blob) {
            try {
                const text = await data.text();
                const errorObj = JSON.parse(text);
                errorMessage = errorObj.message || errorObj.error || errorMessage;
            } catch (e) {
                console.warn("No se pudo parsear el error del Blob", e);
            }
        } 
        else if (data?.message) {
            errorMessage = data.message;
        }

        if (Array.isArray(errorMessage)) {
            errorMessage = errorMessage[0];
        }
      }
      
      toast.dismiss(toastId);
      toast.error(errorMessage);
    }
  };

  const handleSend = async () => {
    if (isGuardada) {
      toast.error("El acta debe estar COMPLETADA para poder enviarla.");
      return;
    }

    const toastId = toast.loading('Enviando compliance por correo...');
    try {
      await complianceService.sendComplianceEmail(acta.id);
      toast.dismiss(toastId);
      toast.success('Documento enviado exitosamente al correo del usuario');
      
    } catch (error: unknown) {
      console.error(error);
      let errorMessage = 'Error al enviar el correo.';
      
      if (axios.isAxiosError(error) && error.response?.data?.message) {
         const msg = error.response.data.message;
         errorMessage = Array.isArray(msg) ? msg[0] : msg;
      }
      
      toast.dismiss(toastId);
      toast.error(errorMessage);
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
        
        <DropdownMenuItem onClick={() => {
            navigator.clipboard.writeText(acta.numeroCompliance);
            toast.success("Número de acta copiado");
        }}>
          <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
          Copiar Número
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
            onClick={handleDownload}
            className={isGuardada ? "opacity-50 cursor-not-allowed" : ""}
        >
          {/* Cambiado a rojo para indicar PDF */}
          <Download className="mr-2 h-4 w-4 text-red-600" />
          Descargar PDF
        </DropdownMenuItem>
        
        <DropdownMenuItem 
            onClick={handleSend}
            className={isGuardada ? "opacity-50 cursor-not-allowed" : ""}
        >
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
        const colorClass = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
        
        // Lógica aplicada: (score ?? 0) asegura que no sea nulo, y .toFixed(2) fuerza los decimales
        return (
            <div className={`font-bold ${colorClass}`}>
                {(score ?? 0).toFixed(2)} pts
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