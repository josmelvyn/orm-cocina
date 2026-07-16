// src/app/(dashboard)/facturacion/[id]/page.tsx
import { notFound } from 'next/navigation'
import { obtenerFactura } from '@/services/facturacion.service'
import { AnularFacturaButton } from '@/components/facturacion/anular-factura-button'
import { ImprimirButton } from '@/components/conduces/imprimir-button'

function formatoRD(valor: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}

export default async function DetalleFacturaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const factura = await obtenerFactura(id).catch(() => null)

  if (!factura) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Factura {factura.numeroFactura}</h1>
          <p className="text-sm text-slate-500">Generada por {factura.creadoPor.nombre}</p>
        </div>
        <div className="flex gap-2">
          <ImprimirButton />
          {factura.estado !== 'ANULADA' && (
            <AnularFacturaButton id={factura.id} numero={factura.numeroFactura} />
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 print:border-none print:p-0">
        <div className="mb-6 flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">FACTURA</h2>
            <p className="text-sm text-slate-500">No. {factura.numeroFactura}</p>
            <p className="text-sm text-slate-500">NCF: {factura.ncf} ({factura.tipoNcf})</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Emisión: {new Date(factura.fechaEmision).toLocaleDateString('es-DO')}</p>
            <p>
              Período: {new Date(factura.periodoInicio).toLocaleDateString('es-DO')} —{' '}
              {new Date(factura.periodoFin).toLocaleDateString('es-DO')}
            </p>
            <p className="mt-1 font-medium text-slate-700">{factura.estado}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs uppercase text-slate-400">Facturado a</p>
          <p className="font-medium text-slate-900">{factura.institucion.nombre}</p>
          <p className="text-slate-500">RNC: {factura.institucion.rnc}</p>
          {factura.institucion.direccion && (
            <p className="text-slate-500">{factura.institucion.direccion}</p>
          )}
        </div>

        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2 font-medium">Conduce</th>
              <th className="py-2 font-medium">Escuela</th>
              <th className="py-2 font-medium">Fecha</th>
              <th className="py-2 text-right font-medium">Raciones</th>
              <th className="py-2 text-right font-medium">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {factura.conduces.map((c) => {
              const totalRaciones = c.detalles.reduce((acc, d) => acc + d.cantidad, 0)
              const totalMonto = c.detalles.reduce((acc, d) => acc + Number(d.subtotal), 0)
              return (
                <tr key={c.id}>
                  <td className="py-2 text-slate-900">{c.numero}</td>
                  <td className="py-2 text-slate-600">{c.escuela.nombre}</td>
                  <td className="py-2 text-slate-500">
                    {new Date(c.fecha).toLocaleDateString('es-DO')}
                  </td>
                  <td className="py-2 text-right text-slate-500">{totalRaciones}</td>
                  <td className="py-2 text-right text-slate-900">{formatoRD(totalMonto)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatoRD(Number(factura.subtotal))}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>ITBIS</span>
              <span>{formatoRD(Number(factura.itbis))}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatoRD(Number(factura.total))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}