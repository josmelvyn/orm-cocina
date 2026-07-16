// src/app/(dashboard)/facturacion/page.tsx
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { auth } from '@/lib/auth'
import { listarFacturas } from '@/services/facturacion.service'
import { Button } from '@/components/ui/button'
import { FacturaTable } from '@/components/facturacion/factura-table'

export default async function FacturacionPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const { estado } = await searchParams
  const session = await auth()
  const puedeEmitir = session?.user?.permisos?.includes('factura.emitir') ?? false

  const facturasRaw = await listarFacturas({ estado })

  const facturas = facturasRaw.map((f) => ({
    id: f.id,
    numeroFactura: f.numeroFactura,
    ncf: f.ncf,
    institucion: { nombre: f.institucion.nombre },
    fechaEmision: f.fechaEmision,
    total: Number(f.total),
    estado: f.estado,
    cantidadConduces: f.conduces.length,
  }))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Facturación</h1>
          <p className="text-sm text-slate-500">{facturas.length} factura(s)</p>
        </div>
        {puedeEmitir && (
          <Link href="/facturacion/nueva">
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Nueva factura
            </Button>
          </Link>
        )}
      </div>

      <FacturaTable facturas={facturas} />
    </div>
  )
}