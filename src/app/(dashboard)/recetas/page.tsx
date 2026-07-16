// src/app/(dashboard)/recetas/page.tsx
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { listarRecetas } from '@/services/recetas.service'
import { Button } from '@/components/ui/button'
import { RecetaTable } from '@/components/recetas/receta-table'

export default async function RecetasPage({
  searchParams,
}: {
  searchParams: Promise<{ tipoServicio?: string; q?: string }>
}) {
  const { tipoServicio, q } = await searchParams

  const recetasRaw = await listarRecetas({ tipoServicio, busqueda: q })

  const recetas = recetasRaw.map((r) => ({
    ...r,
    costoPorcion: r.costoPorcion ? Number(r.costoPorcion) : null,
    precioPorcion: Number(r.precioPorcion),
  }))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Maestro de recetas</h1>
          <p className="text-sm text-slate-500">{recetas.length} receta(s) activa(s)</p>
        </div>
        <Link href="/recetas/nueva">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva receta
          </Button>
        </Link>
      </div>

      <RecetaTable recetas={recetas} />
    </div>
  )
}