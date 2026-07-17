// src/app/(dashboard)/usuarios/page.tsx
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { listarUsuarios } from '@/services/usuarios.service'
import { Button } from '@/components/ui/button'
import { ActivoToggle } from '@/components/usuarios/activo-toggle'
import { cn } from '@/lib/utils'

export default async function UsuariosPage() {
  const usuarios = await listarUsuarios()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500">{usuarios.length} usuario(s)</p>
        </div>
        <Link href="/usuarios/nuevo">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo usuario
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Último acceso</th>
              <th className="px-4 py-3 font-medium">Activo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link href={`/usuarios/${u.id}`} className="hover:underline">
                    {u.nombre}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {u.rol.nombre}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleDateString('es-DO') : '—'}
                </td>
                <td className="px-4 py-3">
                  <ActivoToggle id={u.id} activo={u.activo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}