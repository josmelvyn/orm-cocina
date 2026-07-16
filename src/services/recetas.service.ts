// src/services/recetas.service.ts
import { prisma } from '@/lib/prisma'
import type { RecetaInput } from '@/lib/validaciones/receta.schema'

export async function listarRecetas(opts?: { tipoServicio?: string; busqueda?: string }) {
  return prisma.receta.findMany({
    where: {
      activo: true,
      ...(opts?.tipoServicio ? { tipoServicio: opts.tipoServicio as any } : {}),
      ...(opts?.busqueda
        ? {
            OR: [
              { nombre: { contains: opts.busqueda, mode: 'insensitive' } },
              { codigo: { contains: opts.busqueda, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { nombre: 'asc' },
  })
}

export async function obtenerReceta(id: string) {
  return prisma.receta.findUniqueOrThrow({
    where: { id },
    include: {
      ingredientes: { include: { insumo: true } },
    },
  })
}

/**
 * Costo por porción = suma(cantidad_ingrediente * costoUnitario_insumo) / porcionesBase
 * Se recalcula siempre desde los insumos actuales, nunca se confía en un valor cacheado
 * al momento de guardar, para reflejar cambios de precio de insumos.
 */
async function calcularCostoPorcion(
  ingredientes: { insumoId: string; cantidad: number }[],
  porcionesBase: number
) {
  const insumoIds = ingredientes.map((i) => i.insumoId)
  const insumos = await prisma.insumo.findMany({ where: { id: { in: insumoIds } } })
  const costoPorInsumo = new Map(insumos.map((i) => [i.id, Number(i.costoUnitario)]))

  const costoTotal = ingredientes.reduce((acc, ing) => {
    const costoUnitario = costoPorInsumo.get(ing.insumoId) ?? 0
    return acc + costoUnitario * ing.cantidad
  }, 0)

  return costoTotal / porcionesBase
}

export async function crearReceta(data: RecetaInput) {
  const costoPorcion = await calcularCostoPorcion(data.ingredientes, data.porcionesBase)

  return prisma.receta.create({
    data: {
      codigo: data.codigo,
      nombre: data.nombre,
      tipoServicio: data.tipoServicio,
      porcionesBase: data.porcionesBase,
      precioPorcion: data.precioPorcion,
      costoPorcion,
      ingredientes: {
        create: data.ingredientes.map((ing) => ({
          insumoId: ing.insumoId,
          cantidad: ing.cantidad,
        })),
      },
    },
  })
}

export async function actualizarReceta(id: string, data: RecetaInput) {
  const costoPorcion = await calcularCostoPorcion(data.ingredientes, data.porcionesBase)

  return prisma.$transaction(async (tx) => {
    // Reemplaza todos los ingredientes: más simple y seguro que hacer diff
    await tx.recetaIngrediente.deleteMany({ where: { recetaId: id } })

    return tx.receta.update({
      where: { id },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        tipoServicio: data.tipoServicio,
        porcionesBase: data.porcionesBase,
        precioPorcion: data.precioPorcion,
        costoPorcion,
        ingredientes: {
          create: data.ingredientes.map((ing) => ({
            insumoId: ing.insumoId,
            cantidad: ing.cantidad,
          })),
        },
      },
    })
  })
}

export async function desactivarReceta(id: string) {
  return prisma.receta.update({ where: { id }, data: { activo: false } })
}