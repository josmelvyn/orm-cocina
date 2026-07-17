// src/app/(dashboard)/instituciones/page.tsx
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { listarInstituciones } from '@/services/instituciones.service'
import { Button } from '@/components/ui/button'

export default async function InstitucionesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const instituciones = await listarInstituciones({ busqueda: q })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Instituciones</h1>
          <p className="text-sm text-slate-500">{instituciones.length} institución(es)</p>
        </div>
        <Link href="/instituciones/nueva">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva institución
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">RNC</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 text-right font-medium">Escuelas</th>
              <th className="px-4 py-3 text-right font-medium">Facturas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {instituciones.map((i) => (
              <tr key={i.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link href={`/instituciones/${i.id}`} className="hover:underline">
                    {i.nombre}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{i.rnc}</td>
                <td className="px-4 py-3 text-slate-500">{i.email ?? '—'}</td>
                <td className="px-4 py-3 text-right text-slate-500">{i._count.escuelas}</td>
                <td className="px-4 py-3 text-right text-slate-500">{i._count.facturas}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {instituciones.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-500">No hay instituciones registradas.</p>
        )}
      </div>
    </div>
  )
}