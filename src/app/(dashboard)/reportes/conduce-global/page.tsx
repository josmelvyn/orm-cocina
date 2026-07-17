// src/app/(dashboard)/reportes/conduce-global/page.tsx
import { prisma } from '@/lib/prisma'
import { reporteConduceGlobal } from '@/services/reportes.service'
import { ReporteFiltros } from '@/components/reportes/reporte-filtros'
import { ReporteAcciones } from '@/components/reportes/reporte-acciones'

function formatoRD(v: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v)
}

export default async function ConduceGlobalPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; institucionId?: string }>
}) {
  const { desde, hasta, institucionId } = await searchParams

  const [reporte, instituciones] = await Promise.all([
    reporteConduceGlobal({ desde, hasta, institucionId }),
    prisma.institucion.findMany({ orderBy: { nombre: 'asc' } }),
  ])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Conduce global</h1>
          <p className="text-sm text-slate-500">Totales consolidados de todos los centros en el período</p>
        </div>
        <ReporteAcciones
          datosExportables={reporte.porTipoServicio}
          nombreArchivo="conduce-global"
        />
      </div>

      <ReporteFiltros instituciones={instituciones} />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total de conduces</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{reporte.totalConduces}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total de raciones</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{reporte.totalRaciones}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-700">Monto total</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">{formatoRD(reporte.totalMonto)}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
            Por tipo de servicio
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Servicio</th>
                <th className="px-4 py-2 text-right font-medium">Conduces</th>
                <th className="px-4 py-2 text-right font-medium">Raciones</th>
                <th className="px-4 py-2 text-right font-medium">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reporte.porTipoServicio.map((r) => (
                <tr key={r.tipo}>
                  <td className="px-4 py-2 font-medium text-slate-900">{r.tipo}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{r.conduces}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{r.raciones}</td>
                  <td className="px-4 py-2 text-right text-slate-900">{formatoRD(r.monto)}</td>
                </tr>
              ))}
              {reporte.porTipoServicio.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Sin datos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
            Por estado
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 text-right font-medium">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reporte.porEstado.map((r) => (
                <tr key={r.estado}>
                  <td className="px-4 py-2 font-medium text-slate-900">{r.estado}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{r.cantidad}</td>
                </tr>
              ))}
              {reporte.porEstado.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-slate-400">
                    Sin datos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}