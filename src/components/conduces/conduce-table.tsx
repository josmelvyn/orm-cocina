// src/components/conduces/conduce-table.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Conduce = {
  id: string
  numero: string
  fecha: Date
  tipoServicio: string
  estado: string
  escuela: { nombre: string }
  totalRaciones: number
  totalMonto: number
}

const ESTILO_ESTADO: Record<string, string> = {
  EMITIDO: 'bg-blue-50 text-blue-700',
  FACTURADO: 'bg-emerald-50 text-emerald-700',
  ANULADO: 'bg-red-50 text-red-700',
}

function formatoRD(valor: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}

export function ConduceTable({ conduces }: { conduces: Conduce[] }) {
  if (conduces.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        No hay conduces con estos filtros.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Número</th>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Escuela</th>
            <th className="px-4 py-3 font-medium">Servicio</th>
            <th className="px-4 py-3 text-right font-medium">Raciones</th>
            <th className="px-4 py-3 text-right font-medium">Monto</th>
            <th className="px-4 py-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {conduces.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">
                <Link href={`/conduces/${c.id}`} className="hover:underline">
                  {c.numero}
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {new Date(c.fecha).toLocaleDateString('es-DO')}
              </td>
              <td className="px-4 py-3 text-slate-700">{c.escuela.nombre}</td>
              <td className="px-4 py-3 text-slate-500">{c.tipoServicio}</td>
              <td className="px-4 py-3 text-right text-slate-500">{c.totalRaciones}</td>
              <td className="px-4 py-3 text-right text-slate-900">{formatoRD(c.totalMonto)}</td>
              <td className="px-4 py-3">
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ESTILO_ESTADO[c.estado])}>
                  {c.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}