// src/app/(dashboard)/escuelas/nueva/page.tsx
import { prisma } from '@/lib/prisma'
import { EscuelaForm } from '@/components/escuelas/escuela-form'

export default async function NuevaEscuelaPage() {
  const instituciones = await prisma.institucion.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
  })

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Nueva escuela</h1>
      <EscuelaForm instituciones={instituciones} />
    </div>
  )
}