// src/app/(dashboard)/contabilidad/page.tsx
import Link from 'next/link'
import { TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { reporteEstadoResultados } from '@/services/contabilidad.service'
import { ReporteFiltros } from '@/components/reportes/reporte-filtros'
import { Button } from '@/components/ui/button'

function formatoRD(v: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v)
}

export default async function ContabilidadPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>
}) {
  const { desde, hasta } = await searchParams
  const reporte = await reporteEstadoResultados({ desde, hasta })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Contabilidad</h1>
          <p className="text-sm text-slate-500">Estado de resultados del período</p>
        </div>
        <div className="flex gap-2">
          <Link href="/contabilidad/ingresos">
            <Button variant="outline">Ver ingresos</Button>
          </Link>
          <Link href="/contabilidad/gastos">
            <Button variant="outline">Ver gastos</Button>
          </Link>
        </div>
      </div>

      <ReporteFiltros />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-emerald-700">Ingresos</p>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">{formatoRD(reporte.totalIngresos)}</p>
          <p className="mt-1 text-xs text-emerald-600">{reporte.cantidadIngresos} movimiento(s)</p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">Gastos</p>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-red-700">{formatoRD(reporte.totalGastos)}</p>
          <p className="mt-1 text-xs text-red-600">{reporte.cantidadGastos} movimiento(s)</p>
        </div>

        <div
          className={`rounded-xl border p-5 ${reporte.neto >= 0 ? 'border-blue-200 bg-blue-50' : 'border-amber-200 bg-amber-50'}`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-sm ${reporte.neto >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
              Resultado neto
            </p>
            <Scale className={`h-4 w-4 ${reporte.neto >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
          </div>
          <p
            className={`mt-2 text-2xl font-semibold ${reporte.neto >= 0 ? 'text-blue-700' : 'text-amber-700'}`}
          >
            {formatoRD(reporte.neto)}
          </p>
          <p className={`mt-1 text-xs ${reporte.neto >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
            {reporte.neto >= 0 ? 'Superávit' : 'Déficit'}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
          Gastos por categoría
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            {reporte.gastosPorCategoria.map((g) => {
              const porcentaje = reporte.totalGastos > 0 ? (g.monto / reporte.totalGastos) * 100 : 0
              return (
                <tr key={g.categoria}>
                  <td className="w-1/3 px-4 py-2.5 font-medium text-slate-900">{g.categoria}</td>
                  <td className="px-4 py-2.5">
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-red-400"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </td>
                  <td className="w-32 px-4 py-2.5 text-right text-slate-500">{formatoRD(g.monto)}</td>
                </tr>
              )
            })}
            {reporte.gastosPorCategoria.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  No hay gastos registrados en este período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}