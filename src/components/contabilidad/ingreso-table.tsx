'use client'
// src/components/contabilidad/ingreso-table.tsx

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { eliminarIngresoAction } from '@/actions/contabilidad.actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Ingreso = {
  id: string
  fecha: Date
  concepto: string
  monto: number
  origen: string
  numeroFactura: string | null
  creadoPor: string
}

function formatoRD(v: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v)
}

export function IngresoTable({ ingresos }: { ingresos: Ingreso[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleEliminar(id: string) {
    if (!confirm('¿Eliminar este ingreso?')) return
    startTransition(async () => {
      const resultado = await eliminarIngresoAction(id)
      if (!resultado.success && resultado.error) alert(resultado.error)
      router.refresh()
    })
  }

  if (ingresos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        No hay ingresos registrados todavía.
      </div>
    )
  }

  const total = ingresos.reduce((a, i) => a + i.monto, 0)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Concepto</th>
            <th className="px-4 py-3 font-medium">Origen</th>
            <th className="px-4 py-3 text-right font-medium">Monto</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {ingresos.map((i) => (
            <tr key={i.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {new Date(i.fecha).toLocaleDateString('es-DO')}
              </td>
              <td className="px-4 py-3 text-slate-700">{i.concepto}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    i.origen === 'FACTURA' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {i.origen === 'FACTURA' ? `Factura ${i.numeroFactura}` : 'Manual'}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-medium text-emerald-700">{formatoRD(i.monto)}</td>
              <td className="px-4 py-3 text-right">
                {i.origen === 'MANUAL' && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={isPending}
                    onClick={() => handleEliminar(i.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-slate-900">
          <tr>
            <td colSpan={3} className="px-4 py-3 text-right">
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