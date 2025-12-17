"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { FaEye } from "react-icons/fa"
import { MdDelete } from "react-icons/md"
import { FaTrashCan } from "react-icons/fa6"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// 1. TIPOS
type Acta = {
  id: string
  numeroActa: string
  nombreOrgano: string
  rif: string
  tipoActa: string
  estatus: "Creada" | "En Revisión" | "Finalizada" | "Anulada"
  lapsos: string
  moratoria: string
}

// 2. DATOS DE PRUEBA (MOCK DATA)
const initialActas: Acta[] = Array.from({ length: 30 }, (_, i) => {
  const estatusOptions: Acta['estatus'][] = ["Creada", "En Revisión", "Finalizada", "Anulada"]
  const tiposOptions = ["Entrega", "Recepción", "Auditoría", "Supervisión"]
  const organosOptions = ["Dirección de Finanzas", "Recursos Humanos", "Consultoría Jurídica", "Despacho del Alcalde", "Ingeniería Municipal"]
  
  // CORRECCIÓN: Eliminamos Math.random() y usamos una fórmula basada en el índice 'i'
  // Esto asegura que el valor sea IDÉNTICO en el servidor y en el cliente.
  const diasMora = i % 5 === 0 ? (i % 20) + 1 : 0
  
  return {
    id: `ACT-${2025000 + i}`,
    numeroActa: `AE-${2025}-${(i + 1).toString().padStart(4, '0')}`,
    nombreOrgano: organosOptions[i % organosOptions.length],
    rif: `G-2000${(i + 100).toString()}-1`,
    tipoActa: tiposOptions[i % tiposOptions.length],
    estatus: estatusOptions[i % estatusOptions.length],
    lapsos: "120 días hábiles",
    moratoria: diasMora > 0 ? `${diasMora} días` : "Al día",
  }
})

export default function ActasCreadasPage() {
  const [actas, setActas] = useState<Acta[]>(initialActas)
  const [searchTerm, setSearchTerm] = useState("") // Estado para el buscador
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  
  const itemsPerPage = 10

  // -- LÓGICA DE FILTRADO --
  // Filtramos la lista COMPLETA basándonos en el término de búsqueda
  const filteredActas = actas.filter((acta) => 
    acta.numeroActa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acta.nombreOrgano.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acta.rif.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // -- LÓGICA DE PAGINACIÓN (Basada en los resultados FILTRADOS) --
  const totalPages = Math.ceil(filteredActas.length / itemsPerPage)
  
  // Aseguramos que si filtramos y la pagina actual excede el total, no rompa
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentActas = filteredActas.slice(startIndex, endIndex)

  // -- SELECCIÓN --
  const isAllSelected = currentActas.length > 0 && currentActas.every((acta) => selectedRows.includes(acta.id))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = [...new Set([...selectedRows, ...currentActas.map(a => a.id)])]
      setSelectedRows(newSelected)
    } else {
      const currentIds = currentActas.map(a => a.id)
      setSelectedRows(selectedRows.filter(id => !currentIds.includes(id)))
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id])
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id))
    }
  }

  // -- ACCIONES --
  const handleDelete = (id: string) => {
    setActas(actas.filter(a => a.id !== id))
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id))
    }
  }

  const handleBulkDelete = () => {
    setActas(actas.filter(a => !selectedRows.includes(a.id)))
    setSelectedRows([])
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getBadgeVariant = (estatus: string) => {
    switch (estatus) {
      case "Finalizada": return "default"
      case "En Revisión": return "secondary"
      case "Creada": return "outline"
      case "Anulada": return "destructive"
      default: return "default"
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Actas elaboradas</h2>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-lg">
               Mostrando {currentActas.length} de {filteredActas.length} resultados (Total: {actas.length}).
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 my-4">
        
        {/* BUSCADOR FUNCIONAL */}
        <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por número, órgano o RIF..."
              className="pl-10 py-6 text-lg"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Regresamos a la página 1 al buscar
              }}
            />
        </div>

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

      <div className="rounded-lg border shadow-sm bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50px] pl-6">
                <Checkbox 
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
              </TableHead>
              <TableHead className="text-lg py-4 whitespace-nowrap">Número de Acta</TableHead>
              <TableHead className="text-lg py-4 whitespace-nowrap">Nombre del Órgano</TableHead>
              <TableHead className="text-lg py-4 whitespace-nowrap">RIF</TableHead>
              <TableHead className="text-lg py-4 whitespace-nowrap">Tipo de Acta</TableHead>
              <TableHead className="text-lg py-4 whitespace-nowrap">Estatus</TableHead>
              <TableHead className="text-lg py-4 whitespace-nowrap">Lapsos</TableHead>
              <TableHead className="text-lg py-4 whitespace-nowrap">Moratoria</TableHead>
              <TableHead className="text-lg py-4 text-center pr-6 whitespace-nowrap">Opciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentActas.length > 0 ? (
              currentActas.map((acta) => {
                const isSelected = selectedRows.includes(acta.id)
                return (
                  <TableRow 
                    key={acta.id} 
                    className={`text-base transition-colors ${isSelected ? "bg-blue-50/50 hover:bg-blue-50/70" : "hover:bg-muted/30"}`}
                  >
                    <TableCell className="pl-6 py-4">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(acta.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium py-4 whitespace-nowrap">{acta.numeroActa}</TableCell>
                    <TableCell className="py-4 text-muted-foreground whitespace-nowrap">{acta.nombreOrgano}</TableCell>
                    <TableCell className="py-4 font-mono text-sm whitespace-nowrap">{acta.rif}</TableCell>
                    <TableCell className="py-4 whitespace-nowrap">{acta.tipoActa}</TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      <Badge variant={getBadgeVariant(acta.estatus)} className="text-sm px-3 py-1">
                        {acta.estatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-muted-foreground whitespace-nowrap">{acta.lapsos}</TableCell>
                    <TableCell className={`py-4 font-medium whitespace-nowrap ${acta.moratoria === "Al día" ? "text-green-600" : "text-red-600"}`}>
                      {acta.moratoria}
                    </TableCell>
                    <TableCell className="py-4 pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
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
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No se encontraron resultados para &quot;{searchTerm}&quot;
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 0 && (
          <div className="py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink 
                      href="#" 
                      isActive={currentPage === index + 1}
                      onClick={(e) => { e.preventDefault(); handlePageChange(index + 1); }}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}