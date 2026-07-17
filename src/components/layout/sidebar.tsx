// src/components/layout/sidebar.tsx
import { auth } from '@/lib/auth'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { LogoutButton } from '@/components/layout/logout-button'

export async function Sidebar() {
  const session = await auth()

  // Solo mandamos datos planos (strings) al client component. Los íconos de
  // lucide-react son objetos React (no serializables), así que el filtrado
  // del menú (que decide qué ícono usar) debe ocurrir DENTRO del client
  // component, no aquí en el servidor.
  const permisosUsuario = session?.user?.permisos ?? []

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <span className="text-sm font-semibold text-slate-900">Cocina Industrial</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav permisos={permisosUsuario} />
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