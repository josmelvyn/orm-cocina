// src/app/(dashboard)/inventario/nuevo/page.tsx
import { listarCategorias } from '@/services/inventario.service'
import { InsumoForm } from '@/components/inventario/insumo-form'

export default async function NuevoInsumoPage() {
  const categorias = await listarCategorias()

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Nuevo insumo</h1>
      <InsumoForm categorias={categorias} />
    </div>
  )
}