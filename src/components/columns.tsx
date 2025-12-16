"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User, UserRole } from "@/types/user" // Asegúrate de tener tus tipos aquí
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ShieldCheck, CreditCard, Copy } from "lucide-react"
import { toast } from "sonner"
import { adminService } from "@/services/adminService"

// Componente auxiliar para las Acciones (para mantener limpio el código)
const ActionCell = ({ user }: { user: User }) => {
  
  const handleRoleChange = async (newRole: UserRole) => {
    try {
      await adminService.updateUserRole(user.id, newRole)
      toast.success(`Rol actualizado a ${newRole}`)
      window.location.reload() // Recarga simple para actualizar la vista
    } catch (error) {
      toast.error("Error al actualizar rol")
    }
  }

  const handleUpgradePro = async () => {
    try {
      await adminService.upgradeUserToPro(user.id)
      toast.success("Usuario ascendido a PRO correctamente")
      window.location.reload()
    } catch (error) {
      toast.error("Error al actualizar usuario")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => {
            navigator.clipboard.writeText(user.email)
            toast.success("Email copiado")
        }}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar Email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {user.role === 'USER' && (
          <DropdownMenuItem onClick={handleUpgradePro}>
            <CreditCard className="mr-2 h-4 w-4" />
            Ascender a PRO
          </DropdownMenuItem>
        )}

        <DropdownMenuLabel>Cambiar Rol</DropdownMenuLabel>
        <DropdownMenuItem 
          disabled={user.role === 'ADMIN'}
          onClick={() => handleRoleChange('ADMIN')}
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          Hacer Admin
        </DropdownMenuItem>
        <DropdownMenuItem 
           disabled={user.role === 'USER'}
           onClick={() => handleRoleChange('USER')}
        >
           Degradar a Usuario
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Definición de las columnas
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Usuario",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium">{user.nombre} {user.apellido}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole
      switch (role) {
        case 'ADMIN':
          return <Badge variant="destructive">Admin</Badge>
        case 'PAID_USER':
          return <Badge className="bg-blue-600 hover:bg-blue-700">Pro</Badge>
        default:
          return <Badge variant="secondary">Gratis</Badge>
      }
    },
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive")
      return isActive ? (
        <span className="text-green-600 text-sm font-medium">Activo</span>
      ) : (
        <span className="text-red-500 text-sm font-medium">Inactivo</span>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Registro",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div className="text-sm text-muted-foreground">{date.toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell user={row.original} />,
  },
]