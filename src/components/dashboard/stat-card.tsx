// src/components/dashboard/stat-card.tsx
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatCardProps = {
  titulo: string
  valor: string | number
  descripcion?: string
  icon: LucideIcon
  tono?: 'default' | 'alerta' | 'exito'
  href?: string
}

const TONOS: Record<NonNullable<StatCardProps['tono']>, string> = {
  default: 'bg-slate-50 text-slate-600',
  alerta: 'bg-amber-50 text-amber-600',
  exito: 'bg-emerald-50 text-emerald-600',
}

export function StatCard({
  titulo,
  valor,
  descripcion,
  icon: Icon,
  tono = 'default',
  href,
}: StatCardProps) {
  const contenido = (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{titulo}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{valor}</p>
          {descripcion && <p className="mt-1 text-xs text-slate-400">{descripcion}</p>}
        </div>
        <div className={cn('rounded-lg p-2.5', TONOS[tono])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block">
        {contenido}
      </a>
    )
  }

  return contenido
}