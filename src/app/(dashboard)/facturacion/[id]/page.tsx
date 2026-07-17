// src/app/(dashboard)/facturacion/[id]/page.tsx
import { notFound } from 'next/navigation'
import { obtenerFactura } from '@/services/facturacion.service'
import { obtenerEmpresa } from '@/services/empresa.service'
import { AnularFacturaButton } from '@/components/facturacion/anular-factura-button'
import { MarcarPagadaButton } from '@/components/facturacion/marcar-pagada-button'
import { ImprimirButton } from '@/components/conduces/imprimir-button'
import { DescargarPdfButton } from '@/components/shared/descargar-pdf-button'

function formatoRD(valor: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}

function formatoNumero(valor: number) {
  return new Intl.NumberFormat('es-DO').format(valor)
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default async function DetalleFacturaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [factura, empresa] = await Promise.all([
    obtenerFactura(id).catch(() => null),
    obtenerEmpresa(),
  ])

  if (!factura) notFound()

  const totalRaciones = factura.conduces.reduce(
    (acc, c) => acc + c.detalles.reduce((a, d) => a + d.cantidad, 0),
    0
  )
  const subtotal = Number(factura.subtotal)
  const precioUnitario = totalRaciones > 0 ? subtotal / totalRaciones : 0

  const numerosConduce = factura.conduces.map((c) => c.numero).sort()
  const primerConduce = numerosConduce[0] ?? '—'
  const ultimoConduce = numerosConduce[numerosConduce.length - 1] ?? '—'

  const mesFactura = MESES[new Date(factura.periodoFin).getMonth()]
  const anioFactura = new Date(factura.periodoFin).getFullYear()

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Factura {factura.numeroFactura}</h1>
          <p className="text-sm text-slate-500">Generada por {factura.creadoPor.nombre}</p>
        </div>
        <div className="flex gap-2">
          <ImprimirButton />
          <DescargarPdfButton href={`/facturacion/${factura.id}/pdf`} />
          {factura.estado === 'EMITIDA' && <MarcarPagadaButton id={factura.id} />}
          {factura.estado !== 'ANULADA' && (
            <AnularFacturaButton id={factura.id} numero={factura.numeroFactura} />
          )}
        </div>
      </div>

      {/* Formato replicando la factura gubernamental oficial */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm print:border-none print:p-0">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold uppercase text-slate-900">{empresa.nombre}</h2>
            <p className="text-xs text-slate-600">{empresa.direccion}</p>
            <p className="text-xs text-slate-600">
              Tel.: {empresa.telefono}{empresa.email ? ` / E-Mail: ${empresa.email}` : ''}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-700">RNC: {empresa.rnc}</p>
            <p className="text-xs font-semibold text-slate-700">
              FECHA: {new Date(factura.fechaEmision).toLocaleDateString('es-DO')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold uppercase text-slate-900">Factura gubernamental</p>
            <p className="text-xs text-slate-600">
              <span className="font-semibold">NCF: </span>
              {factura.ncf}
            </p>
            {factura.ncfValidoHasta && (
              <p className="text-xs text-slate-600">
                <span className="font-semibold">Válido hasta: </span>
                {new Date(factura.ncfValidoHasta).toLocaleDateString('es-DO')}
              </p>
            )}
          </div>
        </div>

        <div className="my-3 border-t-2 border-slate-800" />

        <div className="mb-1 flex text-xs">
          <span className="w-40 font-semibold">RNC CLIENTE:</span>
          <span className="flex-1 border-b border-slate-300">{factura.institucion.rnc}</span>
        </div>
        <div className="mb-3 flex text-xs">
          <span className="w-40 font-semibold">NOMBRE O RAZÓN SOCIAL:</span>
          <span className="flex-1 border-b border-slate-300">{factura.institucion.nombre}</span>
        </div>

        <div className="mb-1 flex text-xs">
          <span className="w-40 font-semibold">Período de factura:</span>
          <span className="flex-1 border-b border-slate-300">
            {new Date(factura.periodoInicio).toLocaleDateString('es-DO')} a{' '}
            {new Date(factura.periodoFin).toLocaleDateString('es-DO')} / {mesFactura} {anioFactura}
          </span>
        </div>
        <div className="mb-3 flex items-center gap-2 text-xs">
          <span className="w-40 shrink-0 font-semibold">Cantidad de Conduces:</span>
          <span className="border-b border-slate-300 px-2">{factura.conduces.length}</span>
          <span className="font-semibold">del No.</span>
          <span className="border-b border-slate-300 px-2">{primerConduce}</span>
          <span className="font-semibold">al</span>
          <span className="border-b border-slate-300 px-2">{ultimoConduce}</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-300 pb-1 pt-2 text-xs font-semibold uppercase text-slate-500">
          <span className="w-2/5">Producto</span>
          <span className="w-1/5 text-right">Cantidad</span>
          <span className="w-1/5 text-right">Precio S/ITBIS</span>
          <span className="w-1/5 text-right">Valor RD$</span>
        </div>
        <div className="flex items-center justify-between border-y border-dashed border-slate-400 py-3 text-xs">
          <span className="w-2/5 font-medium text-slate-900">RACIONES ALIMENTICIA CON POSTRE</span>
          <span className="w-1/5 text-right">{formatoNumero(totalRaciones)}</span>
          <span className="w-1/5 text-right">{precioUnitario.toFixed(2)}</span>
          <span className="w-1/5 text-right font-medium">{formatoRD(subtotal)}</span>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="w-56 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="font-semibold">SUB-TOTAL:</span>
              <span>{formatoRD(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">ITBIS:</span>
              <span>{formatoRD(Number(factura.itbis))}</span>
            </div>
            <div className="flex justify-between border-t border-slate-300 pt-1 text-sm font-bold">
              <span>TOTAL:</span>
              <span>{formatoRD(Number(factura.total))}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 text-right text-xs">
          <p className="mb-16 font-semibold">FIRMA Y SELLO DE LA EMPRESA</p>
        </div>
      </div>
    </div>
  )
}