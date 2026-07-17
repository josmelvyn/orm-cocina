// src/services/reportes.service.ts
import { prisma } from '@/lib/prisma'

type FiltroPeriodo = { desde?: string; hasta?: string; escuelaId?: string; institucionId?: string }

function rangoFecha(desde?: string, hasta?: string) {
  if (!desde && !hasta) return undefined
  return {
    ...(desde ? { gte: new Date(desde) } : {}),
    ...(hasta ? { lte: new Date(`${hasta}T23:59:59`) } : {}),
  }
}

/**
 * REPORTE 1: Conduces — detalle plano de cada conduce con su escuela e institución.
 * Es el reporte "crudo", base para los demás.
 */
export async function reporteConduces(filtros: FiltroPeriodo & { estado?: string }) {
  const conduces = await prisma.conduce.findMany({
    where: {
      fecha: rangoFecha(filtros.desde, filtros.hasta),
      ...(filtros.escuelaId ? { escuelaId: filtros.escuelaId } : {}),
      ...(filtros.institucionId ? { escuela: { institucionId: filtros.institucionId } } : {}),
      ...(filtros.estado ? { estado: filtros.estado as any } : {}),
    },
    include: { escuela: { include: { institucion: true } }, detalles: true },
    orderBy: { fecha: 'asc' },
  })

  return conduces.map((c) => ({
    id: c.id,
    numero: c.numero,
    fecha: c.fecha,
    tipoServicio: c.tipoServicio,
    estado: c.estado,
    escuela: c.escuela.nombre,
    escuelaCodigo: c.escuela.codigo,
    institucion: c.escuela.institucion.nombre,
    totalRaciones: c.detalles.reduce((a, d) => a + d.cantidad, 0),
    totalMonto: c.detalles.reduce((a, d) => a + Number(d.subtotal), 0),
  }))
}

/**
 * REPORTE 2: Conduce global — totales consolidados de TODOS los centros
 * en el período, agrupados por tipo de servicio y por estado.
 */
export async function reporteConduceGlobal(filtros: FiltroPeriodo) {
  const conduces = await reporteConduces(filtros)

  const porTipoServicio = new Map<string, { raciones: number; monto: number; conduces: number }>()
  const porEstado = new Map<string, number>()

  let totalRaciones = 0
  let totalMonto = 0

  for (const c of conduces) {
    totalRaciones += c.totalRaciones
    totalMonto += c.totalMonto

    const acumuladoTipo = porTipoServicio.get(c.tipoServicio) ?? { raciones: 0, monto: 0, conduces: 0 }
    acumuladoTipo.raciones += c.totalRaciones
    acumuladoTipo.monto += c.totalMonto
    acumuladoTipo.conduces += 1
    porTipoServicio.set(c.tipoServicio, acumuladoTipo)

    porEstado.set(c.estado, (porEstado.get(c.estado) ?? 0) + 1)
  }

  return {
    totalConduces: conduces.length,
    totalRaciones,
    totalMonto,
    porTipoServicio: [...porTipoServicio.entries()].map(([tipo, datos]) => ({ tipo, ...datos })),
    porEstado: [...porEstado.entries()].map(([estado, cantidad]) => ({ estado, cantidad })),
  }
}

/**
 * REPORTE 3: Relación de conduce general — listado completo con total acumulado,
 * sin agrupar (para revisión línea por línea con el gran total al pie).
 */
export async function reporteRelacionGeneral(filtros: FiltroPeriodo) {
  const conduces = await reporteConduces(filtros)
  const granTotal = conduces.reduce((a, c) => a + c.totalMonto, 0)
  const totalRaciones = conduces.reduce((a, c) => a + c.totalRaciones, 0)

  return { conduces, granTotal, totalRaciones }
}

/**
 * REPORTE 4: Relación de conduce por centro — mismo universo de datos que el
 * general, pero agrupado por escuela con subtotales.
 */
export async function reporteRelacionPorCentro(filtros: FiltroPeriodo) {
  const conduces = await reporteConduces({ ...filtros })

  const porEscuela = new Map<
    string,
    { escuela: string; institucion: string; conduces: typeof conduces; raciones: number; monto: number }
  >()

  for (const c of conduces) {
    const grupo = porEscuela.get(c.escuela) ?? {
      escuela: c.escuela,
      institucion: c.institucion,
      conduces: [],
      raciones: 0,
      monto: 0,
    }
    grupo.conduces.push(c)
    grupo.raciones += c.totalRaciones
    grupo.monto += c.totalMonto
    porEscuela.set(c.escuela, grupo)
  }

  const grupos = [...porEscuela.values()].sort((a, b) => a.escuela.localeCompare(b.escuela))
  const granTotal = grupos.reduce((a, g) => a + g.monto, 0)

  return { grupos, granTotal }
}

/**
 * REPORTE 5: Facturas — listado de facturas emitidas en el período,
 * con su institución y totales.
 */
export async function reporteFacturas(filtros: FiltroPeriodo & { estado?: string }) {
  const facturas = await prisma.factura.findMany({
    where: {
      fechaEmision: rangoFecha(filtros.desde, filtros.hasta),
      ...(filtros.institucionId ? { institucionId: filtros.institucionId } : {}),
      ...(filtros.estado ? { estado: filtros.estado as any } : {}),
    },
    include: { institucion: true, conduces: true },
    orderBy: { fechaEmision: 'asc' },
  })

  const detalle = facturas.map((f) => ({
    id: f.id,
    numeroFactura: f.numeroFactura,
    ncf: f.ncf,
    institucion: f.institucion.nombre,
    fechaEmision: f.fechaEmision,
    estado: f.estado,
    cantidadConduces: f.conduces.length,
    subtotal: Number(f.subtotal),
    itbis: Number(f.itbis),
    total: Number(f.total),
  }))

  const granTotal = detalle
    .filter((f) => f.estado !== 'ANULADA')
    .reduce((a, f) => a + f.total, 0)

  return { detalle, granTotal }
}