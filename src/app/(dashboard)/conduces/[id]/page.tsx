// src/app/(dashboard)/conduces/[id]/page.tsx
import { notFound } from 'next/navigation'
import { obtenerConduce } from '@/services/conduces.service'
import { AnularConduceButton } from '@/components/conduces/anular-conduce-button'
import { ImprimirButton } from '@/components/conduces/imprimir-button'

function formatoRD(valor: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}

export default async function DetalleConducePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const conduce = await obtenerConduce(id).catch(() => null)

  if (!conduce) notFound()

  const totalMonto = conduce.detalles.reduce((acc, d) => acc + Number(d.subtotal), 0)
  const totalRaciones = conduce.detalles.reduce((acc, d) => acc + d.cantidad, 0)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Conduce {conduce.numero}</h1>
          <p className="text-sm text-slate-500">Generado por {conduce.creadoPor.nombre}</p>
        </div>
        <div className="flex gap-2">
          <ImprimirButton />
          {conduce.estado !== 'ANULADO' && conduce.estado !== 'FACTURADO' && (
            <AnularConduceButton id={conduce.id} numero={conduce.numero} />
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 print:border-none print:p-0">
        <div className="mb-6 flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">CONDUCE DE ENTREGA</h2>
            <p className="text-sm text-slate-500">No. {conduce.numero}</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Fecha: {new Date(conduce.fecha).toLocaleDateString('es-DO')}</p>
            <p>Servicio: {conduce.tipoServicio}</p>
            <p className="mt-1 font-medium text-slate-700">{conduce.estado}</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase text-slate-400">Escuela</p>
            <p className="font-medium text-slate-900">{conduce.escuela.nombre}</p>
            <p className="text-slate-500">{conduce.escuela.direccion}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Institución</p>
            <p className="font-medium text-slate-900">{conduce.escuela.institucion.nombre}</p>
            <p className="text-slate-500">RNC: {conduce.escuela.institucion.rnc}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2 font-medium">Receta</th>
              <th className="py-2 text-right font-medium">Raciones</th>
              <th className="py-2 text-right font-medium">Precio unit.</th>
              <th className="py-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {conduce.detalles.map((d) => (
              <tr key={d.id}>
                <td className="py-2 text-slate-900">{d.receta.nombre}</td>
                <td className="py-2 text-right text-slate-500">{d.cantidad}</td>
                <td className="py-2 text-right text-slate-500">{formatoRD(Number(d.precioUnitario))}</td>
                <td className="py-2 text-right text-slate-900">{formatoRD(Number(d.subtotal))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Total raciones</span>
              <span>{totalRaciones}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatoRD(totalMonto)}</span>
            </div>
          </div>
        </div>

        {conduce.observaciones && (
          <p className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-500">
            <span className="font-medium text-slate-700">Observaciones: </span>
            {conduce.observaciones}
          </p>
        )}

        <div className="mt-16 grid grid-cols-2 gap-8 text-center text-xs text-slate-400">
          <div className="border-t border-slate-300 pt-2">Entregado por</div>
          <div className="border-t border-slate-300 pt-2">Recibido por (escuela)</div>
        </div>
      </div>
    </div>
  )
}