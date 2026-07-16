// src/components/inventario/movimiento-table.tsx
import { cn } from '@/lib/utils'

type Movimiento = {
  id: string
  tipo: string
  cantidad: unknown
  motivo: string | null
  createdAt: Date
  insumo: { nombre: string; codigo: string; unidadMedida: string }
  creadoPor: { nombre: string }
}

const ESTILO_TIPO: Record<string, string> = {
  ENTRADA: 'bg-emerald-50 text-emerald-700',
  SALIDA: 'bg-slate-100 text-slate-700',
  AJUSTE: 'bg-blue-50 text-blue-700',
  MERMA: 'bg-red-50 text-red-700',
}

export function MovimientoTable({ movimientos }: { movimientos: Movimiento[] }) {
  if (movimientos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        No hay movimientos registrados todavía.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Insumo</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 text-right font-medium">Cantidad</th>
            <th className="px-4 py-3 font-medium">Motivo</th>
            <th className="px-4 py-3 font-medium">Usuario</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {movimientos.map((m) => (
            <tr key={m.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {new Date(m.createdAt).toLocaleDateString('es-DO', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3 font-medium text-slate-900">
                {m.insumo.codigo} — {m.insumo.nombre}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    ESTILO_TIPO[m.tipo]
                  )}
                >
                  {m.tipo}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-slate-900">
                {String(m.cantidad)} {m.insumo.unidadMedida}
              </td>
              <td className="px-4 py-3 text-slate-500">{m.motivo ?? '—'}</td>
              <td className="px-4 py-3 text-slate-500">{m.creadoPor.nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}