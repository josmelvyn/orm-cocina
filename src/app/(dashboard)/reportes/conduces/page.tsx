// src/app/(dashboard)/reportes/conduces/page.tsx
import { prisma } from '@/lib/prisma'
import { reporteConduces } from '@/services/reportes.service'
import { ReporteFiltros } from '@/components/reportes/reporte-filtros'
import { ReporteAcciones } from '@/components/reportes/reporte-acciones'

function formatoRD(v: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v)
}

export default async function ReporteConducesPage({
  searchParams,
}: {
  searchParams: Promise<{
    desde?: string
    hasta?: string
    escuelaId?: string
    institucionId?: string
    estado?: string
  }>
}) {
  const { desde, hasta, escuelaId, institucionId, estado } = await searchParams

  const [conduces, instituciones, escuelas] = await Promise.all([
    reporteConduces({ desde, hasta, escuelaId, institucionId, estado }),
    prisma.institucion.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.escuela.findMany({ orderBy: { nombre: 'asc' } }),
  ])

  const totalRaciones = conduces.reduce((a, c) => a + c.totalRaciones, 0)
  const totalMonto = conduces.reduce((a, c) => a + c.totalMonto, 0)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Reporte de conduces</h1>
          <p className="text-sm text-slate-500">{conduces.length} conduce(s) encontrado(s)</p>
        </div>
        <ReporteAcciones datosExportables={conduces} nombreArchivo="reporte-conduces" />
      </div>

      <ReporteFiltros
        instituciones={instituciones}
        escuelas={escuelas}
        mostrarEstado
        opcionesEstado={['EMITIDO', 'FACTURADO', 'ANULADO']}
      />

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Número</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Escuela</th>
              <th className="px-4 py-3 font-medium">Institución</th>
              <th className="px-4 py-3 font-medium">Servicio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Raciones</th>
              <th className="px-4 py-3 text-right font-medium">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {conduces.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{c.numero}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {new Date(c.fecha).toLocaleDateString('es-DO')}
                </td>
                <td className="px-4 py-3 text-slate-700">{c.escuela}</td>
                <td className="px-4 py-3 text-slate-500">{c.institucion}</td>
                <td className="px-4 py-3 text-slate-500">{c.tipoServicio}</td>
                <td className="px-4 py-3 text-slate-500">{c.estado}</td>
                <td className="px-4 py-3 text-right text-slate-500">{c.totalRaciones}</td>
                <td className="px-4 py-3 text-right text-slate-900">{formatoRD(c.totalMonto)}</td>
              </tr>
            ))}
          </tbody>
          {conduces.length > 0 && (
            <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
              <tr>
                <td colSpan={6} className="px-4 py-3 text-right">
                  Totales
                </td>
                <td className="px-4 py-3 text-right">{totalRaciones}</td>
                <td className="px-4 py-3 text-right">{formatoRD(totalMonto)}</td>
              </tr>
            </tfoot>
          )}
        </table>
        {conduces.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-500">No hay resultados con estos filtros.</p>
        )}
      </div>
    </div>
  )
}