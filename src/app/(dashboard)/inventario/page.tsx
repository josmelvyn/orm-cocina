// src/app/(dashboard)/inventario/page.tsx
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { listarInsumos } from '@/services/inventario.service'
import { Button } from '@/components/ui/button'
import { InsumoTable } from '@/components/inventario/insumo-table'

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string; q?: string }>
}) {
  const { filtro, q } = await searchParams

  const insumosRaw = await listarInsumos({
    soloStockBajo: filtro === 'stock-bajo',
    busqueda: q,
  })

  // Los campos Decimal de Prisma no son serializables al cruzar a un
  // client component; los convertimos a number explícitamente aquí.
  const insumos = insumosRaw.map((i) => ({
    ...i,
    stockActual: Number(i.stockActual),
    stockMinimo: Number(i.stockMinimo),
    costoUnitario: Number(i.costoUnitario),
  }))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Inventario</h1>
          <p className="text-sm text-slate-500">
            {insumos.length} insumo(s) {filtro === 'stock-bajo' && 'con stock bajo'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/inventario/movimientos">
            <Button variant="outline">Ver movimientos</Button>
          </Link>
          <Link href="/inventario/categorias">
            <Button variant="outline">Nueva Categoria</Button>
          </Link>
          <Link href="/inventario/nuevo">
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Nuevo insumo
            </Button>
          </Link>
        </div>
      </div>

      <InsumoTable insumos={insumos} />
    </div>
  )
}