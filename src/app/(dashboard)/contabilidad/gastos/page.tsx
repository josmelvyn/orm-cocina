// src/app/(dashboard)/contabilidad/gastos/page.tsx
import { listarGastos, listarCategoriasGasto } from '@/services/contabilidad.service'
import { GastoForm } from '@/components/contabilidad/gasto-form'
import { GastoTable } from '@/components/contabilidad/gasto-table'

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; categoriaId?: string }>
}) {
  const { desde, hasta, categoriaId } = await searchParams

  const [gastosRaw, categorias] = await Promise.all([
    listarGastos({ desde, hasta, categoriaId }),
    listarCategoriasGasto(),
  ])

  const gastos = gastosRaw.map((g) => ({
    id: g.id,
    fecha: g.fecha,
    categoria: g.categoria.nombre,
    descripcion: g.descripcion,
    monto: Number(g.monto),
    metodoPago: g.metodoPago,
    comprobante: g.comprobante,
    creadoPor: g.creadoPor.nombre,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Gastos</h1>
        <p className="text-sm text-slate-500">{gastos.length} gasto(s) registrado(s)</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <GastoForm categorias={categorias} />
        </div>
        <div className="lg:col-span-2">
          <GastoTable gastos={gastos} />
        </div>
      </div>
    </div>
  )
}