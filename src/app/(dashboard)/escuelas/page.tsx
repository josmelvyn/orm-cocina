// src/app/(dashboard)/escuelas/page.tsx
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { listarEscuelas } from '@/services/escuelas.service'
import { Button } from '@/components/ui/button'

export default async function EscuelasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const escuelas = await listarEscuelas({ busqueda: q })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Escuelas</h1>
          <p className="text-sm text-slate-500">{escuelas.length} escuela(s)</p>
        </div>
        <Link href="/escuelas/nueva">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva escuela
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Institución</th>
              <th className="px-4 py-3 font-medium">Encargado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {escuelas.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{e.codigo}</td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link href={`/escuelas/${e.id}`} className="hover:underline">
                    {e.nombre}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{e.institucion.nombre}</td>
                <td className="px-4 py-3 text-slate-500">{e.encargado ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {escuelas.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-500">No hay escuelas registradas.</p>
        )}
      </div>
    </div>
  )
}