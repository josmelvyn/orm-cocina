'use client'
// src/components/contabilidad/gasto-form.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearGastoAction } from '@/actions/contabilidad.actions'
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

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Cheque', 'Tarjeta']

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export function GastoForm({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [categoriaId, setCategoriaId] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  function handleSubmit(formData: FormData) {
    setErrores({})
    setErrorGeneral(null)
    setExito(false)

    startTransition(async () => {
      const resultado = await crearGastoAction(formData)
      if (!resultado.success) {
        if (resultado.fieldErrors) setErrores(resultado.fieldErrors)
        if (resultado.error) setErrorGeneral(resultado.error)
        return
      }
      setExito(true)
      router.refresh()
    })
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
    >
      <h2 className="text-sm font-semibold text-slate-900">Registrar gasto</h2>

      <div className="space-y-1.5">
        <Label htmlFor="fecha">Fecha</Label>
        <Input id="fecha" name="fecha" type="date" defaultValue={hoyISO()} />
        {errores.fecha && <p className="text-xs text-red-600">{errores.fecha}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="categoriaId">Categoría</Label>
        <Select
          name="categoriaId"
          value={categoriaId}
          onValueChange={(v) => setCategoriaId(v ?? '')}
        >
          <SelectTrigger id="categoriaId">
            <SelectValue placeholder="Selecciona una categoría">
              {() => categorias.find((c) => c.id === categoriaId)?.nombre}
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
        {errores.categoriaId && <p className="text-xs text-red-600">{errores.categoriaId}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descripcion">Descripción</Label>
        <Input id="descripcion" name="descripcion" placeholder="Ej: Compra de gas para cocina" />
        {errores.descripcion && <p className="text-xs text-red-600">{errores.descripcion}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="monto">Monto (RD$)</Label>
        <Input id="monto" name="monto" type="number" step="0.01" min="0" />
        {errores.monto && <p className="text-xs text-red-600">{errores.monto}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="metodoPago">Método de pago</Label>
        <Select name="metodoPago" defaultValue="Efectivo">
          <SelectTrigger id="metodoPago">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METODOS_PAGO.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comprobante">No. de comprobante (opcional)</Label>
        <Input id="comprobante" name="comprobante" placeholder="Factura del proveedor" />
      </div>

      {errorGeneral && <p className="text-sm text-red-600">{errorGeneral}</p>}
      {exito && <p className="text-sm text-emerald-600">Gasto registrado correctamente.</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Registrar gasto'}
      </Button>
    </form>
  )
}