// src/app/(dashboard)/conduces/nuevo/page.tsx
import { prisma } from '@/lib/prisma'
import { listarRecetas } from '@/services/recetas.service'
import { ConduceForm } from '@/components/conduces/conduce-form'

export default async function NuevoConducePage() {
  const [escuelas, recetasRaw] = await Promise.all([
    prisma.escuela.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
    listarRecetas(),
  ])

  const recetas = recetasRaw.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    tipoServicio: r.tipoServicio,
    precioPorcion: Number(r.precioPorcion),
  }))

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Nuevo conduce</h1>
      <ConduceForm escuelas={escuelas} recetas={recetas} />
    </div>
  )
}