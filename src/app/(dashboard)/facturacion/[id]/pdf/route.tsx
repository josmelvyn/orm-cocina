// src/app/(dashboard)/facturacion/[id]/pdf/route.tsx
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { auth } from '@/lib/auth'
import { obtenerFactura } from '@/services/facturacion.service'
import { obtenerEmpresa } from '@/services/empresa.service'
import { FacturaPdf } from '@/lib/pdf/factura-pdf'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.permisos?.includes('factura.imprimir')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const [factura, empresa] = await Promise.all([
    obtenerFactura(id).catch(() => null),
    obtenerEmpresa(),
  ])

  if (!factura) {
    return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
  }

  const totalRaciones = factura.conduces.reduce(
    (acc, c) => acc + c.detalles.reduce((a, d) => a + d.cantidad, 0),
    0
  )
  const subtotal = Number(factura.subtotal)
  const precioUnitario = totalRaciones > 0 ? subtotal / totalRaciones : 0

  const numerosConduce = factura.conduces.map((c) => c.numero).sort()
  const primerConduce = numerosConduce[0] ?? '—'
  const ultimoConduce = numerosConduce[numerosConduce.length - 1] ?? '—'

  const mesFactura = MESES[new Date(factura.periodoFin).getMonth()]
  const anioFactura = new Date(factura.periodoFin).getFullYear()
  const periodoLabel = `${new Date(factura.periodoInicio).toLocaleDateString('es-DO')} a ${new Date(factura.periodoFin).toLocaleDateString('es-DO')} / ${mesFactura} ${anioFactura}`

  const buffer = await renderToBuffer(
    <FacturaPdf
      numeroFactura={factura.numeroFactura}
      ncf={factura.ncf}
      ncfValidoHasta={
        factura.ncfValidoHasta ? new Date(factura.ncfValidoHasta).toLocaleDateString('es-DO') : null
      }
      fechaEmision={new Date(factura.fechaEmision).toLocaleDateString('es-DO')}
      periodoInicio={new Date(factura.periodoInicio).toLocaleDateString('es-DO')}
      periodoFin={new Date(factura.periodoFin).toLocaleDateString('es-DO')}
      periodoLabel={periodoLabel}
      institucion={{ nombre: factura.institucion.nombre, rnc: factura.institucion.rnc }}
      empresa={{
        nombre: empresa.nombre,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        email: empresa.email,
        rnc: empresa.rnc,
      }}
      cantidadConduces={factura.conduces.length}
      primerConduce={primerConduce}
      ultimoConduce={ultimoConduce}
      totalRaciones={totalRaciones}
      precioUnitario={precioUnitario}
      subtotal={subtotal}
      itbis={Number(factura.itbis)}
      total={Number(factura.total)}
    />
  )

  return new NextResponse(buffer as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${factura.numeroFactura}.pdf"`,
    },
  })
}