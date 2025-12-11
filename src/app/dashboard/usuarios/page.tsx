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
import { FaEye } from "react-icons/fa"
import { MdDelete } from "react-icons/md"

// Importamos los componentes de paginación
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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

// 1. GENERAMOS 30 USUARIOS DE PRUEBA PARA PROBAR LA PAGINACIÓN
const initialUsers: User[] = Array.from({ length: 30 }, (_, i) => ({
  id: `U-${i + 1}`,
  firstName: ["Ana", "Carlos", "María", "Pedro", "Luisa", "Jorge", "Sofía", "Andrés", "Laura", "Fernando"][i % 10],
  lastName: ["García", "López", "Rodriguez", "Pérez", "Fernández", "Ramírez", "Méndez", "Castillo", "Herrera", "Vargas"][i % 10],
  email: `usuario.${i + 1}@universitas.com`,
  isPro: i % 3 === 0, // Alternamos roles
}))

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  
  // ESTADOS PARA LA PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // CÁLCULOS MATEMÁTICOS PARA CORTAR LA LISTA
  const totalPages = Math.ceil(users.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = users.slice(startIndex, endIndex)

  const toggleRole = (id: string) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, isPro: !user.isPro } : user
    ))
  }

  const handleDelete = (id: string) => {
    console.log("Borrando usuario:", id)
  }

  // Función para cambiar de página y evitar desbordes
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
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>
          <p className="text-muted-foreground text-lg">
             Mostrando {startIndex + 1}-{Math.min(endIndex, users.length)} de {users.length} usuarios.
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-2 my-4">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre o email..."
              className="pl-10 py-6 text-lg"
            />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-lg py-4 pl-6">Nombre</TableHead>
              <TableHead className="text-lg py-4">Apellido</TableHead>
              <TableHead className="text-lg py-4">Email</TableHead>
              <TableHead className="text-lg py-4 text-center">Rol / Plan</TableHead>
              <TableHead className="text-lg py-4 text-center pr-6">Opciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/30 text-base">
                <TableCell className="font-medium py-4 pl-6">{user.firstName}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Componente de Paginación */}
      <div className="py-4">
        <Pagination>
          <PaginationContent>
            
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {/* Generamos los números de página dinámicamente */}
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

    </div>
  )
}