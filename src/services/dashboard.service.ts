// src/services/dashboard.service.ts
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth } from 'date-fns'

export type ResumenDashboard = {
  conducesDelMes: number
  conducesPendientesFacturar: number
  insumosStockBajo: number
  escuelasActivas: number
  recetasActivas: number
  totalFacturadoMes: number
  facturasDelMes: number
}

/**
 * Trae todos los indicadores del dashboard en paralelo.
 * Cada query es independiente y liviana (counts/aggregates),
 * así que Promise.all no genera carga significativa en la BD.
 */
export async function obtenerResumenDashboard(): Promise<ResumenDashboard> {
  const inicioMes = startOfMonth(new Date())
  const finMes = endOfMonth(new Date())

  const [
    conducesDelMes,
    conducesPendientesFacturar,
    insumosStockBajo,
    escuelasActivas,
    recetasActivas,
    agregadoFacturas,
  ] = await Promise.all([
    prisma.conduce.count({
      where: { fecha: { gte: inicioMes, lte: finMes }, estado: { not: 'ANULADO' } },
    }),

    prisma.conduce.count({
      where: { estado: 'EMITIDO' },
    }),

    // stock actual <= stock minimo -> requiere query raw porque compara dos columnas entre sí
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint as count
      FROM insumos
      WHERE activo = true AND "stockActual" <= "stockMinimo"
    `,

    prisma.escuela.count({ where: { activo: true } }),

    prisma.receta.count({ where: { activo: true } }),

    prisma.factura.aggregate({
      where: {
        fechaEmision: { gte: inicioMes, lte: finMes },
        estado: { not: 'ANULADA' },
      },
      _sum: { total: true },
      _count: true,
    }),
  ])

  return {
    conducesDelMes,
    conducesPendientesFacturar,
    insumosStockBajo: Number(insumosStockBajo[0]?.count ?? 0),
    escuelasActivas,
    recetasActivas,
    totalFacturadoMes: Number(agregadoFacturas._sum.total ?? 0),
    facturasDelMes: agregadoFacturas._count,
  }
}