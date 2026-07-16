'use client'
// src/components/layout/sidebar-nav.tsx

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  ChefHat,
  School,
  Building2,
  FileText,
  Receipt,
  BarChart3,
  Users,
  ShieldCheck,
} from "lucide-react";
import type { MenuItem } from '@/lib/menu-config'


const icons = {
  dashboard: LayoutDashboard,
  package: Package,
  chef: ChefHat,
  school: School,
  building: Building2,
  file: FileText,
  receipt: Receipt,
  report: BarChart3,
  users: Users,
  shield: ShieldCheck,
} as const;


export function SidebarNav({ items }: { items: MenuItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <SidebarItem key={item.href} item={item} pathname={pathname} />
      ))}
    </nav>
  )
}

function SidebarItem({ item, pathname }: { item: MenuItem; pathname: string }) {
  const tieneHijos = item.hijos && item.hijos.length > 0
  const activo = pathname === item.href || pathname.startsWith(item.href + '/')
  const [abierto, setAbierto] = useState(activo)
  
const Icon = icons[item.icon as keyof typeof icons];

  if (!tieneHijos) {
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          activo
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.label}
      </Link>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          activo ? 'text-emerald-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', abierto && 'rotate-180')}
        />
      </button>

      {abierto && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-3.5">
          {item.hijos!.map((hijo) => {
            const hijoActivo = pathname === hijo.href
            return (
              <Link
                key={hijo.href}
                href={hijo.href}
                className={cn(
                  'block rounded-md px-3 py-1.5 text-sm transition-colors',
                  hijoActivo
                    ? 'bg-emerald-50 font-medium text-emerald-700'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {hijo.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}