// src/app/(dashboard)/instituciones/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { obtenerInstitucion } from '@/services/instituciones.service'
import { InstitucionForm } from '@/components/instituciones/institucion-form'
import { EliminarInstitucionButton } from '@/components/instituciones/eliminar-institucion-button'

export default async function EditarInstitucionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const institucion = await obtenerInstitucion(id).catch(() => null)

  if (!institucion) notFound()

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Editar institución</h1>
        <EliminarInstitucionButton id={institucion.id} nombre={institucion.nombre} />
      </div>

      <InstitucionForm institucion={institucion} />

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Escuelas bajo esta institución ({institucion.escuelas.length})
        </h2>
        {institucion.escuelas.length === 0 ? (
          <p className="text-sm text-slate-400">No hay escuelas registradas todavía.</p>
        ) : (
          <ul className="space-y-1">
            {institucion.escuelas.map((e) => (
              <li key={e.id}>
                <Link href={`/escuelas/${e.id}`} className="text-sm text-slate-700 hover:underline">
                  {e.codigo} — {e.nombre}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}