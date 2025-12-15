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
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
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

type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  isPro: boolean
}

// 30 USUARIOS DE PRUEBA
const initialUsers: User[] = Array.from({ length: 30 }, (_, i) => ({
  id: `U-${i + 1}`,
  firstName: ["Ana", "Carlos", "María", "Pedro", "Luisa", "Jorge", "Sofía", "Andrés", "Laura", "Fernando"][i % 10],
  lastName: ["García", "López", "Rodriguez", "Pérez", "Fernández", "Ramírez", "Méndez", "Castillo", "Herrera", "Vargas"][i % 10],
  email: `usuario.${i + 1}@universitas.com`,
  isPro: i % 3 === 0,
}))

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState("") // Estado del buscador
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  
  const itemsPerPage = 10

  // -- LÓGICA DE FILTRADO --
  const filteredUsers = users.filter((user) => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // -- LÓGICA DE PAGINACIÓN (Sobre los resultados filtrados) --
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  // -- LÓGICA DE SELECCIÓN --
  const isAllSelected = currentUsers.length > 0 && currentUsers.every((user) => selectedRows.includes(user.id))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = [...new Set([...selectedRows, ...currentUsers.map(u => u.id)])]
      setSelectedRows(newSelected)
    } else {
      const currentIds = currentUsers.map(u => u.id)
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

  // -- ACCIONES MASIVAS --
  const handleBulkRoleChange = (isPro: boolean) => {
    setUsers(users.map(user => 
      selectedRows.includes(user.id) ? { ...user, isPro } : user
    ))
  }

  const handleBulkDelete = () => {
    setUsers(users.filter(user => !selectedRows.includes(user.id)))
    setSelectedRows([])
  }

  // -- OTRAS FUNCIONES --
  const toggleRole = (id: string) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, isPro: !user.isPro } : user
    ))
  }

  const handleDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id))
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id))
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Panel de usuarios</h2>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-lg">
               Mostrando {currentUsers.length} de {filteredUsers.length} resultados (Total: {users.length}).
            </p>
          </div>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 my-4">
        
        {/* BUSCADOR FUNCIONAL */}
        <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre o email..."
              className="pl-10 py-6 text-lg"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset a pág 1 al buscar
              }}
            />
        </div>

        {/* Acciones Masivas */}
        {selectedRows.length > 0 && (
          <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-5">
            <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              {selectedRows.length} seleccionados
            </span>
            <div className="h-8 w-[1px] bg-border" />
            
            {/* Switch Masivo */}
            <div className="flex items-center gap-3 bg-card border rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm font-medium text-muted-foreground">Cambiar selección a:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">Express</span>
                <Switch
                  onCheckedChange={(checked) => handleBulkRoleChange(checked)}
                />
                <span className="text-sm font-bold text-blue-600">Pro</span>
              </div>
            </div>

            {/* Eliminar Masivo */}
            <Button 
              variant="destructive" 
              size="icon"
              className="h-10 w-10 shadow-sm"
              onClick={handleBulkDelete}
              title="Eliminar usuarios seleccionados"
            >
              <FaTrashCan className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* TABLA */}
      <div className="rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50px] pl-6">
                <Checkbox 
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
              </TableHead>
              <TableHead className="text-lg py-4">Nombre</TableHead>
              <TableHead className="text-lg py-4">Apellido</TableHead>
              <TableHead className="text-lg py-4">Email</TableHead>
              <TableHead className="text-lg py-4 text-center">Rol / Plan</TableHead>
              <TableHead className="text-lg py-4 text-center pr-6">Opciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => {
                const isSelected = selectedRows.includes(user.id)
                return (
                  <TableRow 
                    key={user.id} 
                    className={`text-base transition-colors ${isSelected ? "bg-blue-50/50 hover:bg-blue-50/70" : "hover:bg-muted/30"}`}
                  >
                    <TableCell className="pl-6 py-4">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(user.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium py-4">{user.firstName}</TableCell>
                    <TableCell className="font-medium py-4">{user.lastName}</TableCell>
                    <TableCell className="py-4 text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center gap-4">
                        <span className={`text-base ${!user.isPro ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                          Express
                        </span>
                        <Switch
                          checked={user.isPro}
                          onCheckedChange={() => toggleRole(user.id)}
                        />
                        <span className={`text-base ${user.isPro ? "font-bold text-blue-600" : "text-muted-foreground"}`}>
                          Pro
                        </span>
                      </div>
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
                          onClick={() => handleDelete(user.id)}
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
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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