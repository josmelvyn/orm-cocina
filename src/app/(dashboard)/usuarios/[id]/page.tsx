// src/app/(dashboard)/usuarios/[id]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { obtenerUsuario } from '@/services/usuarios.service'
import { UsuarioForm } from '@/components/usuarios/usuario-form'

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [usuario, roles] = await Promise.all([
    obtenerUsuario(id).catch(() => null),
    prisma.rol.findMany({ orderBy: { nombre: 'asc' } }),
  ])

  if (!usuario) notFound()

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Editar usuario</h1>
      <UsuarioForm roles={roles} usuario={usuario} />
    </div>
  )
}