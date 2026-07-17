'use client'
// src/components/inventario/insumo-form.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearInsumoAction, actualizarInsumoAction } from '@/actions/inventario.actions'
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

type Categoria = { id: string; nombre: string }

type InsumoExistente = {
  id: string
  codigo: string
  nombre: string
  categoriaId: string | null
  unidadMedida: string
  stockMinimo: unknown
  costoUnitario: unknown
}

const UNIDADES = ['lb', 'kg', 'g', 'litro', 'ml', 'unidad', 'galón', 'caja', 'saco']

export function InsumoForm({
  categorias,
  insumo,
}: {
  categorias: Categoria[]
  insumo?: InsumoExistente
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setErrores({})
    setErrorGeneral(null)

    startTransition(async () => {
      const resultado = insumo
        ? await actualizarInsumoAction(insumo.id, formData)
        : await crearInsumoAction(formData)

      if (!resultado.success) {
        if (resultado.fieldErrors) setErrores(resultado.fieldErrors)
        if (resultado.error) setErrorGeneral(resultado.error)
        return
      }

      router.push('/inventario')
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="codigo">Código</Label>
          <Input id="codigo" name="codigo" defaultValue={insumo?.codigo} placeholder="INS-002" />
          {errores.codigo && <p className="text-xs text-red-600">{errores.codigo}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="unidadMedida">Unidad de medida</Label>
          <Select name="unidadMedida" defaultValue={insumo?.unidadMedida}>
            <SelectTrigger id="unidadMedida">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {UNIDADES.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errores.unidadMedida && <p className="text-xs text-red-600">{errores.unidadMedida}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" defaultValue={insumo?.nombre} placeholder="Arroz" />
        {errores.nombre && <p className="text-xs text-red-600">{errores.nombre}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="categoriaId">Categoría</Label>
        <Select name="categoriaId" defaultValue={insumo?.categoriaId ?? undefined}>
          <SelectTrigger id="categoriaId">
            <SelectValue placeholder="Selecciona una categoría" >
              {(value: string) => categorias.find((e) => e.id === value)?.nombre}
              </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="stockMinimo">Stock mínimo</Label>
          <Input
            id="stockMinimo"
            name="stockMinimo"
            type="number"
            step="0.01"
            min="0"
            defaultValue={insumo ? String(insumo.stockMinimo) : '0'}
          />
          {errores.stockMinimo && <p className="text-xs text-red-600">{errores.stockMinimo}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="costoUnitario">Costo unitario (RD$)</Label>
          <Input
            id="costoUnitario"
            name="costoUnitario"
            type="number"
            step="0.01"
            min="0"
            defaultValue={insumo ? String(insumo.costoUnitario) : '0'}
          />
          {errores.costoUnitario && (
            <p className="text-xs text-red-600">{errores.costoUnitario}</p>
          )}
        </div>
      </div>

      {!insumo && (
        <p className="text-xs text-slate-400">
          El stock inicial se registra en 0. Usa "Registrar movimiento" luego para ingresar existencias.
        </p>
      )}

      {errorGeneral && <p className="text-sm text-red-600">{errorGeneral}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : insumo ? 'Guardar cambios' : 'Crear insumo'}
        </Button>
      </div>
    </form>
  )
}