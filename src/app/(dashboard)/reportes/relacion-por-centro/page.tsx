// src/app/(dashboard)/reportes/relacion-por-centro/page.tsx
import { prisma } from '@/lib/prisma'
import { reporteRelacionPorCentro } from '@/services/reportes.service'
import { obtenerEmpresa } from '@/services/empresa.service'
import { ReporteFiltros } from '@/components/reportes/reporte-filtros'
import { ReporteAcciones } from '@/components/reportes/reporte-acciones'
import { DescargarPdfButton } from '@/components/shared/descargar-pdf-button'

export default async function RelacionPorCentroPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; institucionId?: string; escuelaId?: string }>
}) {
  const { desde, hasta, institucionId, escuelaId } = await searchParams

  const [reporte, empresa, escuelas, instituciones] = await Promise.all([
    reporteRelacionPorCentro({ desde, hasta, institucionId, escuelaId }),
    obtenerEmpresa(),
    prisma.escuela.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
    prisma.institucion.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
  ])

  const datosExportables = reporte.grupos.flatMap((g) =>
    g.conduces.map((c) => ({
      fecha: new Date(c.fecha).toLocaleDateString('es-DO'),
      no_conduce: c.numero,
      codigo: c.escuelaCodigo,
      centro: g.escuela,
      raciones: c.totalRaciones,
    }))
  )

  const pdfParams = new URLSearchParams()
  if (desde) pdfParams.set('desde', desde)
  if (hasta) pdfParams.set('hasta', hasta)
  if (institucionId) pdfParams.set('institucionId', institucionId)
  if (escuelaId) pdfParams.set('escuelaId', escuelaId)
  const pdfUrl = `/reportes/relacion-por-centro/pdf?${pdfParams.toString()}`

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h1 className="text-xl font-semibold text-slate-900">Relación de conduces por centro</h1>
        <div className="flex gap-2">
          <ReporteAcciones datosExportables={datosExportables} nombreArchivo="relacion-por-centro" />
          <DescargarPdfButton href={pdfUrl} />
        </div>
      </div>

      <div className="mb-4 print:hidden">
        <ReporteFiltros instituciones={instituciones} escuelas={escuelas} />
      </div>

      <div className="space-y-6">
        {reporte.grupos.map((g) => (
          <div
            key={g.escuela}
            className="rounded-xl border border-slate-200 bg-white p-8 text-sm print:break-before-page print:border-none print:p-0"
          >
            <div className="mb-2 text-center">
              <h2 className="text-base font-bold uppercase text-slate-900">{empresa.nombre}</h2>
              <p className="text-xs text-slate-600">{empresa.direccion}</p>
              <p className="text-xs text-slate-600">
                Tel.: {empresa.telefono}
                {empresa.email && ` / E-Mail: ${empresa.email}`}
              </p>
              <p className="text-xs font-semibold text-slate-700">RNC: {empresa.rnc}</p>
            </div>

            <div className="my-4 text-center">
              <h3 className="text-sm font-bold uppercase text-slate-900">
                Relación de conduces por centro
              </h3>
              {(desde || hasta) && (
                <p className="text-xs text-slate-600">
                  Desde: {desde ? new Date(desde + 'T00:00:00').toLocaleDateString('es-DO') : '—'}{' '}
                  Hasta: {hasta ? new Date(hasta + 'T00:00:00').toLocaleDateString('es-DO') : '—'}
                </p>
              )}
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-y border-slate-400 text-left">
                  <th className="w-24 px-2 py-2 font-semibold">Fecha</th>
                  <th className="w-28 px-2 py-2 font-semibold">No. de Conduce</th>
                  <th className="px-2 py-2 font-semibold">Código y Nombre del Centro Educativo</th>
                  <th className="w-36 px-2 py-2 text-right font-semibold">
                    Cantidad de Raciones de Almuerzo Escolar con Postre
                  </th>
                </tr>
              </thead>
              <tbody>
                {g.conduces.map((c) => (
                  <tr key={c.id} className="border-b border-slate-200">
                    <td className="px-2 py-1.5 text-slate-700">
                      {new Date(c.fecha).toLocaleDateString('es-DO')}
                    </td>
                    <td className="px-2 py-1.5 text-slate-900">{c.numero}</td>
                    <td className="px-2 py-1.5 text-slate-700">
                      {c.escuelaCodigo} - {c.escuela}
                    </td>
                    <td className="px-2 py-1.5 text-right text-slate-900">{c.totalRaciones}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-400 font-semibold">
                  <td colSpan={3} className="px-2 py-2">
                    Totales ==&gt;
                  </td>
                  <td className="px-2 py-2 text-right">
                    {new Intl.NumberFormat('es-DO').format(g.raciones)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-12 flex justify-center">
              <div className="w-48 border-t border-slate-400 pt-2 text-center text-xs">
                <p className="font-semibold text-slate-900">
                  {empresa.nombre.split(' ').slice(0, 2).join(' ')}
                </p>
                <p className="text-slate-500">Gerente General</p>
              </div>
            </div>
          </div>
        ))}

        {reporte.grupos.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            No hay resultados con estos filtros.
          </div>
        )}
      </div>
    </div>
  )
}