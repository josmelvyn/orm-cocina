// src/app/(dashboard)/recetas/[id]/page.tsx
import { notFound } from 'next/navigation'
import { obtenerReceta } from '@/services/recetas.service'
import { listarInsumos } from '@/services/inventario.service'
import { RecetaForm } from '@/components/recetas/receta-form'
import { EliminarRecetaButton } from '@/components/recetas/eliminar-receta-button'

export default async function EditarRecetaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [recetaRaw, insumosRaw] = await Promise.all([
    obtenerReceta(id).catch(() => null),
    listarInsumos(),
  ])

  if (!recetaRaw) notFound()

  const insumos = insumosRaw.map((i) => ({
    id: i.id,
    nombre: i.nombre,
    unidadMedida: i.unidadMedida,
    costoUnitario: Number(i.costoUnitario),
  }))

  const receta = {
    id: recetaRaw.id,
    codigo: recetaRaw.codigo,
    nombre: recetaRaw.nombre,
    tipoServicio: recetaRaw.tipoServicio,
    porcionesBase: recetaRaw.porcionesBase,
    precioPorcion: Number(recetaRaw.precioPorcion),
    ingredientes: recetaRaw.ingredientes.map((ing) => ({
      insumoId: ing.insumoId,
      cantidad: Number(ing.cantidad),
    })),
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Editar receta</h1>
        <EliminarRecetaButton id={receta.id} nombre={receta.nombre} />
      </div>
      <RecetaForm insumos={insumos} receta={receta} />
    </div>
  )
}