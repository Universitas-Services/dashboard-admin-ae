'use client';

import * as React from 'react';
import { Eye, Loader2, User, FileText, Users } from 'lucide-react'; 
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { actasService } from '@/services/actasService';
import { ActaInfoDetails } from '@/types/acta';
import { cn } from '@/lib/utils'; 

interface ActaDetailsSheetProps {
  actaId: string;
  numeroActa: string | null;
}

export function ActaDetailsSheet({ actaId, numeroActa }: ActaDetailsSheetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [details, setDetails] = React.useState<ActaInfoDetails | null>(null);

  React.useEffect(() => {
    if (isOpen && !details) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const data = await actasService.getActaInfo(actaId);
          setDetails(data);
        } catch (error) {
          console.error('Error fetching acta info:', error);
          toast.error('No se pudo cargar la información del acta.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, actaId, details]);

  // Helper: Renderiza un campo de texto que crece verticalmente
  const renderField = (label: string, value: string | undefined | null) => (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      
      {/* SOLUCIÓN VISUAL:
         - Usamos un <div> en lugar de <Input> para permitir múltiples líneas.
         - break-words: Evita el desbordamiento horizontal rompiendo palabras largas.
         - whitespace-normal: Permite saltos de línea automáticos.
         - h-auto: La altura se ajusta al contenido.
      */}
      <div 
        className={cn(
          "w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm shadow-sm",
          "text-foreground ring-offset-background",
          "cursor-default min-h-[2.5rem] h-auto", 
          "whitespace-normal break-words" 
        )}
      >
        {value || 'N/A'}
      </div>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Ver detalles">
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver detalles</span>
        </Button>
      </SheetTrigger>
      
      {/* Scroll vertical activado (overflow-y-auto) y horizontal desactivado en el Sheet */}
      <SheetContent className="overflow-y-auto overflow-x-hidden w-[400px] sm:w-[600px] p-6 sm:p-8">
        <SheetHeader className="mb-8 space-y-2">
          <SheetTitle className="text-2xl font-bold text-primary">Detalles del Acta</SheetTitle>
          <SheetDescription className="text-base">
            Información detallada de los involucrados en el acta <span className="font-medium text-foreground">{numeroActa || 'S/N'}</span>.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm animate-pulse">Cargando información...</p>
          </div>
        ) : details ? (
          <div className="space-y-8 pb-8">
            
            {/* GRUPO 1: DATOS GENERALES */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-primary font-medium">
                  <User className="h-4 w-4" />
                  <h3>Datos del Usuario</h3>
               </div>
               <Separator />
               <div className="grid grid-cols-1">
                  {renderField('Email de contacto', details.email)}
               </div>
            </div>

            {/* GRUPO 2: SERVIDORES PÚBLICOS */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-primary font-medium">
                  <FileText className="h-4 w-4" />
                  <h3>Servidores Públicos</h3>
               </div>
               <Separator />
               <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                  {/* Saliente */}
                  {renderField('Servidor Saliente', details.nombreServidorSaliente)}
                  {renderField('Designación (Saliente)', details.designacionServidorSaliente)}
                  
                  {/* Recibe */}
                  {renderField('Servidor que Recibe', details.nombreServidorRecibe)}
                  {renderField('Designación (Recibe)', details.designacionServidorRecibe)}

                  {/* Entrante */}
                  {renderField('Servidor Entrante', details.nombreServidorEntrante)}
                  {renderField('Designación (Entrante)', details.designacionServidorEntrante)}
               </div>
            </div>

            {/* GRUPO 3: AUDITORÍA Y TESTIGOS */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-primary font-medium">
                  <Users className="h-4 w-4" />
                  <h3>Auditoría y Testigos</h3>
               </div>
               <Separator />
               <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                  {/* Auditor */}
                  {renderField('Nombre Auditor', details.nombreAuditor)}
                  {renderField('Profesión Auditor', details.profesionAuditor)}

                  {/* Testigo 1 */}
                  {renderField('Nombre Testigo 1', details.nombreTestigo1)}
                  {renderField('Profesión Testigo 1', details.profesionTestigo1)}

                  {/* Testigo 2 */}
                  {renderField('Nombre Testigo 2', details.nombreTestigo2)}
                  {renderField('Profesión Testigo 2', details.profesionTestigo2)}
               </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
            <p className="text-sm">No se encontró información disponible para esta acta.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}