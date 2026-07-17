// src/app/(dashboard)/reportes/relacion-general/pdf/route.tsx
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { auth } from '@/lib/auth'
import { reporteRelacionGeneral } from '@/services/reportes.service'
import { obtenerEmpresa } from '@/services/empresa.service'
import { RelacionGeneralPdf } from '@/lib/pdf/relacion-general-pdf'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.permisos?.includes('reporte.ver')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const desde = searchParams.get('desde') ?? undefined
  const hasta = searchParams.get('hasta') ?? undefined
  const institucionId = searchParams.get('institucionId') ?? undefined

  const [reporte, empresa] = await Promise.all([
    reporteRelacionGeneral({ desde, hasta, institucionId }),
    obtenerEmpresa(),
  ])

  const conduces = reporte.conduces.map((c) => ({
    fecha: new Date(c.fecha).toLocaleDateString('es-DO'),
    numero: c.numero,
    escuelaCodigo: c.escuelaCodigo,
    escuelaNombre: c.escuela,
    totalRaciones: c.totalRaciones,
  }))

  const desdeLabel = desde ? new Date(desde + 'T00:00:00').toLocaleDateString('es-DO') : '—'
  const hastaLabel = hasta ? new Date(hasta + 'T00:00:00').toLocaleDateString('es-DO') : '—'

  const buffer = await renderToBuffer(
    <RelacionGeneralPdf
      empresa={{
        nombre: empresa.nombre,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        email: empresa.email,
        rnc: empresa.rnc,
      }}
      desde={desdeLabel}
      hasta={hastaLabel}
      conduces={conduces}
      totalRaciones={reporte.totalRaciones}
    />
  )

 return new NextResponse(buffer as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="relacion-conduces-general.pdf"',
    },
  })
}