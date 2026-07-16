// src/components/recetas/receta-table.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Receta = {
  id: string
  codigo: string
  nombre: string
  tipoServicio: string
  porcionesBase: number
  costoPorcion: number | null
  precioPorcion: number
}

const ESTILO_TIPO: Record<string, string> = {
  DESAYUNO: 'bg-amber-50 text-amber-700',
  ALMUERZO: 'bg-emerald-50 text-emerald-700',
  MERIENDA: 'bg-blue-50 text-blue-700',
}

function formatoRD(valor: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}

export function RecetaTable({ recetas }: { recetas: Receta[] }) {
  if (recetas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        No hay recetas registradas todavía.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Código</th>
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Servicio</th>
            <th className="px-4 py-3 text-right font-medium">Porciones base</th>
            <th className="px-4 py-3 text-right font-medium">Costo/porción</th>
            <th className="px-4 py-3 text-right font-medium">Precio/porción</th>
            <th className="px-4 py-3 text-right font-medium">Margen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {recetas.map((r) => {
            const margen = r.costoPorcion !== null ? r.precioPorcion - r.costoPorcion : null
            const margenPct = margen !== null && r.precioPorcion > 0 ? (margen / r.precioPorcion) * 100 : null

            return (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{r.codigo}</td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link href={`/recetas/${r.id}`} className="hover:underline">
                    {r.nombre}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ESTILO_TIPO[r.tipoServicio])}>
                    {r.tipoServicio}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-500">{r.porcionesBase}</td>
                <td className="px-4 py-3 text-right text-slate-500">
                  {r.costoPorcion !== null ? formatoRD(r.costoPorcion) : '—'}
                </td>
                <td className="px-4 py-3 text-right text-slate-900">{formatoRD(r.precioPorcion)}</td>
                <td
                  className={cn(
                    'px-4 py-3 text-right font-medium',
                    margenPct !== null && margenPct < 15 ? 'text-amber-600' : 'text-emerald-600'
                  )}
                >
                  {margenPct !== null ? `${margenPct.toFixed(1)}%` : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}