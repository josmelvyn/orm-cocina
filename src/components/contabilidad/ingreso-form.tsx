'use client'
// src/components/contabilidad/ingreso-form.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearIngresoManualAction } from '@/actions/contabilidad.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export function IngresoForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  function handleSubmit(formData: FormData) {
    setErrores({})
    setErrorGeneral(null)
    setExito(false)

    startTransition(async () => {
      const resultado = await crearIngresoManualAction(formData)
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
      <h2 className="text-sm font-semibold text-slate-900">Registrar ingreso manual</h2>
      <p className="text-xs text-slate-400">
        Usa esto solo para ingresos que no vienen de una factura (donaciones, subvenciones, otros).
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="fecha">Fecha</Label>
        <Input id="fecha" name="fecha" type="date" defaultValue={hoyISO()} />
        {errores.fecha && <p className="text-xs text-red-600">{errores.fecha}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="concepto">Concepto</Label>
        <Input id="concepto" name="concepto" placeholder="Ej: Donación fundación XYZ" />
        {errores.concepto && <p className="text-xs text-red-600">{errores.concepto}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="monto">Monto (RD$)</Label>
        <Input id="monto" name="monto" type="number" step="0.01" min="0" />
        {errores.monto && <p className="text-xs text-red-600">{errores.monto}</p>}
      </div>

      {errorGeneral && <p className="text-sm text-red-600">{errorGeneral}</p>}
      {exito && <p className="text-sm text-emerald-600">Ingreso registrado correctamente.</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Registrar ingreso'}
      </Button>
    </form>
  )
}