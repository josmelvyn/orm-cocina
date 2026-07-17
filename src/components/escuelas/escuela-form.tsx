'use client'
// src/components/escuelas/escuela-form.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearEscuelaAction, actualizarEscuelaAction } from '@/actions/escuelas.actions'
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

type Institucion = { id: string; nombre: string }

type EscuelaExistente = {
  id: string
  codigo: string
  nombre: string
  direccion: string | null
  telefono: string | null
  encargado: string | null
  director: string | null
  provincia: string | null
  ruta: string | null
  regionalDistrito: string | null
  institucionId: string
}

export function EscuelaForm({
  instituciones,
  escuela,
}: {
  instituciones: Institucion[]
  escuela?: EscuelaExistente
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setErrores({})
    setErrorGeneral(null)

    startTransition(async () => {
      const resultado = escuela
        ? await actualizarEscuelaAction(escuela.id, formData)
        : await crearEscuelaAction(formData)

      if (!resultado.success) {
        if (resultado.fieldErrors) setErrores(resultado.fieldErrors)
        if (resultado.error) setErrorGeneral(resultado.error)
        return
      }

      router.push('/escuelas')
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="codigo">Código</Label>
          <Input id="codigo" name="codigo" defaultValue={escuela?.codigo} placeholder="ESC-002" />
          {errores.codigo && <p className="text-xs text-red-600">{errores.codigo}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="institucionId">Institución</Label>
          <Select name="institucionId" defaultValue={escuela?.institucionId}>
            <SelectTrigger id="institucionId">
              <SelectValue placeholder="Selecciona una institución">
                {(value: string) => instituciones.find((e) => e.id === value)?.nombre }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {instituciones.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errores.institucionId && <p className="text-xs text-red-600">{errores.institucionId}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" defaultValue={escuela?.nombre} placeholder="Escuela Primaria..." />
        {errores.nombre && <p className="text-xs text-red-600">{errores.nombre}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="direccion">Dirección</Label>
        <Input id="direccion" name="direccion" defaultValue={escuela?.direccion ?? ''} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input id="telefono" name="telefono" defaultValue={escuela?.telefono ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="encargado">Encargado (interno)</Label>
          <Input id="encargado" name="encargado" defaultValue={escuela?.encargado ?? ''} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
        <p className="mb-3 text-xs font-medium uppercase text-slate-500">
          Datos para el conduce oficial
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="director">Director del centro</Label>
            <Input id="director" name="director" defaultValue={escuela?.director ?? ''} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="provincia">Provincia o municipio</Label>
            <Input id="provincia" name="provincia" defaultValue={escuela?.provincia ?? ''} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ruta">Ruta</Label>
            <Input id="ruta" name="ruta" placeholder="A - San Francisco" defaultValue={escuela?.ruta ?? ''} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="regionalDistrito">Regional/Distrito</Label>
            <Input
              id="regionalDistrito"
              name="regionalDistrito"
              placeholder="07/05"
              defaultValue={escuela?.regionalDistrito ?? ''}
            />
          </div>
        </div>
      </div>

      {errorGeneral && <p className="text-sm text-red-600">{errorGeneral}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : escuela ? 'Guardar cambios' : 'Crear escuela'}
        </Button>
      </div>
    </form>
  )
}