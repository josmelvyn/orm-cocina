// src/components/facturacion/factura-table.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Factura = {
  id: string
  numeroFactura: string
  ncf: string
  institucion: { nombre: string }
  fechaEmision: Date
  total: number
  estado: string
  cantidadConduces: number
}

const ESTILO_ESTADO: Record<string, string> = {
  EMITIDA: 'bg-blue-50 text-blue-700',
  PAGADA: 'bg-emerald-50 text-emerald-700',
  ANULADA: 'bg-red-50 text-red-700',
}

function formatoRD(valor: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}

export function FacturaTable({ facturas }: { facturas: Factura[] }) {
  if (facturas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        No hay facturas registradas todavía.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">No. Factura</th>
            <th className="px-4 py-3 font-medium">NCF</th>
            <th className="px-4 py-3 font-medium">Institución</th>
            <th className="px-4 py-3 font-medium">Fecha emisión</th>
            <th className="px-4 py-3 text-right font-medium">Conduces</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {facturas.map((f) => (
            <tr key={f.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">
                <Link href={`/facturacion/${f.id}`} className="hover:underline">
                  {f.numeroFactura}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-500">{f.ncf}</td>
              <td className="px-4 py-3 text-slate-700">{f.institucion.nombre}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {new Date(f.fechaEmision).toLocaleDateString('es-DO')}
              </td>
              <td className="px-4 py-3 text-right text-slate-500">{f.cantidadConduces}</td>
              <td className="px-4 py-3 text-right text-slate-900">{formatoRD(f.total)}</td>
              <td className="px-4 py-3">
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ESTILO_ESTADO[f.estado])}>
                  {f.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}