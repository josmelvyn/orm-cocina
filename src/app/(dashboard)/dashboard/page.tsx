// src/app/(dashboard)/dashboard/page.tsx
import { FileText, AlertTriangle, Package, School, ChefHat, Receipt } from 'lucide-react'
import { auth } from '@/lib/auth'
import { obtenerResumenDashboard } from '@/services/dashboard.service'
import { StatCard } from '@/components/dashboard/stat-card'
import { tieneAlgunPermiso } from '@/lib/permisos'

function formatoRD(valor: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}

export default async function DashboardPage() {
  const session = await auth()
  const permisos = session?.user?.permisos ?? []
  const resumen = await obtenerResumenDashboard()

  const puedeVerConduces = tieneAlgunPermiso(permisos, ['conduce.ver'])
  const puedeVerInventario = tieneAlgunPermiso(permisos, ['inventario.ver'])
  const puedeVerFacturas = tieneAlgunPermiso(permisos, ['factura.ver'])
  const puedeVerEscuelas = tieneAlgunPermiso(permisos, ['escuela.ver'])
  const puedeVerRecetas = tieneAlgunPermiso(permisos, ['receta.ver'])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          Hola, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500">
          Resumen general del sistema · {new Date().toLocaleDateString('es-DO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {puedeVerConduces && (
          <StatCard
            titulo="Conduces del mes"
            valor={resumen.conducesDelMes}
            descripcion="Emitidos en el mes actual"
            icon={FileText}
            href="/conduces"
          />
        )}

        {puedeVerConduces && (
          <StatCard
            titulo="Pendientes de facturar"
            valor={resumen.conducesPendientesFacturar}
            descripcion="Conduces sin incluir en factura"
            icon={AlertTriangle}
            tono={resumen.conducesPendientesFacturar > 0 ? 'alerta' : 'default'}
            href="/conduces?estado=EMITIDO"
          />
        )}

        {puedeVerFacturas && (
          <StatCard
            titulo="Facturado este mes"
            valor={formatoRD(resumen.totalFacturadoMes)}
            descripcion={`${resumen.facturasDelMes} factura(s) emitidas`}
            icon={Receipt}
            tono="exito"
            href="/facturacion"
          />
        )}

        {puedeVerInventario && (
          <StatCard
            titulo="Insumos con stock bajo"
            valor={resumen.insumosStockBajo}
            descripcion="Igual o por debajo del mínimo"
            icon={Package}
            tono={resumen.insumosStockBajo > 0 ? 'alerta' : 'default'}
            href="/inventario?filtro=stock-bajo"
          />
        )}

        {puedeVerEscuelas && (
          <StatCard
            titulo="Escuelas activas"
            valor={resumen.escuelasActivas}
            icon={School}
            href="/escuelas"
          />
        )}

        {puedeVerRecetas && (
          <StatCard
            titulo="Recetas activas"
            valor={resumen.recetasActivas}
            icon={ChefHat}
            href="/recetas"
          />
        )}
      </div>
    </div>
  )
}