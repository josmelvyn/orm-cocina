'use client'
// src/components/usuarios/usuario-form.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearUsuarioAction, actualizarUsuarioAction } from '@/actions/usuarios.actions'
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

type Rol = { id: string; nombre: string }

type UsuarioExistente = {
  id: string
  nombre: string
  email: string
  rolId: string
}

export function UsuarioForm({ roles, usuario }: { roles: Rol[]; usuario?: UsuarioExistente }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setErrores({})
    setErrorGeneral(null)

    startTransition(async () => {
      const resultado = usuario
        ? await actualizarUsuarioAction(usuario.id, formData)
        : await crearUsuarioAction(formData)

      if (!resultado.success) {
        if (resultado.fieldErrors) setErrores(resultado.fieldErrors)
        if (resultado.error) setErrorGeneral(resultado.error)
        return
      }

      router.push('/usuarios')
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input id="nombre" name="nombre" defaultValue={usuario?.nombre} />
        {errores.nombre && <p className="text-xs text-red-600">{errores.nombre}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" defaultValue={usuario?.email} />
        {errores.email && <p className="text-xs text-red-600">{errores.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rolId">Rol</Label>
        <Select name="rolId" defaultValue={usuario?.rolId}>
          <SelectTrigger id="rolId">
            <SelectValue placeholder="Selecciona un rol" >
              {(value: string) => roles.find ((e) => e.id)?.nombre}
              </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errores.rolId && <p className="text-xs text-red-600">{errores.rolId}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">
          {usuario ? 'Nueva contraseña (dejar vacío para no cambiarla)' : 'Contraseña'}
        </Label>
        <Input id="password" name="password" type="password" />
        {errores.password && <p className="text-xs text-red-600">{errores.password}</p>}
      </div>

      {errorGeneral && <p className="text-sm text-red-600">{errorGeneral}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : usuario ? 'Guardar cambios' : 'Crear usuario'}
        </Button>
      </div>
    </form>
  )
}