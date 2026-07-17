'use client'
// src/components/instituciones/eliminar-institucion-button.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { desactivarInstitucionAction } from '@/actions/instituciones.actions'
import { Button } from '@/components/ui/button'

export function EliminarInstitucionButton({ id, nombre }: { id: string; nombre: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleEliminar() {
    setError(null)
    startTransition(async () => {
      const resultado = await desactivarInstitucionAction(id)
      if (!resultado.success) {
        setError(resultado.error || 'No se pudo desactivar.')
        return
      }
      router.push('/instituciones')
      router.refresh()
    })
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500">¿Desactivar "{nombre}"?</span>
        <Button size="sm" variant="destructive" onClick={handleEliminar} disabled={isPending}>
          {isPending ? 'Desactivando...' : 'Sí, desactivar'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirmando(false)}>
          Cancelar
        </Button>
        {error && <p className="text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-red-600 hover:bg-red-50 hover:text-red-700"
      onClick={() => setConfirmando(true)}
    >
      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
      Desactivar
    </Button>
  )
}