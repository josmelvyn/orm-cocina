// src/app/(dashboard)/caja-chica/page.tsx
import { obtenerCajaChica, listarMovimientos } from '@/services/caja-chica.service'
import { CajaChicaDashboard } from '@/components/caja-chica/caja-chica-dashboard'

export default async function CajaChicaPage() {
  const [cajaRaw, movimientosRaw] = await Promise.all([
    obtenerCajaChica(),
    listarMovimientos({ limite: 100 }),
  ])

  const caja = {
    id: cajaRaw.id,
    nombre: cajaRaw.nombre,
    fondoFijo: Number(cajaRaw.fondoFijo),
    saldoActual: Number(cajaRaw.saldoActual),
    estado: cajaRaw.estado,
    responsable: cajaRaw.responsable,
  }

  const movimientos = movimientosRaw.map((m: (typeof movimientosRaw)[number]) => ({
    id: m.id,
    tipo: m.tipo,
    fecha: m.fecha,
    monto: Number(m.monto),
    concepto: m.concepto,
    beneficiario: m.beneficiario,
    comprobante: m.comprobante,
    saldoResultante: Number(m.saldoResultante),
    creadoPor: m.creadoPor.nombre,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Caja Chica</h1>
        <p className="text-sm text-slate-500">{caja.responsable && `Custodio: ${caja.responsable}`}</p>
      </div>

      <CajaChicaDashboard caja={caja} movimientos={movimientos} />
    </div>
  )
}