// src/app/(dashboard)/reportes/relacion-general/page.tsx
import { reporteRelacionGeneral } from '@/services/reportes.service'
import { obtenerEmpresa } from '@/services/empresa.service'
import { ReporteFiltros } from '@/components/reportes/reporte-filtros'
import { ReporteAcciones } from '@/components/reportes/reporte-acciones'
import { DescargarPdfButton } from '@/components/shared/descargar-pdf-button'

export default async function RelacionGeneralPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; institucionId?: string }>
}) {
  const { desde, hasta, institucionId } = await searchParams

  const [reporte, empresa] = await Promise.all([
    reporteRelacionGeneral({ desde, hasta, institucionId }),
    obtenerEmpresa(),
  ])

  const datosExportables = reporte.conduces.map((c) => ({
    fecha: new Date(c.fecha).toLocaleDateString('es-DO'),
    no_conduce: c.numero,
    codigo_centro: c.escuelaCodigo,
    centro_educativo: c.escuela,
    raciones: c.totalRaciones,
  }))

  // Construir la URL del PDF con los mismos filtros activos
  const pdfParams = new URLSearchParams()
  if (desde) pdfParams.set('desde', desde)
  if (hasta) pdfParams.set('hasta', hasta)
  if (institucionId) pdfParams.set('institucionId', institucionId)
  const pdfUrl = `/reportes/relacion-general/pdf?${pdfParams.toString()}`

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h1 className="text-xl font-semibold text-slate-900">Relación de conduces general</h1>
        <div className="flex gap-2">
          <ReporteAcciones datosExportables={datosExportables} nombreArchivo="relacion-conduces-general" />
          <DescargarPdfButton href={pdfUrl} />
        </div>
      </div>

      <div className="mb-4 print:hidden">
        <ReporteFiltros />
      </div>

      {/* Documento imprimible */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm print:border-none print:p-0">
        {/* Encabezado de empresa */}
        <div className="mb-2 text-center">
          <h2 className="text-base font-bold uppercase text-slate-900">{empresa.nombre}</h2>
          <p className="text-xs text-slate-600">{empresa.direccion}</p>
          <p className="text-xs text-slate-600">
            Tel.: {empresa.telefono}
            {empresa.email && ` / E-Mail: ${empresa.email}`}
          </p>
          <p className="text-xs font-semibold text-slate-700">RNC: {empresa.rnc}</p>
        </div>

        {/* Título del reporte */}
        <div className="my-4 text-center">
          <h3 className="text-sm font-bold uppercase text-slate-900">Relación de conduces general</h3>
          {(desde || hasta) && (
            <p className="text-xs text-slate-600">
              MES: Desde: {desde ? new Date(desde + 'T00:00:00').toLocaleDateString('es-DO') : '—'}{' '}
              Hasta: {hasta ? new Date(hasta + 'T00:00:00').toLocaleDateString('es-DO') : '—'}
            </p>
          )}
        </div>

        {/* Tabla */}
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
            {reporte.conduces.map((c) => (
              <tr key={c.id} className="border-b border-slate-200 hover:bg-slate-50 print:hover:bg-transparent">
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
          {reporte.conduces.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-400 font-semibold">
                <td colSpan={3} className="px-2 py-2 text-right">
                  TOTAL
                </td>
                <td className="px-2 py-2 text-right">{reporte.totalRaciones}</td>
              </tr>
            </tfoot>
          )}
        </table>

        {reporte.conduces.length === 0 && (
          <p className="py-10 text-center text-slate-400">No hay resultados con estos filtros.</p>
        )}
      </div>
    </div>
  )
}