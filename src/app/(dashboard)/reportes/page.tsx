// src/app/(dashboard)/reportes/page.tsx
import Link from 'next/link'
import { FileText, Globe, ListOrdered, Building2, Receipt } from 'lucide-react'

const REPORTES = [
  {
    href: '/reportes/conduces',
    icon: FileText,
    titulo: 'Reporte de conduces',
    descripcion: 'Listado detallado de todos los conduces emitidos, con filtros por escuela, institución y estado.',
  },
  {
    href: '/reportes/conduce-global',
    icon: Globe,
    titulo: 'Conduce global',
    descripcion: 'Totales consolidados de todos los centros: raciones y montos agrupados por servicio y estado.',
  },
  {
    href: '/reportes/relacion-general',
    icon: ListOrdered,
    titulo: 'Relación de conduce general',
    descripcion: 'Listado completo de conduces del período con el gran total acumulado al pie.',
  },
  {
    href: '/reportes/relacion-por-centro',
    icon: Building2,
    titulo: 'Relación de conduce por centro',
    descripcion: 'Mismo universo que la relación general, agrupado por escuela con subtotales.',
  },
  {
    href: '/reportes/facturas',
    icon: Receipt,
    titulo: 'Reporte de facturas',
    descripcion: 'Facturas emitidas por período e institución, con NCF y montos.',
  },
]

export default function ReportesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Reportería</h1>
        <p className="text-sm text-slate-500">Selecciona un reporte para consultarlo</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REPORTES.map((r) => {
          const Icon = r.icon
          return (
            <Link
              key={r.href}
              href={r.href}
              className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-slate-50 p-2.5 text-slate-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.titulo}</p>
                  <p className="mt-1 text-xs text-slate-500">{r.descripcion}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}