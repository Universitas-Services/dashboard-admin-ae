'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge'; // Usamos Badge para el estatus
import { FaEye } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { FaTrashCan } from 'react-icons/fa6';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// 1. DEFINICIÓN DE TIPOS
type Acta = {
  id: string;
  numeroActa: string;
  nombreOrgano: string;
  tipoActa: string;
  estatus: 'Creada' | 'En Revisión' | 'Finalizada' | 'Anulada';
};

// 2. DATOS DE PRUEBA (MOCK DATA) - 30 Registros
const initialActas: Acta[] = Array.from({ length: 30 }, (_, i) => {
  const estatusOptions: Acta['estatus'][] = [
    'Creada',
    'En Revisión',
    'Finalizada',
    'Anulada',
  ];
  const tiposOptions = ['Entrega', 'Recepción', 'Auditoría', 'Supervisión'];
  const organosOptions = [
    'Dirección de Finanzas',
    'Recursos Humanos',
    'Consultoría Jurídica',
    'Despacho del Alcalde',
    'Ingeniería Municipal',
  ];

  return {
    id: `ACT-${2025000 + i}`,
    numeroActa: `AE-${2025}-${(i + 1).toString().padStart(4, '0')}`,
    nombreOrgano: organosOptions[i % organosOptions.length],
    tipoActa: tiposOptions[i % tiposOptions.length],
    estatus: estatusOptions[i % estatusOptions.length],
  };
});

export default function ActasCreadasPage() {
  const [actas, setActas] = useState<Acta[]>(initialActas);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(actas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActas = actas.slice(startIndex, endIndex);

  // -- LÓGICA DE SELECCIÓN --
  const isAllSelected =
    currentActas.length > 0 &&
    currentActas.every((acta) => selectedRows.includes(acta.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = [
        ...new Set([...selectedRows, ...currentActas.map((a) => a.id)]),
      ];
      setSelectedRows(newSelected);
    } else {
      const currentIds = currentActas.map((a) => a.id);
      setSelectedRows(selectedRows.filter((id) => !currentIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  // -- ACCIONES --
  const handleDelete = (id: string) => {
    setActas(actas.filter((a) => a.id !== id));
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const handleBulkDelete = () => {
    setActas(actas.filter((a) => !selectedRows.includes(a.id)));
    setSelectedRows([]);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Helper para color del Badge según estatus
  const getBadgeVariant = (estatus: string) => {
    switch (estatus) {
      case 'Finalizada':
        return 'default'; // Negro/Oscuro
      case 'En Revisión':
        return 'secondary'; // Gris claro
      case 'Creada':
        return 'outline'; // Borde
      case 'Anulada':
        return 'destructive'; // Rojo
      default:
        return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Actas Creadas</h2>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-lg">
              Mostrando {startIndex + 1}-{Math.min(endIndex, actas.length)} de{' '}
              {actas.length} actas registradas.
            </p>
          </div>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 my-4">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por número o órgano..."
            className="pl-10 py-6 text-lg"
          />
        </div>

        {/* Acciones Masivas */}
        {selectedRows.length > 0 && (
          <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-5">
            <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              {selectedRows.length} seleccionadas
            </span>

            <div className="h-8 w-[1px] bg-border" />

            <Button
              variant="destructive"
              size="icon"
              className="h-10 w-10 shadow-sm"
              onClick={handleBulkDelete}
              title="Eliminar actas seleccionadas"
            >
              <FaTrashCan className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* TABLA DE ACTAS */}
      <div className="rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50px] pl-6">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) =>
                    handleSelectAll(checked as boolean)
                  }
                />
              </TableHead>

              <TableHead className="text-lg py-4">Número de Acta</TableHead>
              <TableHead className="text-lg py-4">Nombre del Órgano</TableHead>
              <TableHead className="text-lg py-4">Tipo de Acta</TableHead>
              <TableHead className="text-lg py-4">Estatus</TableHead>
              <TableHead className="text-lg py-4 text-center pr-6">
                Opciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentActas.map((acta) => {
              const isSelected = selectedRows.includes(acta.id);
              return (
                <TableRow
                  key={acta.id}
                  className={`text-base transition-colors ${isSelected ? 'bg-blue-50/50 hover:bg-blue-50/70' : 'hover:bg-muted/30'}`}
                >
                  <TableCell className="pl-6 py-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleSelectRow(acta.id, checked as boolean)
                      }
                    />
                  </TableCell>

                  <TableCell className="font-medium py-4">
                    {acta.numeroActa}
                  </TableCell>
                  <TableCell className="py-4 text-muted-foreground">
                    {acta.nombreOrgano}
                  </TableCell>
                  <TableCell className="py-4">{acta.tipoActa}</TableCell>

                  {/* Columna Estatus con Badge */}
                  <TableCell className="py-4">
                    <Badge
                      variant={getBadgeVariant(acta.estatus)}
                      className="text-sm px-3 py-1"
                    >
                      {acta.estatus}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4 pr-6">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <FaEye className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(acta.id)}
                      >
                        <MdDelete className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Paginación */}
        <div className="py-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === index + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(index + 1);
                    }}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
