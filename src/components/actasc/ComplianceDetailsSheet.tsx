// src/components/actasc/ComplianceDetailsSheet.tsx
'use client';

import * as React from 'react';
import { Eye, Loader2, User, FileText } from 'lucide-react';
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

import { complianceService } from '@/services/complianceService';
import { ComplianceInfoDetails } from '@/types/compliance';
import { cn } from '@/lib/utils';

interface ComplianceDetailsSheetProps {
  actaId: string;
  numeroCompliance: string | null;
}

export function ComplianceDetailsSheet({
  actaId,
  numeroCompliance,
}: ComplianceDetailsSheetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [details, setDetails] = React.useState<ComplianceInfoDetails | null>(
    null
  );

  React.useEffect(() => {
    if (isOpen && !details) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const data = await complianceService.getComplianceInfo(actaId);
          setDetails(data);
        } catch (error) {
          console.error('Error fetching compliance info:', error);
          toast.error('No se pudo cargar la información del acta.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, actaId, details]);

  // Helper: Renderiza el campo expandible (reutilizado del módulo anterior)
  const renderField = (label: string, value: string | undefined | null) => (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      <div
        className={cn(
          'w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm shadow-sm',
          'text-foreground ring-offset-background',
          'cursor-default min-h-[2.5rem] h-auto',
          'whitespace-normal break-words'
        )}
      >
        {value || 'N/A'}
      </div>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Ver detalles"
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver detalles</span>
        </Button>
      </SheetTrigger>

      {/* Scroll vertical activado y horizontal desactivado */}
      <SheetContent className="overflow-y-auto overflow-x-hidden w-[400px] sm:w-[600px] p-6 sm:p-8">
        <SheetHeader className="mb-8 space-y-2">
          <SheetTitle className="text-2xl font-bold text-primary">
            Detalles de compliance
          </SheetTitle>
          <SheetDescription className="text-base">
            Información del evaluador para el acta{' '}
            <span className="font-medium text-foreground">
              {numeroCompliance || 'S/N'}
            </span>
            .
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
                <h3>Datos del usuario</h3>
              </div>
              <Separator />
              <div className="grid grid-cols-1">
                {renderField('Email del usuario', details.email)}
              </div>
            </div>

            {/* GRUPO 2: DATOS DEL EVALUADOR */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-medium">
                <FileText className="h-4 w-4" />
                <h3>Datos del evaluador</h3>
              </div>
              <Separator />
              {/* Grid de 2 columnas para consistencia visual */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                {renderField('Nombre Evaluador', details.nombreevaluador)}
                {renderField('Denominación Cargo', details.denominacionCargo)}

                {/* Este ocupará su espacio en la segunda fila, primera columna */}
                {renderField('Nombre Unidad', details.nombreUnidad)}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
            <p className="text-sm">No se encontró información disponible.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
