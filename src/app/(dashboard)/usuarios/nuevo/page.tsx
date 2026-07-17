// src/app/(dashboard)/usuarios/nuevo/page.tsx
import { prisma } from '@/lib/prisma'
import { UsuarioForm } from '@/components/usuarios/usuario-form'

export default async function NuevoUsuarioPage() {
  const roles = await prisma.rol.findMany({ orderBy: { nombre: 'asc' } })

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Nuevo usuario</h1>
      <UsuarioForm roles={roles} />
    </div>
  )
}