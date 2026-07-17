// src/app/(dashboard)/reportes/facturas/page.tsx
import { prisma } from '@/lib/prisma'
import { reporteFacturas } from '@/services/reportes.service'
import { ReporteFiltros } from '@/components/reportes/reporte-filtros'
import { ReporteAcciones } from '@/components/reportes/reporte-acciones'
import { cn } from '@/lib/utils'

const ESTILO_ESTADO: Record<string, string> = {
  EMITIDA: 'bg-blue-50 text-blue-700',
  PAGADA: 'bg-emerald-50 text-emerald-700',
  ANULADA: 'bg-red-50 text-red-700',
}

function formatoRD(v: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v)
}

export default async function ReporteFacturasPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; institucionId?: string; estado?: string }>
}) {
  const { desde, hasta, institucionId, estado } = await searchParams

  const [reporte, instituciones] = await Promise.all([
    reporteFacturas({ desde, hasta, institucionId, estado }),
    prisma.institucion.findMany({ orderBy: { nombre: 'asc' } }),
  ])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Reporte de facturas</h1>
          <p className="text-sm text-slate-500">{reporte.detalle.length} factura(s) en el período</p>
        </div>
        <ReporteAcciones datosExportables={reporte.detalle} nombreArchivo="reporte-facturas" />
      </div>

      <ReporteFiltros
        instituciones={instituciones}
        mostrarEstado
        opcionesEstado={['EMITIDA', 'PAGADA', 'ANULADA']}
      />

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">No. Factura</th>
              <th className="px-4 py-3 font-medium">NCF</th>
              <th className="px-4 py-3 font-medium">Institución</th>
              <th className="px-4 py-3 font-medium">Fecha emisión</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Conduces</th>
              <th className="px-4 py-3 text-right font-medium">Subtotal</th>
              <th className="px-4 py-3 text-right font-medium">ITBIS</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reporte.detalle.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{f.numeroFactura}</td>
                <td className="px-4 py-3 text-slate-500">{f.ncf}</td>
                <td className="px-4 py-3 text-slate-700">{f.institucion}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {new Date(f.fechaEmision).toLocaleDateString('es-DO')}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ESTILO_ESTADO[f.estado])}>
                    {f.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-500">{f.cantidadConduces}</td>
                <td className="px-4 py-3 text-right text-slate-500">{formatoRD(f.subtotal)}</td>
                <td className="px-4 py-3 text-right text-slate-500">{formatoRD(f.itbis)}</td>
                <td className="px-4 py-3 text-right text-slate-900">{formatoRD(f.total)}</td>
              </tr>
            ))}
          </tbody>
          {reporte.detalle.length > 0 && (
            <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-slate-900">
              <tr>
                <td colSpan={8} className="px-4 py-3 text-right">
                  Gran total (excluye anuladas)
                </td>
                <td className="px-4 py-3 text-right">{formatoRD(reporte.granTotal)}</td>
              </tr>
            </tfoot>
          )}
        </table>
        {reporte.detalle.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-500">No hay resultados con estos filtros.</p>
        )}
      </div>
    </div>
  )
}