'use client'
// src/components/conduces/conduce-form.tsx

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { crearConduceAction } from '@/actions/conduces.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Escuela = { id: string; nombre: string }
type Receta = { id: string; nombre: string; tipoServicio: string; precioPorcion: number }
type DetalleForm = { recetaId: string; cantidad: string }

function formatoRD(valor: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export function ConduceForm({ escuelas, recetas }: { escuelas: Escuela[]; recetas: Receta[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const [tipoServicio, setTipoServicio] = useState('DESAYUNO')
  const [detalles, setDetalles] = useState<DetalleForm[]>([{ recetaId: '', cantidad: '' }])

  const recetaPorId = useMemo(() => new Map(recetas.map((r) => [r.id, r])), [recetas])

  // Solo mostramos recetas que coincidan con el tipo de servicio seleccionado
  const recetasDisponibles = recetas.filter((r) => r.tipoServicio === tipoServicio)

  const totalMonto = detalles.reduce((acc, d) => {
    const receta = recetaPorId.get(d.recetaId)
    const cantidad = parseInt(d.cantidad) || 0
    return acc + (receta ? receta.precioPorcion * cantidad : 0)
  }, 0)

  const totalRaciones = detalles.reduce((acc, d) => acc + (parseInt(d.cantidad) || 0), 0)

  function agregarDetalle() {
    setDetalles((prev) => [...prev, { recetaId: '', cantidad: '' }])
  }

  function quitarDetalle(index: number) {
    setDetalles((prev) => prev.filter((_, i) => i !== index))
  }

  function actualizarDetalle(index: number, campo: keyof DetalleForm, valor: string) {
    setDetalles((prev) => prev.map((d, i) => (i === index ? { ...d, [campo]: valor } : d)))
  }

  function handleSubmit(formData: FormData) {
    setErrores({})
    setErrorGeneral(null)

    const detallesLimpios = detalles
      .filter((d) => d.recetaId && d.cantidad)
      .map((d) => ({ recetaId: d.recetaId, cantidad: Number(d.cantidad) }))

    formData.set('detalles', JSON.stringify(detallesLimpios))

    startTransition(async () => {
      const resultado = await crearConduceAction(formData)

      if (!resultado.success) {
        if (resultado.fieldErrors) setErrores(resultado.fieldErrors)
        setErrorGeneral(resultado.error || 'Revisa los campos marcados.')
        return
      }

      router.push(`/conduces/${resultado.id}`)
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="escuelaId">Escuela</Label>
            <Select name="escuelaId">
              <SelectTrigger id="escuelaId">
                <SelectValue placeholder="Selecciona una escuela" />
              </SelectTrigger>
              <SelectContent>
                {escuelas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errores.escuelaId && <p className="text-xs text-red-600">{errores.escuelaId}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" name="fecha" type="date" defaultValue={hoyISO()} />
            {errores.fecha && <p className="text-xs text-red-600">{errores.fecha}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tipoServicio">Tipo de servicio</Label>
          <Select name="tipoServicio" defaultValue="DESAYUNO" onValueChange={(v) => setTipoServicio(v ?? 'DESAYUNO')}>
            <SelectTrigger id="tipoServicio">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESAYUNO">Desayuno</SelectItem>
              <SelectItem value="ALMUERZO">Almuerzo</SelectItem>
              <SelectItem value="MERIENDA">Merienda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="observaciones">Observaciones (opcional)</Label>
          <Textarea id="observaciones" name="observaciones" rows={2} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recetas a entregar</h2>
          <Button type="button" size="sm" variant="outline" onClick={agregarDetalle}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Agregar receta
          </Button>
        </div>

        {recetasDisponibles.length === 0 && (
          <p className="mb-3 text-xs text-amber-600">
            No hay recetas activas para el servicio "{tipoServicio}". Crea una en el maestro de recetas.
          </p>
        )}

        <div className="space-y-2">
          {detalles.map((d, index) => {
            const receta = recetaPorId.get(d.recetaId)
            const cantidad = parseInt(d.cantidad) || 0
            const subtotal = receta ? receta.precioPorcion * cantidad : 0

            return (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    value={d.recetaId}
                    onValueChange={(v) => actualizarDetalle(index, 'recetaId', v ?? '')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una receta" />
                    </SelectTrigger>
                    <SelectContent>
                      {recetasDisponibles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.nombre} — {formatoRD(r.precioPorcion)}/ración
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  type="number"
                  min="1"
                  placeholder="Raciones"
                  className="w-28"
                  value={d.cantidad}
                  onChange={(e) => actualizarDetalle(index, 'cantidad', e.target.value)}
                />

                <span className="w-28 shrink-0 text-right text-sm text-slate-500">
                  {receta ? formatoRD(subtotal) : '—'}
                </span>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 shrink-0"
                  onClick={() => quitarDetalle(index)}
                  disabled={detalles.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )
          })}
        </div>

        {errores.detalles && <p className="mt-2 text-xs text-red-600">{errores.detalles}</p>}

        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <span className="text-sm text-slate-600">Total de raciones</span>
          <span className="text-sm font-semibold text-slate-900">{totalRaciones}</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3">
          <span className="text-sm text-emerald-700">Monto total del conduce</span>
          <span className="text-sm font-semibold text-emerald-700">{formatoRD(totalMonto)}</span>
        </div>
      </div>

      {errorGeneral && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorGeneral}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Generando conduce...' : 'Generar conduce'}
        </Button>
      </div>
    </form>
  )
}