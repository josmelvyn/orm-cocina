'use client'
// src/components/usuarios/activo-toggle.tsx

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { alternarActivoUsuarioAction } from '@/actions/usuarios.actions'
import { cn } from '@/lib/utils'

export function ActivoToggle({ id, activo }: { id: string; activo: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      const resultado = await alternarActivoUsuarioAction(id, !activo)
      if (resultado.success) router.refresh()
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        activo ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
      )}
    >
      {activo ? 'Activo' : 'Inactivo'}
    </button>
  )
}