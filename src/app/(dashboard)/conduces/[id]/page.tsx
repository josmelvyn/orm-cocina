// src/app/(dashboard)/conduces/[id]/page.tsx
import { notFound } from 'next/navigation'
import { obtenerConduce } from '@/services/conduces.service'
import { obtenerEmpresa } from '@/services/empresa.service'
import { AnularConduceButton } from '@/components/conduces/anular-conduce-button'
import { ImprimirButton } from '@/components/conduces/imprimir-button'
import { DescargarPdfButton } from '@/components/shared/descargar-pdf-button'

export default async function DetalleConducePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [conduce, empresa] = await Promise.all([
    obtenerConduce(id).catch(() => null),
    obtenerEmpresa(),
  ])

  if (!conduce) notFound()

  // Todas las recetas del conduce se muestran como una sola descripción
  // combinada (tal como en el formato físico), asumiendo que comparten
  // la misma cantidad de raciones. El postre va aparte, en su propia línea.
  const descripcionProductos = conduce.detalles.map((d) => d.receta.nombre).join(', ')
  const totalRaciones = Math.max(...conduce.detalles.map((d) => d.cantidad), 0)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Conduce {conduce.numero}</h1>
          <p className="text-sm text-slate-500">Generado por {conduce.creadoPor.nombre}</p>
        </div>
        <div className="flex gap-2">
          <ImprimirButton />
          <DescargarPdfButton href={`/conduces/${conduce.id}/pdf`} />
          {conduce.estado !== 'ANULADO' && conduce.estado !== 'FACTURADO' && (
            <AnularConduceButton id={conduce.id} numero={conduce.numero} />
          )}
        </div>
      </div>

      {/* Formato replicando el conduce físico oficial */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm print:border-none print:p-0">
        {/* Encabezado de la empresa suplidora */}
        <div className="mb-4 text-center">
          <h2 className="text-lg font-bold uppercase text-slate-900">{empresa.nombre}</h2>
          <p className="text-xs text-slate-600">{empresa.direccion}</p>
          <p className="text-xs text-slate-600">
            Tel.: {empresa.telefono}
            {empresa.email && ` / E-Mail: ${empresa.email}`}
          </p>
          <p className="text-xs font-semibold text-slate-700">RNC: {empresa.rnc}</p>
        </div>

        <div className="my-4 border-t-2 border-slate-800" />

        {/* Bloque de datos: escuela (izquierda) / conduce (derecha) */}
        <div className="mb-4 grid grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <p>
              <span className="font-semibold">NOMBRE CENTRO EDUCATIVO: </span>
              {conduce.escuela.nombre}
            </p>
            <p>
              <span className="font-semibold">DIRECTOR DEL CENTRO: </span>
              {conduce.escuela.director ?? '—'}
            </p>
            <p>
              <span className="font-semibold">DIRECCIÓN: </span>
              {conduce.escuela.direccion ?? '—'}
            </p>
            <p>
              <span className="font-semibold">PROVINCIA O MUNICIPIO: </span>
              {conduce.escuela.provincia ?? '—'}
            </p>
            <p>
              <span className="font-semibold">RUTA: </span>
              {conduce.escuela.ruta ?? '—'}
            </p>
          </div>
          <div className="space-y-1">
            <p>
              <span className="font-semibold">CONDUCE NO.: </span>
              {conduce.numero}
            </p>
            <p>
              <span className="font-semibold">FECHA: </span>
              {new Date(conduce.fecha).toLocaleDateString('es-DO')}
            </p>
            <p>
              <span className="font-semibold">CÓDIGO CENTRO: </span>
              {conduce.escuela.codigo}
            </p>
            <p>
              <span className="font-semibold">TELÉFONO: </span>
              {conduce.escuela.telefono ?? '—'}
            </p>
            <p>
              <span className="font-semibold">REGIONAL/DISTRITO: </span>
              {conduce.escuela.regionalDistrito ?? '—'}
            </p>
          </div>
        </div>

        <div className="my-3 border-t border-dashed border-slate-400" />

        {/* Tabla de descripción del producto */}
        <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase">
          <span>Descripción del producto</span>
          <span>Cantidad</span>
        </div>
        <div className="flex items-start justify-between border-t border-slate-300 py-3">
          <div className="pr-4 text-xs text-slate-800">
            <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400">
              Raciones alimenticias {conduce.postre && 'con postre'}
            </p>
            <p>{descripcionProductos}.</p>
            {conduce.postre && <p>Postre: {conduce.postre}.</p>}
          </div>
          <div className="shrink-0 text-sm font-semibold text-slate-900">{totalRaciones}</div>
        </div>

        <div className="my-3 border-t border-dashed border-slate-400" />

        {/* Observaciones */}
        <div className="mb-8 text-xs">
          <span className="font-semibold">OBSERVACIONES: </span>
          <span className="text-slate-600">{conduce.observaciones ?? ''}</span>
          <div className="mt-1 border-b border-slate-300" style={{ minHeight: '1.2rem' }} />
        </div>

        {/* Firmas */}
        <div className="grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="mt-16 border-t border-slate-400 pt-1 text-center text-[10px] text-slate-500">
              FIRMA Y SELLO DEL SUPLIDOR
            </div>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">RECIBIDO POR:</p>
            <p className="border-b border-slate-300 pb-1">
              <span className="font-semibold">NOMBRE: </span>
              {conduce.nombreRecibe ?? ''}
            </p>
            <p className="border-b border-slate-300 pb-1">
              <span className="font-semibold">FIRMA: </span>
            </p>
            <p className="border-b border-slate-300 pb-1">
              <span className="font-semibold">FECHA RECEPCIÓN: </span>
              {conduce.fechaRecepcion ? new Date(conduce.fechaRecepcion).toLocaleDateString('es-DO') : ''}
            </p>
            <p className="border-b border-slate-300 pb-1">
              <span className="font-semibold">HORA DE RECEPCIÓN: </span>
              {conduce.horaRecepcion ?? ''}
            </p>
            <p>
              <span className="font-semibold">SELLO DEL CENTRO</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}