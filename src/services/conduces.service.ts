// src/services/conduces.service.ts
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { ConduceInput } from '@/lib/validaciones/conduce.schema'

export async function listarConduces(opts?: {
  escuelaId?: string
  estado?: string
  fechaInicio?: string
  fechaFin?: string
}) {
  return prisma.conduce.findMany({
    where: {
      ...(opts?.escuelaId ? { escuelaId: opts.escuelaId } : {}),
      ...(opts?.estado ? { estado: opts.estado as any } : {}),
      ...(opts?.fechaInicio || opts?.fechaFin
        ? {
            fecha: {
              ...(opts.fechaInicio ? { gte: new Date(opts.fechaInicio) } : {}),
              ...(opts.fechaFin ? { lte: new Date(opts.fechaFin) } : {}),
            },
          }
        : {}),
    },
    include: {
      escuela: { include: { institucion: true } },
      detalles: true,
    },
    orderBy: { fecha: 'desc' },
  })
}

export async function obtenerConduce(id: string) {
  return prisma.conduce.findUniqueOrThrow({
    where: { id },
    include: {
      escuela: { include: { institucion: true } },
      detalles: { include: { receta: true } },
      creadoPor: { select: { nombre: true } },
    },
  })
}

/** Genera el próximo número consecutivo, ej: CND-000123 */
async function generarNumeroConduce(tx: Prisma.TransactionClient) {
  const ultimo = await tx.conduce.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { numero: true },
  })

  const ultimoNumero = ultimo ? parseInt(ultimo.numero.replace('CND-', ''), 10) : 0
  const siguiente = ultimoNumero + 1
  return `CND-${String(siguiente).padStart(6, '0')}`
}

/**
 * Crea el conduce, sus detalles, y descuenta el inventario correspondiente
 * a los ingredientes de cada receta (escalado por la cantidad de raciones
 * respecto a las porciones base de la receta). Todo en una transacción:
 * si el stock no alcanza para algún insumo, no se crea nada.
 */
export async function crearConduce(data: ConduceInput, usuarioId: string) {
  return prisma.$transaction(async (tx) => {
    const recetaIds = data.detalles.map((d) => d.recetaId)
    const recetas = await tx.receta.findMany({
      where: { id: { in: recetaIds } },
      include: { ingredientes: true },
    })
    const recetaPorId = new Map(recetas.map((r) => [r.id, r]))

    // 1. Calcular consumo total de insumos agregando todas las recetas del conduce
    const consumoPorInsumo = new Map<string, number>()

    for (const detalle of data.detalles) {
      const receta = recetaPorId.get(detalle.recetaId)
      if (!receta) throw new Error('Receta no encontrada')

      const factor = detalle.cantidad / receta.porcionesBase

      for (const ing of receta.ingredientes) {
        const cantidadNecesaria = Number(ing.cantidad) * factor
        consumoPorInsumo.set(
          ing.insumoId,
          (consumoPorInsumo.get(ing.insumoId) ?? 0) + cantidadNecesaria
        )
      }
    }

    // 2. Validar que hay stock suficiente de TODOS los insumos antes de crear nada
    const insumoIds = [...consumoPorInsumo.keys()]
    const insumos = await tx.insumo.findMany({ where: { id: { in: insumoIds } } })
    const insumoPorId = new Map(insumos.map((i) => [i.id, i]))

    for (const [insumoId, cantidadNecesaria] of consumoPorInsumo) {
      const insumo = insumoPorId.get(insumoId)
      if (!insumo) throw new Error('Insumo no encontrado')
      if (Number(insumo.stockActual) < cantidadNecesaria) {
        throw new Error(
          `Stock insuficiente de "${insumo.nombre}". Disponible: ${insumo.stockActual} ${insumo.unidadMedida}, requerido: ${cantidadNecesaria.toFixed(2)}`
        )
      }
    }

    // 3. Crear el conduce con sus detalles
    const numero = await generarNumeroConduce(tx)

    const conduce = await tx.conduce.create({
      data: {
        numero,
        fecha: new Date(data.fecha),
        tipoServicio: data.tipoServicio,
        escuelaId: data.escuelaId,
        observaciones: data.observaciones,
        creadoPorId: usuarioId,
        detalles: {
          create: data.detalles.map((d) => {
            const receta = recetaPorId.get(d.recetaId)!
            const precioUnitario = Number(receta.precioPorcion)
            return {
              recetaId: d.recetaId,
              cantidad: d.cantidad,
              precioUnitario,
              subtotal: precioUnitario * d.cantidad,
            }
          }),
        },
      },
    })

    // 4. Descontar inventario y registrar el movimiento de cada insumo consumido
    for (const [insumoId, cantidadConsumida] of consumoPorInsumo) {
      const insumo = insumoPorId.get(insumoId)!

      await tx.movimientoInventario.create({
        data: {
          insumoId,
          tipo: 'SALIDA',
          cantidad: cantidadConsumida,
          motivo: `Producción para conduce ${numero}`,
          conduceId: conduce.id,
          creadoPorId: usuarioId,
        },
      })

      await tx.insumo.update({
        where: { id: insumoId },
        data: { stockActual: Number(insumo.stockActual) - cantidadConsumida },
      })
    }

    return conduce
  })
}

/**
 * Anula un conduce. Si aún no ha sido facturado, revierte el inventario
 * consumido (crea movimientos de ENTRADA de reversa). Si ya está facturado,
 * no se puede anular directamente: primero hay que anular la factura.
 */
export async function anularConduce(id: string, usuarioId: string) {
  return prisma.$transaction(async (tx) => {
    const conduce = await tx.conduce.findUniqueOrThrow({
      where: { id },
      include: { movimientos: true },
    })

    if (conduce.estado === 'FACTURADO') {
      throw new Error('No se puede anular: este conduce ya fue facturado. Anula la factura primero.')
    }
    if (conduce.estado === 'ANULADO') {
      throw new Error('Este conduce ya está anulado.')
    }

    // Revertir cada salida de inventario asociada a este conduce
    for (const mov of conduce.movimientos) {
      if (mov.tipo !== 'SALIDA') continue

      const insumo = await tx.insumo.findUniqueOrThrow({ where: { id: mov.insumoId } })

      await tx.movimientoInventario.create({
        data: {
          insumoId: mov.insumoId,
          tipo: 'ENTRADA',
          cantidad: mov.cantidad,
          motivo: `Reversa por anulación de conduce ${conduce.numero}`,
          creadoPorId: usuarioId,
        },
      })

      await tx.insumo.update({
        where: { id: mov.insumoId },
        data: { stockActual: Number(insumo.stockActual) + Number(mov.cantidad) },
      })
    }

    return tx.conduce.update({ where: { id }, data: { estado: 'ANULADO' } })
  })
}