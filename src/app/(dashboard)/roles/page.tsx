// src/app/(dashboard)/roles/page.tsx
import { listarRoles } from '@/services/usuarios.service'
import Link from 'next/link'

export default async function RolesPage() {
  const roles = await listarRoles()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Roles</h1>
        <p className="text-sm text-slate-500">Gestiona los permisos de cada rol del sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <Link
            key={r.id}
            href={`/roles/${r.id}`}
            className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-900">{r.nombre}</p>
            <p className="mt-1 text-xs text-slate-500">{r.descripcion}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
              <span>{r.permisos.length} permiso(s)</span>
              <span>·</span>
              <span>{r._count.usuarios} usuario(s)</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}