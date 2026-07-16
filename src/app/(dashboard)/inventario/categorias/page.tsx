// src/app/(dashboard)/inventario/categorias/page.tsx
import { listarCategoriasConConteo } from '@/services/inventario.service'
import { CategoriaManager } from '@/components/inventario/categoria-manager'

export default async function CategoriasPage() {
  const categoriasRaw = await listarCategoriasConConteo()

  const categorias = categoriasRaw.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    totalInsumos: c._count.insumos,
  }))

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Categorías de insumo</h1>
        <p className="text-sm text-slate-500">Organiza los insumos por tipo (víveres, cárnicos, etc.)</p>
      </div>

      <CategoriaManager categorias={categorias} />
    </div>
  )
}