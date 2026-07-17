// src/services/contabilidad.service.ts
import { prisma } from '@/lib/prisma'
import type { GastoInput, IngresoInput } from '@/lib/validaciones/contabilidad.schema'

function rangoFecha(desde?: string, hasta?: string) {
  if (!desde && !hasta) return undefined
  return {
    ...(desde ? { gte: new Date(desde) } : {}),
    ...(hasta ? { lte: new Date(`${hasta}T23:59:59`) } : {}),
  }
}

// ------------------------------------------------------------
// Categorías de gasto
// ------------------------------------------------------------

export async function listarCategoriasGasto() {
  return prisma.categoriaGasto.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } })
}

export async function crearCategoriaGasto(nombre: string) {
  return prisma.categoriaGasto.create({ data: { nombre } })
}

// ------------------------------------------------------------
// Gastos
// ------------------------------------------------------------

export async function listarGastos(filtros?: { desde?: string; hasta?: string; categoriaId?: string }) {
  return prisma.gasto.findMany({
    where: {
      fecha: rangoFecha(filtros?.desde, filtros?.hasta),
      ...(filtros?.categoriaId ? { categoriaId: filtros.categoriaId } : {}),
    },
    include: { categoria: true, creadoPor: { select: { nombre: true } } },
    orderBy: { fecha: 'desc' },
  })
}

export async function crearGasto(data: GastoInput, usuarioId: string) {
  return prisma.gasto.create({
    data: {
      fecha: new Date(data.fecha),
      categoriaId: data.categoriaId,
      descripcion: data.descripcion,
      monto: data.monto,
      metodoPago: data.metodoPago,
      comprobante: data.comprobante || null,
      creadoPorId: usuarioId,
    },
  })
}

export async function eliminarGasto(id: string) {
  return prisma.gasto.delete({ where: { id } })
}

// ------------------------------------------------------------
// Ingresos
// ------------------------------------------------------------

export async function listarIngresos(filtros?: { desde?: string; hasta?: string }) {
  return prisma.ingreso.findMany({
    where: { fecha: rangoFecha(filtros?.desde, filtros?.hasta) },
    include: { creadoPor: { select: { nombre: true } }, factura: true },
    orderBy: { fecha: 'desc' },
  })
}

export async function crearIngresoManual(data: IngresoInput, usuarioId: string) {
  return prisma.ingreso.create({
    data: {
      fecha: new Date(data.fecha),
      concepto: data.concepto,
      monto: data.monto,
      origen: 'MANUAL',
      creadoPorId: usuarioId,
    },
  })
}

/**
 * Se llama automáticamente desde facturacion.service.ts cuando una factura
 * se marca como PAGADA. Crea el ingreso correspondiente por el monto total
 * de la factura. Usa upsert-like guard vía @unique en facturaId para nunca
 * duplicar el ingreso si por algún error se llama dos veces.
 */
export async function registrarIngresoPorFactura(
  facturaId: string,
  monto: number,
  concepto: string,
  usuarioId: string
) {
  const existente = await prisma.ingreso.findUnique({ where: { facturaId } })
  if (existente) return existente

  return prisma.ingreso.create({
    data: {
      concepto,
      monto,
      origen: 'FACTURA',
      facturaId,
      creadoPorId: usuarioId,
    },
  })
}

export async function eliminarIngresoManual(id: string) {
  const ingreso = await prisma.ingreso.findUniqueOrThrow({ where: { id } })
  if (ingreso.origen === 'FACTURA') {
    throw new Error('No se puede eliminar: este ingreso se generó automáticamente desde una factura.')
  }
  return prisma.ingreso.delete({ where: { id } })
}

// ------------------------------------------------------------
// Estado de resultados (P&L)
// ------------------------------------------------------------

export async function reporteEstadoResultados(filtros?: { desde?: string; hasta?: string }) {
  const [ingresos, gastos] = await Promise.all([
    prisma.ingreso.findMany({ where: { fecha: rangoFecha(filtros?.desde, filtros?.hasta) } }),
    prisma.gasto.findMany({
      where: { fecha: rangoFecha(filtros?.desde, filtros?.hasta) },
      include: { categoria: true },
    }),
  ])

  const totalIngresos = ingresos.reduce((a, i) => a + Number(i.monto), 0)
  const totalGastos = gastos.reduce((a, g) => a + Number(g.monto), 0)
  const neto = totalIngresos - totalGastos

  const gastosPorCategoria = new Map<string, number>()
  for (const g of gastos) {
    const actual = gastosPorCategoria.get(g.categoria.nombre) ?? 0
    gastosPorCategoria.set(g.categoria.nombre, actual + Number(g.monto))
  }

  return {
    totalIngresos,
    totalGastos,
    neto,
    cantidadIngresos: ingresos.length,
    cantidadGastos: gastos.length,
    gastosPorCategoria: [...gastosPorCategoria.entries()]
      .map(([categoria, monto]) => ({ categoria, monto }))
      .sort((a, b) => b.monto - a.monto),
  }
}