'use client'
// src/components/despacho/pre-despacho-form.tsx

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReporteAcciones } from '@/components/reportes/reporte-acciones'
import { cn } from '@/lib/utils'

type Ingrediente = {
  insumoId: string
  insumoNombre: string
  unidadMedida: string
  cantidadPorPorcionBase: number
  stockActual: number
}

type Receta = {
  id: string
  nombre: string
  tipoServicio: string
  porcionesBase: number
  ingredientes: Ingrediente[]
}

type FilaForm = { recetaId: string; raciones: string }

export function PreDespachoForm({ recetas }: { recetas: Receta[] }) {
  const router = useRouter()
  const recetaPorId = useMemo(() => new Map(recetas.map((r) => [r.id, r])), [recetas])

  const [filas, setFilas] = useState<FilaForm[]>([{ recetaId: '', raciones: '' }])

  function agregarFila() {
    setFilas((prev) => [...prev, { recetaId: '', raciones: '' }])
  }

  function quitarFila(index: number) {
    setFilas((prev) => prev.filter((_, i) => i !== index))
  }

  function actualizarFila(index: number, campo: keyof FilaForm, valor: string) {
    setFilas((prev) => prev.map((f, i) => (i === index ? { ...f, [campo]: valor } : f)))
  }

  // Consumo agregado de insumos, calculado en vivo, escalando cada receta
  // por (raciones solicitadas / porcionesBase de la receta) — misma fórmula
  // que usa crearConduce() en el servidor al descontar inventario real.
  const consumo = useMemo(() => {
    const mapa = new Map<
      string,
      { insumoNombre: string; unidadMedida: string; cantidadNecesaria: number; stockActual: number }
    >()

    for (const fila of filas) {
      const receta = recetaPorId.get(fila.recetaId)
      const raciones = parseInt(fila.raciones) || 0
      if (!receta || raciones <= 0) continue

      const factor = raciones / receta.porcionesBase

      for (const ing of receta.ingredientes) {
        const cantidadNecesaria = ing.cantidadPorPorcionBase * factor
        const actual = mapa.get(ing.insumoId)
        if (actual) {
          actual.cantidadNecesaria += cantidadNecesaria
        } else {
          mapa.set(ing.insumoId, {
            insumoNombre: ing.insumoNombre,
            unidadMedida: ing.unidadMedida,
            cantidadNecesaria,
            stockActual: ing.stockActual,
          })
        }
      }
    }

    return [...mapa.values()].sort((a, b) => a.insumoNombre.localeCompare(b.insumoNombre))
  }, [filas, recetaPorId])

  const hayFaltantes = consumo.some((c) => c.cantidadNecesaria > c.stockActual)

  function irACrearConduce() {
    // Pasamos las recetas+raciones seleccionadas al formulario real de conduce
    // vía querystring, para no repetir la captura.
    const detalles = filas
      .filter((f) => f.recetaId && f.raciones)
      .map((f) => ({ recetaId: f.recetaId, cantidad: Number(f.raciones) }))

    const params = new URLSearchParams()
    params.set('detalles', JSON.stringify(detalles))
    router.push(`/conduces/nuevo?${params.toString()}`)
  }

  const datosExportables = consumo.map((c) => ({
    insumo: c.insumoNombre,
    unidad: c.unidadMedida,
    cantidad_requerida: c.cantidadNecesaria.toFixed(2),
    stock_actual: c.stockActual,
    estado: c.cantidadNecesaria > c.stockActual ? 'FALTANTE' : 'SUFICIENTE',
  }))

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 print:hidden">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recetas y raciones a preparar</h2>
          <Button type="button" size="sm" variant="outline" onClick={agregarFila}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Agregar receta
          </Button>
        </div>

        <div className="space-y-2">
          {filas.map((fila, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  value={fila.recetaId}
                  onValueChange={(v) => actualizarFila(index, 'recetaId', v ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una receta">
                      {() => recetaPorId.get(fila.recetaId)?.nombre}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {recetas.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.nombre} ({r.tipoServicio})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                type="number"
                min="1"
                placeholder="Raciones"
                className="w-32"
                value={fila.raciones}
                onChange={(e) => actualizarFila(index, 'raciones', e.target.value)}
              />

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-9 w-9 shrink-0"
                onClick={() => quitarFila(index)}
                disabled={filas.length === 1}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Insumos a sacar de almacén</h2>
          <ReporteAcciones datosExportables={datosExportables} nombreArchivo="pre-despacho" />
        </div>

        {consumo.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Selecciona al menos una receta y su cantidad de raciones para ver el cálculo.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Insumo</th>
                  <th className="px-3 py-2 text-right font-medium">Cantidad requerida</th>
                  <th className="px-3 py-2 text-right font-medium">Stock actual</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consumo.map((c) => {
                  const faltante = c.cantidadNecesaria > c.stockActual
                  return (
                    <tr key={c.insumoNombre} className={cn(faltante && 'bg-red-50/50')}>
                      <td className="px-3 py-2 font-medium text-slate-900">{c.insumoNombre}</td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {c.cantidadNecesaria.toFixed(2)} {c.unidadMedida}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-500">
                        {c.stockActual.toFixed(2)} {c.unidadMedida}
                      </td>
                      <td className="px-3 py-2">
                        {faltante ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Faltan {(c.cantidadNecesaria - c.stockActual).toFixed(2)} {c.unidadMedida}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Suficiente
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {hayFaltantes && (
          <p className="mt-3 text-xs text-amber-600">
            Hay insumos insuficientes para cubrir estas raciones. El conduce no podrá generarse hasta
            reponer inventario o reducir las cantidades.
          </p>
        )}

        {consumo.length > 0 && (
          <div className="mt-4 flex justify-end print:hidden">
            <Button onClick={irACrearConduce} disabled={hayFaltantes}>
              Usar esto para crear el conduce
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}