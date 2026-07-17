'use client'
// src/components/contabilidad/gasto-table.tsx

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { eliminarGastoAction } from '@/actions/contabilidad.actions'
import { Button } from '@/components/ui/button'

type Gasto = {
  id: string
  fecha: Date
  categoria: string
  descripcion: string
  monto: number
  metodoPago: string
  comprobante: string | null
  creadoPor: string
}

function formatoRD(v: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v)
}

export function GastoTable({ gastos }: { gastos: Gasto[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleEliminar(id: string) {
    if (!confirm('¿Eliminar este gasto? Esta acción no se puede deshacer.')) return
    startTransition(async () => {
      await eliminarGastoAction(id)
      router.refresh()
    })
  }

  if (gastos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        No hay gastos registrados todavía.
      </div>
    )
  }

  const total = gastos.reduce((a, g) => a + g.monto, 0)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Categoría</th>
            <th className="px-4 py-3 font-medium">Descripción</th>
            <th className="px-4 py-3 font-medium">Método</th>
            <th className="px-4 py-3 text-right font-medium">Monto</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {gastos.map((g) => (
            <tr key={g.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {new Date(g.fecha).toLocaleDateString('es-DO')}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {g.categoria}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">{g.descripcion}</td>
              <td className="px-4 py-3 text-slate-500">{g.metodoPago}</td>
              <td className="px-4 py-3 text-right font-medium text-slate-900">{formatoRD(g.monto)}</td>
              <td className="px-4 py-3 text-right">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  disabled={isPending}
                  onClick={() => handleEliminar(g.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-slate-900">
          <tr>
            <td colSpan={4} className="px-4 py-3 text-right">
              Total
            </td>
            <td className="px-4 py-3 text-right">{formatoRD(total)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}