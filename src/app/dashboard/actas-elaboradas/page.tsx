'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { actasService } from '@/services/actasService';
import { Acta } from '@/types/acta';
import { DataTable } from '@/components/actase/data-table';
import { columns } from '@/components/actase/columns';

export default function ActasCreadasPage() {
  const [data, setData] = useState<Acta[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de paginación y filtro
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce manual simple para el buscador para no saturar API
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch de datos
  useEffect(() => {
    const fetchActas = async () => {
      setLoading(true);
      try {
        const response = await actasService.getAllActasAdmin({
          page: currentPage,
          limit,
          search: debouncedSearch,
          // status: 'COMPLETADA' // Descomentar si quieres filtrar por defecto
        });

        setData(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalItems(response.meta.totalItems);
      } catch (error) {
        console.error('Error fetching actas:', error);
        toast.error('Error al cargar las actas');
      } finally {
        setLoading(false);
      }
    };

    fetchActas();
  }, [currentPage, limit, debouncedSearch]);

  // Resetear a página 1 cuando se busca
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">
            Actas elaboradas
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-lg">
              Mostrando {data.length} de {totalItems} registros.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 my-4">
        {/* BUSCADOR */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por número, entidad o RIF..."
            className="pl-10 py-6 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border shadow-sm bg-card overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          pageSize={limit}
          onPageSizeChange={(sz) => {
            setLimit(sz);
            setCurrentPage(1);
          }}
          pageCount={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
