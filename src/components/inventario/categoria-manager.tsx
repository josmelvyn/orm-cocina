'use client'
// src/components/inventario/categoria-manager.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import {
  crearCategoriaAction,
  actualizarCategoriaAction,
  eliminarCategoriaAction,
} from '@/actions/inventario.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Categoria = { id: string; nombre: string; totalInsumos: number }

export function CategoriaManager({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter()
  const [creando, setCreando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCrear(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const resultado = await crearCategoriaAction(formData)
      if (!resultado.success) {
        setError(resultado.error || resultado.fieldErrors?.nombre || 'Error al crear')
        return
      }
      setCreando(false)
      router.refresh()
    })
  }

  function handleActualizar(id: string, formData: FormData) {
    setError(null)
    startTransition(async () => {
      const resultado = await actualizarCategoriaAction(id, formData)
      if (!resultado.success) {
        setError(resultado.error || resultado.fieldErrors?.nombre || 'Error al actualizar')
        return
      }
      setEditandoId(null)
      router.refresh()
    })
  }

  function handleEliminar(id: string) {
    setError(null)
    startTransition(async () => {
      const resultado = await eliminarCategoriaAction(id)
      if (!resultado.success) {
        setError(resultado.error || 'Error al eliminar')
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="divide-y divide-slate-100">
        {categorias.map((cat) =>
          editandoId === cat.id ? (
            <form
              key={cat.id}
              action={(fd) => handleActualizar(cat.id, fd)}
              className="flex items-center gap-2 px-4 py-3"
            >
              <Input name="nombre" defaultValue={cat.nombre} autoFocus className="h-8" />
              <Button type="submit" size="icon" variant="ghost" className="h-8 w-8" disabled={isPending}>
                <Check className="h-4 w-4 text-emerald-600" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setEditandoId(null)}
              >
                <X className="h-4 w-4 text-slate-400" />
              </Button>
            </form>
          ) : (
            <div key={cat.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{cat.nombre}</p>
                <p className="text-xs text-slate-400">{cat.totalInsumos} insumo(s)</p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setEditandoId(cat.id)}
                >
                  <Pencil className="h-3.5 w-3.5 text-slate-500" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  disabled={isPending}
                  onClick={() => handleEliminar(cat.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            </div>
          )
        )}

        {categorias.length === 0 && !creando && (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            No hay categorías todavía.
          </p>
        )}
      </div>

      <div className="border-t border-slate-100 p-4">
        {creando ? (
          <form action={handleCrear} className="flex items-center gap-2">
            <Input name="nombre" autoFocus placeholder="Nombre de la categoría" className="h-8" />
            <Button type="submit" size="sm" disabled={isPending}>
              Guardar
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setCreando(false)}>
              Cancelar
            </Button>
          </form>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setCreando(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nueva categoría
          </Button>
        )}
      </div>

      {error && <p className="border-t border-slate-100 px-4 py-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}