'use client'
// src/components/inventario/eliminar-insumo-button.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { desactivarInsumoAction } from '@/actions/inventario.actions'
import { Button } from '@/components/ui/button'

export function EliminarInsumoButton({ id, nombre }: { id: string; nombre: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmando, setConfirmando] = useState(false)

  function handleEliminar() {
    startTransition(async () => {
      await desactivarInsumoAction(id)
      router.push('/inventario')
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