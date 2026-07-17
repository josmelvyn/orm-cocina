// src/app/(dashboard)/conduces/[id]/pdf/route.tsx
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { auth } from '@/lib/auth'
import { obtenerConduce } from '@/services/conduces.service'
import { obtenerEmpresa } from '@/services/empresa.service'
import { ConducePdf } from '@/lib/pdf/conduce-pdf'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.permisos?.includes('conduce.imprimir')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const [conduce, empresa] = await Promise.all([
    obtenerConduce(id).catch(() => null),
    obtenerEmpresa(),
  ])

  if (!conduce) {
    return NextResponse.json({ error: 'Conduce no encontrado' }, { status: 404 })
  }

  const descripcionProductos = conduce.detalles.map((d) => d.receta.nombre).join(', ')
  const totalRaciones = Math.max(...conduce.detalles.map((d) => d.cantidad), 0)

  const buffer = await renderToBuffer(
    <ConducePdf
      numero={conduce.numero}
      fecha={new Date(conduce.fecha).toLocaleDateString('es-DO')}
      estado={conduce.estado}
      empresa={{
        nombre: empresa.nombre,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        email: empresa.email,
        rnc: empresa.rnc,
      }}
      escuela={{
        nombre: conduce.escuela.nombre,
        direccion: conduce.escuela.direccion,
        director: conduce.escuela.director,
        provincia: conduce.escuela.provincia,
        ruta: conduce.escuela.ruta,
        codigo: conduce.escuela.codigo,
        telefono: conduce.escuela.telefono,
        regionalDistrito: conduce.escuela.regionalDistrito,
      }}
      descripcionProductos={descripcionProductos}
      postre={conduce.postre}
      totalRaciones={totalRaciones}
      observaciones={conduce.observaciones}
      nombreRecibe={conduce.nombreRecibe}
      fechaRecepcion={
        conduce.fechaRecepcion ? new Date(conduce.fechaRecepcion).toLocaleDateString('es-DO') : null
      }
      horaRecepcion={conduce.horaRecepcion}
    />
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${conduce.numero}.pdf"`,
    },
  })
}