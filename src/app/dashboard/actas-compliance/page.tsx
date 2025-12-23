// src/app/dashboard/actas-compliance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, FileText } from 'lucide-react';

// Importamos los componentes modulares que creamos para Compliance
import { DataTable } from '@/components/actasc/data-table';
import { columns } from '@/components/actasc/columns';
import { complianceService } from '@/services/complianceService';
import { ActaCompliance } from '@/types/compliance';

// Importamos componentes de UI genéricos
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function ActasCompliancePage() {
  // Estados para manejo de datos
  const [data, setData] = useState<ActaCompliance[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para paginación y búsqueda
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para cargar los datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await complianceService.getAllActasCompliance({
        page,
        limit: 10,
        search: searchTerm || undefined, // Si está vacío, enviamos undefined
      });

      setData(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.totalItems);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el historial de compliance');
    } finally {
      setLoading(false);
    }
  };

  // Effect: Cargar datos al iniciar o cambiar página/búsqueda
  useEffect(() => {
    // Debounce para la búsqueda (esperar a que el usuario termine de escribir)
    const timer = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [page, searchTerm]);

  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      {/* Encabezado */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            Actas Compliance
          </h1>
        </div>
        <p className="text-muted-foreground">
          Gestión y seguimiento de las {totalItems} actas de cumplimiento
          registradas en el sistema.
        </p>
      </div>

      <Separator />

      {/* Barra de Herramientas (Búsqueda) */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, órgano o RIF..."
            className="pl-8 bg-background"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Resetear a página 1 al buscar
            }}
          />
        </div>
        {/* Aquí podrías agregar botones de filtros adicionales en el futuro */}
      </div>

      {/* Tabla de Datos Modularizada */}
      <DataTable
        columns={columns}
        data={data}
        pageCount={totalPages}
        currentPage={page}
        onPageChange={setPage}
        isLoading={loading}
      />
    </div>
  );
}
