'use client'
// src/components/facturacion/marcar-pagada-button.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CircleDollarSign } from 'lucide-react'
import { marcarPagadaFacturaAction } from '@/actions/facturacion.actions'
import { Button } from '@/components/ui/button'

export function MarcarPagadaButton({ id }: { id: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const resultado = await marcarPagadaFacturaAction(id)
      if (!resultado.success) {
        setError(resultado.error || 'No se pudo marcar como pagada.')
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
        onClick={handleClick}
        disabled={isPending}
      >
        <CircleDollarSign className="mr-1.5 h-4 w-4" />
        {isPending ? 'Guardando...' : 'Marcar como pagada'}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}