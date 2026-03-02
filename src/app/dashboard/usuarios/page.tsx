'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { User } from '@/types/user';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

// Importamos los módulos nuevos
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/columns';

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers({
        page,
        limit,
        search: searchTerm || undefined,
      });
      setUsers(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalUsers(response.meta.totalItems);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, limit, searchTerm]);

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestión de Usuarios
          </h2>
          <p className="text-muted-foreground">
            Administra los roles y accesos de los {totalUsers} usuarios
            registrados.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-24 items-center justify-center rounded-md border bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Cargando datos...</span>
        </div>
      ) : (
        /* AQUI USAMOS EL COMPONENTE MODULARIZADO */
        <DataTable
          columns={columns}
          data={users}
          pageSize={limit}
          onPageSizeChange={(newSize) => {
            setLimit(newSize);
            setPage(1);
          }}
        />
      )}

      {/* Paginación (Se mantiene aquí porque controla el estado global de la página) */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1 || loading}
        >
          Anterior
        </Button>
        <div className="text-sm text-muted-foreground">
          Página {page} de {totalPages || 1}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPage((old) => (!totalPages || old >= totalPages ? old : old + 1))
          }
          disabled={page === totalPages || loading}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
