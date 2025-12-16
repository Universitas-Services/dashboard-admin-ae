'use client';

import { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import { User } from '@/types/user';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2 } from 'lucide-react';

interface UserDetailSheetProps {
  userId: string;
}

// 1. Definición local del Perfil para evitar 'any'
interface UserProfile {
  institucion?: string;
  cargo?: string;
}

export function UserDetailSheet({ userId }: UserDetailSheetProps) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      adminService.getUserById(userId)
        .then((data) => {
          setUser(data);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Error al cargar detalles del usuario");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, userId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await adminService.deleteUser(userId);
      toast.success("Usuario eliminado correctamente");
      setOpen(false);
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar usuario");
    } finally {
      setIsDeleting(false);
    }
  };

  // 2. CORRECCIÓN LÍNEA 85: Tipado seguro en lugar de 'as any'
  const profile = (user as User & { profile?: UserProfile })?.profile || {};

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 p-0 text-foreground hover:bg-muted"
        >
          <FaEye className="h-4 w-4" /> 
          <span className="sr-only">Ver detalles</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="!animate-none !transition-none sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalles del Usuario</SheetTitle>
          <SheetDescription>
            Visualización de datos registrados. Modo solo lectura.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : user ? (
            <>
              {/* Sección: Información Personal */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Información Personal</h3>
                
                <div className="grid gap-2">
                  <Label>Nombre Completo</Label>
                  <Input 
                    value={`${user.nombre || ''} ${user.apellido || ''}`.trim()} 
                    readOnly 
                    className="bg-muted text-muted-foreground focus-visible:ring-0" 
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Correo Electrónico</Label>
                  <Input 
                    value={user.email} 
                    readOnly 
                    className="bg-muted text-muted-foreground focus-visible:ring-0" 
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Teléfono</Label>
                  {/* 3. CORRECCIÓN LÍNEA 142: Eliminado 'as any', ya existe en User */}
                  <Input 
                    value={user.telefono || 'No registrado'} 
                    readOnly 
                    className="bg-muted text-muted-foreground focus-visible:ring-0" 
                  />
                </div>
              </div>

              <Separator />

              {/* Sección: Información Institucional */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Perfil Institucional</h3>
                
                <div className="grid gap-2">
                  <Label>Institución</Label>
                  <Input 
                    value={profile.institucion || 'No asignada'} 
                    readOnly 
                    className="bg-muted text-muted-foreground focus-visible:ring-0" 
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Cargo</Label>
                  <Input 
                    value={profile.cargo || 'No asignado'} 
                    readOnly 
                    className="bg-muted text-muted-foreground focus-visible:ring-0" 
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar Usuario
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="!animate-none">
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Está seguro de eliminar este usuario?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción es irreversible e inmediata. El usuario perderá acceso al sistema permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>NO</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete} 
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Eliminando...' : 'SÍ, ELIMINAR'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-red-500">
              No se pudo cargar la información del usuario.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}