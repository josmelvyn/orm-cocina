// src/app/(dashboard)/recetas/nueva/page.tsx
import { listarInsumos } from '@/services/inventario.service'
import { RecetaForm } from '@/components/recetas/receta-form'

export default async function NuevaRecetaPage() {
  const insumosRaw = await listarInsumos()

  const insumos = insumosRaw.map((i) => ({
    id: i.id,
    nombre: i.nombre,
    unidadMedida: i.unidadMedida,
    costoUnitario: Number(i.costoUnitario),
  }))

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Nueva receta</h1>
      <RecetaForm insumos={insumos} />
    </div>
  )
}