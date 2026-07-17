// src/app/(dashboard)/contabilidad/ingresos/page.tsx
import { listarIngresos } from '@/services/contabilidad.service'
import { IngresoForm } from '@/components/contabilidad/ingreso-form'
import { IngresoTable } from '@/components/contabilidad/ingreso-table'

export default async function IngresosPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>
}) {
  const { desde, hasta } = await searchParams
  const ingresosRaw = await listarIngresos({ desde, hasta })

  const ingresos = ingresosRaw.map((i) => ({
    id: i.id,
    fecha: i.fecha,
    concepto: i.concepto,
    monto: Number(i.monto),
    origen: i.origen,
    numeroFactura: i.factura?.numeroFactura ?? null,
    creadoPor: i.creadoPor.nombre,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Ingresos</h1>
        <p className="text-sm text-slate-500">
          {ingresos.length} ingreso(s) — los de origen "Factura" se generan automáticamente al marcar
          una factura como pagada
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <IngresoForm />
        </div>
        <div className="lg:col-span-2">
          <IngresoTable ingresos={ingresos} />
        </div>
      </div>
    </div>
  )
}