// src/components/layout/sidebar.tsx
import { auth } from '@/lib/auth'
import { filtrarMenu } from '@/lib/filtrar-menu'
import { SidebarNav } from '@/components/sidebar-nav'
import { LogoutButton } from '@/components/logout-button'

export async function Sidebar() {
  const session = await auth()

  const permisosUsuario = session?.user?.permisos ?? []
  const menuVisible = filtrarMenu(permisosUsuario)

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <span className="text-sm font-semibold text-slate-900">Cocina Industrial</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav items={menuVisible} />
      </div>

      <div className="border-t border-slate-200 p-4">
        <p className="mb-2 truncate text-xs text-slate-500">
          {session?.user?.name} · <span className="font-medium">{session?.user?.rol}</span>
        </p>
        <LogoutButton />
      </div>
    </aside>
  )
}