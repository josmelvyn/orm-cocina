// src/app/(dashboard)/facturacion/nueva/page.tsx
import { prisma } from '@/lib/prisma'
import { FacturaForm } from '@/components/facturacion/factura-form'

export default async function NuevaFacturaPage() {
  const instituciones = await prisma.institucion.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
  })

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Nueva factura</h1>
      <FacturaForm instituciones={instituciones} />
    </div>
  )
}