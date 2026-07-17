'use client'
// src/components/configuracion/empresa-form.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { actualizarEmpresaAction } from '@/actions/empresa.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Empresa = { nombre: string; direccion: string; telefono: string; email: string | null; rnc: string }

export function EmpresaForm({ empresa }: { empresa: Empresa }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [exito, setExito] = useState(false)

  function handleSubmit(formData: FormData) {
    setErrores({})
    setExito(false)

    startTransition(async () => {
      const resultado = await actualizarEmpresaAction(formData)
      if (!resultado.success) {
        if (resultado.fieldErrors) setErrores(resultado.fieldErrors)
        return
      }
      setExito(true)
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre / Razón social</Label>
        <Input id="nombre" name="nombre" defaultValue={empresa.nombre} />
        {errores.nombre && <p className="text-xs text-red-600">{errores.nombre}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="direccion">Dirección</Label>
        <Input id="direccion" name="direccion" defaultValue={empresa.direccion} />
        {errores.direccion && <p className="text-xs text-red-600">{errores.direccion}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input id="telefono" name="telefono" defaultValue={empresa.telefono} />
          {errores.telefono && <p className="text-xs text-red-600">{errores.telefono}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" name="email" type="email" defaultValue={empresa.email ?? ''} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rnc">RNC</Label>
        <Input id="rnc" name="rnc" defaultValue={empresa.rnc} />
        {errores.rnc && <p className="text-xs text-red-600">{errores.rnc}</p>}
      </div>

      {exito && <p className="text-sm text-emerald-600">Datos actualizados correctamente.</p>}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}