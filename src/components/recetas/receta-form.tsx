'use client'
// src/components/recetas/receta-form.tsx

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { crearRecetaAction, actualizarRecetaAction } from '@/actions/recetas.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Insumo = { id: string; nombre: string; unidadMedida: string; costoUnitario: number }

type IngredienteForm = { insumoId: string; cantidad: string }

type RecetaExistente = {
  id: string
  codigo: string
  nombre: string
  tipoServicio: string
  porcionesBase: number
  precioPorcion: number
  ingredientes: { insumoId: string; cantidad: number }[]
}

function formatoRD(valor: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}

export function RecetaForm({ insumos, receta }: { insumos: Insumo[]; receta?: RecetaExistente }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const [porcionesBase, setPorcionesBase] = useState(String(receta?.porcionesBase ?? 4))
  const [ingredientes, setIngredientes] = useState<IngredienteForm[]>(
    receta?.ingredientes.map((i) => ({ insumoId: i.insumoId, cantidad: String(i.cantidad) })) ?? [
      { insumoId: '', cantidad: '' },
    ]
  )

  const insumoPorId = useMemo(() => new Map(insumos.map((i) => [i.id, i])), [insumos])

  const costoTotal = ingredientes.reduce((acc, ing) => {
    const insumo = insumoPorId.get(ing.insumoId)
    const cantidad = parseFloat(ing.cantidad) || 0
    return acc + (insumo ? insumo.costoUnitario * cantidad : 0)
  }, 0)

  const costoPorPorcion = costoTotal / (parseFloat(porcionesBase) || 1)

  function agregarIngrediente() {
    setIngredientes((prev) => [...prev, { insumoId: '', cantidad: '' }])
  }

  function quitarIngrediente(index: number) {
    setIngredientes((prev) => prev.filter((_, i) => i !== index))
  }

  function actualizarIngrediente(index: number, campo: keyof IngredienteForm, valor: string) {
    setIngredientes((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [campo]: valor } : ing))
    )
  }

  function handleSubmit(formData: FormData) {
    setErrores({})
    setErrorGeneral(null)

    // Serializamos los ingredientes (array dinámico) como JSON dentro del FormData,
    // porque FormData nativo no soporta bien arrays de objetos anidados.
    const ingredientesLimpios = ingredientes
      .filter((i) => i.insumoId && i.cantidad)
      .map((i) => ({ insumoId: i.insumoId, cantidad: Number(i.cantidad) }))

    formData.set('ingredientes', JSON.stringify(ingredientesLimpios))

    startTransition(async () => {
      const resultado = receta
        ? await actualizarRecetaAction(receta.id, formData)
        : await crearRecetaAction(formData)

      if (!resultado.success) {
        if (resultado.fieldErrors) setErrores(resultado.fieldErrors)
        setErrorGeneral(resultado.error || 'Revisa los campos marcados.')
        return
      }

      router.push('/recetas')
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="codigo">Código</Label>
            <Input id="codigo" name="codigo" defaultValue={receta?.codigo} placeholder="REC-001" />
            {errores.codigo && <p className="text-xs text-red-600">{errores.codigo}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tipoServicio">Tipo de servicio</Label>
            <Select name="tipoServicio" defaultValue={receta?.tipoServicio ?? 'DESAYUNO'}>
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
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre de la receta</Label>
          <Input
            id="nombre"
            name="nombre"
            defaultValue={receta?.nombre}
            placeholder="Avena con pan y huevo"
          />
          {errores.nombre && <p className="text-xs text-red-600">{errores.nombre}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="porcionesBase">Porciones base (rendimiento)</Label>
            <Input
              id="porcionesBase"
              name="porcionesBase"
              type="number"
              min="1"
              value={porcionesBase}
              onChange={(e) => setPorcionesBase(e.target.value)}
            />
            {errores.porcionesBase && <p className="text-xs text-red-600">{errores.porcionesBase}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="precioPorcion">Precio de venta por porción (RD$)</Label>
            <Input
              id="precioPorcion"
              name="precioPorcion"
              type="number"
              step="0.01"
              min="0"
              defaultValue={receta?.precioPorcion}
            />
            {errores.precioPorcion && <p className="text-xs text-red-600">{errores.precioPorcion}</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Ingredientes</h2>
          <Button type="button" size="sm" variant="outline" onClick={agregarIngrediente}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Agregar ingrediente
          </Button>
        </div>

        <div className="space-y-2">
          {ingredientes.map((ing, index) => {
            const insumo = insumoPorId.get(ing.insumoId)
            const cantidad = parseFloat(ing.cantidad) || 0
            const subtotal = insumo ? insumo.costoUnitario * cantidad : 0

            return (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    value={ing.insumoId}
                    onValueChange={(v) => actualizarIngrediente(index, 'insumoId', v ?? '')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un insumo" />
                    </SelectTrigger>
                    <SelectContent>
                      {insumos.map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.nombre} ({i.unidadMedida})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="Cant."
                  className="w-24"
                  value={ing.cantidad}
                  onChange={(e) => actualizarIngrediente(index, 'cantidad', e.target.value)}
                />

                <span className="w-28 shrink-0 text-right text-sm text-slate-500">
                  {insumo ? formatoRD(subtotal) : '—'}
                </span>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 shrink-0"
                  onClick={() => quitarIngrediente(index)}
                  disabled={ingredientes.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )
          })}
        </div>

        {errores.ingredientes && <p className="mt-2 text-xs text-red-600">{errores.ingredientes}</p>}

        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <span className="text-sm text-slate-600">
            Costo total por lote ({porcionesBase || 0} porciones)
          </span>
          <span className="text-sm font-semibold text-slate-900">{formatoRD(costoTotal)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3">
          <span className="text-sm text-emerald-700">Costo estimado por porción</span>
          <span className="text-sm font-semibold text-emerald-700">{formatoRD(costoPorPorcion)}</span>
        </div>
      </div>

      {errorGeneral && <p className="text-sm text-red-600">{errorGeneral}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : receta ? 'Guardar cambios' : 'Crear receta'}
        </Button>
      </div>
    </form>
  )
}