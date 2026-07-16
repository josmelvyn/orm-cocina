// src/app/(dashboard)/inventario/[id]/page.tsx
import { notFound } from 'next/navigation'
import { obtenerInsumo, listarCategorias } from '@/services/inventario.service'
import { InsumoForm } from '@/components/inventario/insumo-form'
import { EliminarInsumoButton } from '@/components/inventario/eliminar-insumo-button'

export default async function EditarInsumoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [insumo, categorias] = await Promise.all([
    obtenerInsumo(id).catch(() => null),
    listarCategorias(),
  ])

  if (!insumo) notFound()

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Editar insumo</h1>
          <p className="text-sm text-slate-500">
            Stock actual: {String(insumo.stockActual)} {insumo.unidadMedida}
          </p>
        </div>
        <EliminarInsumoButton id={insumo.id} nombre={insumo.nombre} />
      </div>

      <InsumoForm
        categorias={categorias}
        insumo={{
          id: insumo.id,
          codigo: insumo.codigo,
          nombre: insumo.nombre,
          categoriaId: insumo.categoriaId,
          unidadMedida: insumo.unidadMedida,
          stockMinimo: Number(insumo.stockMinimo),
          costoUnitario: Number(insumo.costoUnitario),
        }}
      />

      <p className="mt-3 text-xs text-slate-400">
        Para modificar el stock actual, usa{' '}
        <a href="/inventario/movimientos" className="underline">
          registrar un movimiento
        </a>
        , no la edición directa del insumo.
      </p>
    </div>
  )
}