'use client'
// src/components/roles/permisos-form.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { actualizarPermisosRolAction } from '@/actions/usuarios.actions'
import { Button } from '@/components/ui/button'

type Permiso = { id: string; codigo: string; modulo: string }
type GrupoPermiso = { modulo: string; permisos: Permiso[] }

export function PermisosForm({
  rolId,
  gruposPermisos,
  permisoIdsActuales,
}: {
  rolId: string
  gruposPermisos: GrupoPermiso[]
  permisoIdsActuales: string[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set(permisoIdsActuales))
  const [guardado, setGuardado] = useState(false)

  function toggle(id: string) {
    setGuardado(false)
    setSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleModulo(permisos: Permiso[]) {
    setGuardado(false)
    const todosMarcados = permisos.every((p) => seleccionados.has(p.id))
    setSeleccionados((prev) => {
      const next = new Set(prev)
      permisos.forEach((p) => (todosMarcados ? next.delete(p.id) : next.add(p.id)))
      return next
    })
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const resultado = await actualizarPermisosRolAction(rolId, formData)
      if (resultado.success) {
        setGuardado(true)
        router.refresh()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {seleccionados.size > 0 &&
        [...seleccionados].map((id) => (
          <input key={id} type="hidden" name="permisoIds" value={id} />
        ))}

      <div className="space-y-3">
        {gruposPermisos.map((grupo) => {
          const todosMarcados = grupo.permisos.every((p) => seleccionados.has(p.id))
          return (
            <div key={grupo.modulo} className="rounded-xl border border-slate-200 bg-white p-4">
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={todosMarcados}
                  onChange={() => toggleModulo(grupo.permisos)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                {grupo.modulo}
              </label>
              <div className="ml-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {grupo.permisos.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={seleccionados.has(p.id)}
                      onChange={() => toggle(p.id)}
                      className="h-3.5 w-3.5 rounded border-slate-300"
                    />
                    {p.codigo}
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-end gap-3">
        {guardado && <span className="text-sm text-emerald-600">Permisos actualizados.</span>}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar permisos'}
        </Button>
      </div>
    </form>
  )
}