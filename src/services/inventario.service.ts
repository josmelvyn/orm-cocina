// src/services/inventario.service.ts
import { prisma } from '@/lib/prisma'
import type { InsumoInput, MovimientoInput } from '@/lib/validaciones/insumo.schema'

export async function listarInsumos(opts?: { soloStockBajo?: boolean; busqueda?: string }) {
  const insumos = await prisma.insumo.findMany({
    where: {
      activo: true,
      ...(opts?.busqueda
        ? {
            OR: [
              { nombre: { contains: opts.busqueda, mode: 'insensitive' } },
              { codigo: { contains: opts.busqueda, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { categoria: true },
    orderBy: { nombre: 'asc' },
  })

  if (opts?.soloStockBajo) {
    return insumos.filter((i) => Number(i.stockActual) <= Number(i.stockMinimo))
  }
  return insumos
}

export async function obtenerInsumo(id: string) {
  return prisma.insumo.findUniqueOrThrow({ where: { id }, include: { categoria: true } })
}

export async function listarCategorias() {
  return prisma.categoriaInsumo.findMany({ orderBy: { nombre: 'asc' } })
}

export async function crearInsumo(data: InsumoInput) {
  return prisma.insumo.create({
    data: {
      codigo: data.codigo,
      nombre: data.nombre,
      categoriaId: data.categoriaId || null,
      unidadMedida: data.unidadMedida,
      stockMinimo: data.stockMinimo,
      costoUnitario: data.costoUnitario,
      stockActual: 0,
    },
  })
}

export async function actualizarInsumo(id: string, data: InsumoInput) {
  return prisma.insumo.update({
    where: { id },
    data: {
      codigo: data.codigo,
      nombre: data.nombre,
      categoriaId: data.categoriaId || null,
      unidadMedida: data.unidadMedida,
      stockMinimo: data.stockMinimo,
      costoUnitario: data.costoUnitario,
    },
  })
}

export async function desactivarInsumo(id: string) {
  return prisma.insumo.update({ where: { id }, data: { activo: false } })
}

/**
 * Registra un movimiento de inventario y actualiza el stock del insumo
 * de forma ATÓMICA (transacción): si algo falla, no queda stock desincronizado.
 */
export async function registrarMovimiento(data: MovimientoInput, usuarioId: string) {
  return prisma.$transaction(async (tx) => {
    const insumo = await tx.insumo.findUniqueOrThrow({ where: { id: data.insumoId } })

    const esEntrada = data.tipo === 'ENTRADA'
    const esSalidaOMerma = data.tipo === 'SALIDA' || data.tipo === 'MERMA'

    let nuevoStock = Number(insumo.stockActual)

    if (esEntrada) {
      nuevoStock += data.cantidad
    } else if (esSalidaOMerma) {
      nuevoStock -= data.cantidad
      if (nuevoStock < 0) {
        throw new Error(
          `Stock insuficiente. Disponible: ${insumo.stockActual} ${insumo.unidadMedida}`
        )
      }
    } else {
      // AJUSTE: la cantidad ingresada es el nuevo stock, no un delta
      nuevoStock = data.cantidad
    }

    const movimiento = await tx.movimientoInventario.create({
      data: {
        insumoId: data.insumoId,
        tipo: data.tipo,
        cantidad: data.cantidad,
        costoUnitario: data.costoUnitario,
        motivo: data.motivo,
        creadoPorId: usuarioId,
      },
    })

    await tx.insumo.update({
      where: { id: data.insumoId },
      data: { stockActual: nuevoStock },
    })

    return movimiento
  })
}

export async function listarMovimientos(opts?: { insumoId?: string; limite?: number }) {
  return prisma.movimientoInventario.findMany({
    where: opts?.insumoId ? { insumoId: opts.insumoId } : undefined,
    include: { insumo: true, creadoPor: { select: { nombre: true } } },
    orderBy: { createdAt: 'desc' },
    take: opts?.limite ?? 100,
  })
}