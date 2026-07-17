'use client'

// src/components/inventario/movimiento-table.tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'

type Movimiento = {
  id: string
  tipo: string
  cantidad: string
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

const POR_PAGINA = 10

export function MovimientoTable({ movimientos }: { movimientos: Movimiento[] }) {
  const [pagina, setPagina] = useState(1)

  if (movimientos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        No hay movimientos registrados todavía.
      </div>
    )
  }

  const totalPaginas = Math.ceil(movimientos.length / POR_PAGINA)
  const inicio = (pagina - 1) * POR_PAGINA
  const pagina_movimientos = movimientos.slice(inicio, inicio + POR_PAGINA)

  return (
    <div className="space-y-3">
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
            {pagina_movimientos.map((m) => (
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
                  {m.cantidad} {m.insumo.unidadMedida}
                </td>
                <td className="px-4 py-3 text-slate-500">{m.motivo ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{m.creadoPor.nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            {inicio + 1}–{Math.min(inicio + POR_PAGINA, movimientos.length)} de {movimientos.length} movimientos
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPagina(n)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition',
                  n === pagina
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 hover:bg-slate-50'
                )}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}