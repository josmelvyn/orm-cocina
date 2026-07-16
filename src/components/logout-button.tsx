'use client'
// src/components/layout/logout-button.tsx

import { LogOut } from 'lucide-react'
import { cerrarSesion } from '@/actions/auth.actions'

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => cerrarSesion()}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </button>
  )
}