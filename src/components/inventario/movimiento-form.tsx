'use client'
// src/components/inventario/movimiento-form.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { registrarMovimientoAction } from '@/actions/inventario.actions'
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

type Insumo = { id: string; nombre: string; unidadMedida: string; codigo: string }

const TIPOS = [
  { valor: 'ENTRADA', label: 'Entrada (compra/recepción)' },
  { valor: 'SALIDA', label: 'Salida' },
  { valor: 'AJUSTE', label: 'Ajuste (fija el stock exacto)' },
  { valor: 'MERMA', label: 'Merma / pérdida' },
]

export function MovimientoForm({ insumos }: { insumos: Insumo[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tipo, setTipo] = useState<string | null>('ENTRADA')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  function handleSubmit(formData: FormData) {
    setErrores({})
    setErrorGeneral(null)
    setExito(false)

    startTransition(async () => {
      const resultado = await registrarMovimientoAction(formData)

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
      <h2 className="text-sm font-semibold text-slate-900">Registrar movimiento</h2>

      <div className="space-y-1.5">
        <Label htmlFor="insumoId">Insumo</Label>
        <Select name="insumoId">
          <SelectTrigger id="insumoId">
            <SelectValue placeholder="Selecciona un insumo" />
          </SelectTrigger>
          <SelectContent>
            {insumos.map((i) => (
              <SelectItem key={i.id} value={i.id}>
                {i.codigo} — {i.nombre} ({i.unidadMedida})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errores.insumoId && <p className="text-xs text-red-600">{errores.insumoId}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tipo">Tipo de movimiento</Label>
        <Select name="tipo" defaultValue="ENTRADA" onValueChange={setTipo}>
          <SelectTrigger id="tipo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIPOS.map((t) => (
              <SelectItem key={t.valor} value={t.valor}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cantidad">
          {tipo === 'AJUSTE' ? 'Nuevo stock exacto' : 'Cantidad'}
        </Label>
        <Input id="cantidad" name="cantidad" type="number" step="0.01" min="0.01" />
        {errores.cantidad && <p className="text-xs text-red-600">{errores.cantidad}</p>}
      </div>

      {tipo === 'ENTRADA' && (
        <div className="space-y-1.5">
          <Label htmlFor="costoUnitario">Costo unitario de esta entrada (opcional)</Label>
          <Input id="costoUnitario" name="costoUnitario" type="number" step="0.01" min="0" />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="motivo">Motivo / referencia</Label>
        <Textarea
          id="motivo"
          name="motivo"
          rows={2}
          placeholder="Ej: compra proveedor XYZ, factura #123"
        />
      </div>

      {errorGeneral && <p className="text-sm text-red-600">{errorGeneral}</p>}
      {exito && <p className="text-sm text-emerald-600">Movimiento registrado correctamente.</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Registrando...' : 'Registrar movimiento'}
      </Button>
    </form>
  )
}