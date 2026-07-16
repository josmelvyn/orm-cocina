// src/app/(dashboard)/inventario/movimientos/page.tsx
import { listarMovimientos, listarInsumos } from '@/services/inventario.service'
import { MovimientoForm } from '@/components/inventario/movimiento-form'
import { MovimientoTable } from '@/components/inventario/movimiento-table'

export default async function MovimientosPage() {
  const [movimientos, insumosRaw] = await Promise.all([
    listarMovimientos({ limite: 100 }),
    listarInsumos(),
  ])

  // Solo mandamos al client component los campos planos que necesita el <select>.
  const insumos = insumosRaw.map((i) => ({
    id: i.id,
    codigo: i.codigo,
    nombre: i.nombre,
    unidadMedida: i.unidadMedida,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Movimientos de inventario</h1>
        <p className="text-sm text-slate-500">Registra entradas, salidas, ajustes y mermas</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MovimientoForm insumos={insumos} />
        </div>
        <div className="lg:col-span-2">
          <MovimientoTable movimientos={movimientos} />
        </div>
      </div>
    </div>
  )
}