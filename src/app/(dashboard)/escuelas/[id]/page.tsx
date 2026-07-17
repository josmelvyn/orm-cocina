// src/app/(dashboard)/escuelas/[id]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { obtenerEscuela } from '@/services/escuelas.service'
import { EscuelaForm } from '@/components/escuelas/escuela-form'
import { EliminarEscuelaButton } from '@/components/escuelas/eliminar-escuela-button'

export default async function EditarEscuelaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [escuela, instituciones] = await Promise.all([
    obtenerEscuela(id).catch(() => null),
    prisma.institucion.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
  ])

  if (!escuela) notFound()

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Editar escuela</h1>
        <EliminarEscuelaButton id={escuela.id} nombre={escuela.nombre} />
      </div>

      <EscuelaForm instituciones={instituciones} escuela={escuela} />
    </div>
  )
}