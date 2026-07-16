'use client'
// src/components/inventario/insumo-table.tsx

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Insumo = {
  id: string
  codigo: string
  nombre: string
  unidadMedida: string
  stockActual: unknown // Decimal serializado
  stockMinimo: unknown
  costoUnitario: unknown
  categoria: { nombre: string } | null
}

export function InsumoTable({ insumos }: { insumos: Insumo[] }) {
  if (insumos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        No hay insumos registrados todavía.
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
            <th className="px-4 py-3 font-medium">Categoría</th>
            <th className="px-4 py-3 font-medium">Unidad</th>
            <th className="px-4 py-3 text-right font-medium">Stock actual</th>
            <th className="px-4 py-3 text-right font-medium">Stock mínimo</th>
            <th className="px-4 py-3 text-right font-medium">Costo unitario</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {insumos.map((insumo) => {
            const stockBajo = Number(insumo.stockActual) <= Number(insumo.stockMinimo)
            return (
              <tr key={insumo.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{insumo.codigo}</td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link href={`/inventario/${insumo.id}`} className="hover:underline">
                    {insumo.nombre}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{insumo.categoria?.nombre ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{insumo.unidadMedida}</td>
                <td
                  className={cn(
                    'px-4 py-3 text-right font-medium',
                    stockBajo ? 'text-amber-600' : 'text-slate-900'
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {stockBajo && <AlertTriangle className="h-3.5 w-3.5" />}
                    {String(insumo.stockActual)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-500">
                  {String(insumo.stockMinimo)}
                </td>
                <td className="px-4 py-3 text-right text-slate-500">
                  {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(
                    Number(insumo.costoUnitario)
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}