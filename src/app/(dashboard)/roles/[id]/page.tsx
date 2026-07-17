// src/app/(dashboard)/roles/[id]/page.tsx
import { notFound } from 'next/navigation'
import { obtenerRol, listarPermisosAgrupados } from '@/services/usuarios.service'
import { PermisosForm } from '@/components/roles/permisos-form'

export default async function EditarRolPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [rol, gruposPermisos] = await Promise.all([
    obtenerRol(id).catch(() => null),
    listarPermisosAgrupados(),
  ])

  if (!rol) notFound()

  const permisoIdsActuales = new Set(rol.permisos.map((p) => p.id))

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Permisos de {rol.nombre}</h1>
        <p className="text-sm text-slate-500">{rol.descripcion}</p>
      </div>

      <PermisosForm
        rolId={rol.id}
        gruposPermisos={gruposPermisos}
        permisoIdsActuales={[...permisoIdsActuales]}
      />
    </div>
  )
}