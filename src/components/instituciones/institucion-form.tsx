'use client'
// src/components/instituciones/institucion-form.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearInstitucionAction, actualizarInstitucionAction } from '@/actions/instituciones.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type InstitucionExistente = {
  id: string
  nombre: string
  rnc: string
  direccion: string | null
  telefono: string | null
  email: string | null
}

export function InstitucionForm({ institucion }: { institucion?: InstitucionExistente }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setErrores({})
    setErrorGeneral(null)

    startTransition(async () => {
      const resultado = institucion
        ? await actualizarInstitucionAction(institucion.id, formData)
        : await crearInstitucionAction(formData)

      if (!resultado.success) {
        if (resultado.fieldErrors) setErrores(resultado.fieldErrors)
        if (resultado.error) setErrorGeneral(resultado.error)
        return
      }

      router.push('/instituciones')
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" defaultValue={institucion?.nombre} placeholder="Ministerio de Educación" />
        {errores.nombre && <p className="text-xs text-red-600">{errores.nombre}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rnc">RNC</Label>
        <Input id="rnc" name="rnc" defaultValue={institucion?.rnc} placeholder="401000000" />
        {errores.rnc && <p className="text-xs text-red-600">{errores.rnc}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="direccion">Dirección</Label>
        <Input id="direccion" name="direccion" defaultValue={institucion?.direccion ?? ''} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input id="telefono" name="telefono" defaultValue={institucion?.telefono ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" name="email" type="email" defaultValue={institucion?.email ?? ''} />
          {errores.email && <p className="text-xs text-red-600">{errores.email}</p>}
        </div>
      </div>

      {errorGeneral && <p className="text-sm text-red-600">{errorGeneral}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : institucion ? 'Guardar cambios' : 'Crear institución'}
        </Button>
      </div>
    </form>
  )
}