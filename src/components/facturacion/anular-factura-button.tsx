'use client'
// src/components/facturacion/anular-factura-button.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Ban } from 'lucide-react'
import { anularFacturaAction } from '@/actions/facturacion.actions'
import { Button } from '@/components/ui/button'

export function AnularFacturaButton({ id, numero }: { id: string; numero: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAnular() {
    setError(null)
    startTransition(async () => {
      const resultado = await anularFacturaAction(id)
      if (!resultado.success) {
        setError(resultado.error || 'No se pudo anular.')
        return
      }
      router.refresh()
    })
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">
          ¿Anular {numero}? Los conduces volverán a estado EMITIDO.
        </span>
        <Button size="sm" variant="destructive" onClick={handleAnular} disabled={isPending}>
          {isPending ? 'Anulando...' : 'Sí, anular'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirmando(false)}>
          Cancelar
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      className="text-red-600 hover:bg-red-50 hover:text-red-700"
      onClick={() => setConfirmando(true)}
    >
      <Ban className="mr-1.5 h-4 w-4" />
      Anular
    </Button>
  )
}