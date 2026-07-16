// src/app/(dashboard)/conduces/page.tsx
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { auth } from '@/lib/auth'
import { listarConduces } from '@/services/conduces.service'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { ConduceTable } from '@/components/conduces/conduce-table'
import { ConduceFiltros } from '@/components/conduces/conduce-filtros'

export default async function ConducesPage({
  searchParams,
}: {
  searchParams: Promise<{ escuelaId?: string; estado?: string; desde?: string; hasta?: string }>
}) {
  const { escuelaId, estado, desde, hasta } = await searchParams
  const session = await auth()
  const puedeCrear = session?.user?.permisos?.includes('conduce.crear') ?? false

  const [conducesRaw, escuelas] = await Promise.all([
    listarConduces({ escuelaId, estado, fechaInicio: desde, fechaFin: hasta }),
    prisma.escuela.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
  ])

  const conduces = conducesRaw.map((c) => ({
    id: c.id,
    numero: c.numero,
    fecha: c.fecha,
    tipoServicio: c.tipoServicio,
    estado: c.estado,
    escuela: { nombre: c.escuela.nombre },
    totalRaciones: c.detalles.reduce((acc, d) => acc + d.cantidad, 0),
    totalMonto: c.detalles.reduce((acc, d) => acc + Number(d.subtotal), 0),
  }))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Conduces</h1>
          <p className="text-sm text-slate-500">{conduces.length} conduce(s)</p>
        </div>
        {puedeCrear && (
          <Link href="/conduces/nuevo">
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Nuevo conduce
            </Button>
          </Link>
        )}
      </div>

      <ConduceFiltros escuelas={escuelas} />
      <div className="mt-4">
        <ConduceTable conduces={conduces} />
      </div>
    </div>
  )
}