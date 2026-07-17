// src/services/facturacion.service.ts
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { FacturaInput } from '@/lib/validaciones/factura.schema'

export async function listarFacturas(opts?: { institucionId?: string; estado?: string }) {
  return prisma.factura.findMany({
    where: {
      ...(opts?.institucionId ? { institucionId: opts.institucionId } : {}),
      ...(opts?.estado ? { estado: opts.estado as any } : {}),
    },
    include: { institucion: true, conduces: true },
    orderBy: { fechaEmision: 'desc' },
  })
}

export async function obtenerFactura(id: string) {
  return prisma.factura.findUniqueOrThrow({
    where: { id },
    include: {
      institucion: true,
      conduces: {
        include: { escuela: true, detalles: { include: { receta: true } } },
      },
      creadoPor: { select: { nombre: true } },
    },
  })
}

/**
 * Conduces de una institución que están EMITIDOS (no facturados ni anulados)
 * y caen dentro del rango de fechas dado — son los "facturables".
 */
export async function listarConducesFacturables(
  institucionId: string,
  periodoInicio: string,
  periodoFin: string
) {
  return prisma.conduce.findMany({
    where: {
      estado: 'EMITIDO',
      escuela: { institucionId },
      fecha: { gte: new Date(periodoInicio), lte: new Date(periodoFin) },
    },
    include: { escuela: true, detalles: true },
    orderBy: { fecha: 'asc' },
  })
}

async function generarNumeroFactura(tx: Prisma.TransactionClient) {
  const ultima = await tx.factura.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { numeroFactura: true },
  })
  const ultimoNumero = ultima ? parseInt(ultima.numeroFactura.replace('FAC-', ''), 10) : 0
  return `FAC-${String(ultimoNumero + 1).padStart(6, '0')}`
}

/**
 * Genera la factura consolidando los conduces seleccionados: suma sus subtotales,
 * calcula el ITBIS, y marca cada conduce como FACTURADO (deja de estar disponible
 * para incluirse en otra factura). Todo dentro de una transacción.
 */
export async function generarFactura(data: FacturaInput, usuarioId: string) {
  return prisma.$transaction(async (tx) => {
    const conduces = await tx.conduce.findMany({
      where: { id: { in: data.conduceIds } },
      include: { detalles: true },
    })

    if (conduces.length !== data.conduceIds.length) {
      throw new Error('Alguno de los conduces seleccionados ya no existe.')
    }

    const yaFacturadoOAnulado = conduces.find((c) => c.estado !== 'EMITIDO')
    if (yaFacturadoOAnulado) {
      throw new Error(
        `El conduce ${yaFacturadoOAnulado.numero} ya no está disponible para facturar (estado: ${yaFacturadoOAnulado.estado}).`
      )
    }

    const subtotal = conduces.reduce(
      (acc, c) => acc + c.detalles.reduce((a, d) => a + Number(d.subtotal), 0),
      0
    )
    const itbis = subtotal * (data.itbisPorcentaje / 100)
    const total = subtotal + itbis

    const numeroFactura = await generarNumeroFactura(tx)

    const factura = await tx.factura.create({
      data: {
        numeroFactura,
        ncf: data.ncf,
        tipoNcf: data.tipoNcf,
        ncfValidoHasta: data.ncfValidoHasta ? new Date(data.ncfValidoHasta) : null,
        institucionId: data.institucionId,
        periodoInicio: new Date(data.periodoInicio),
        periodoFin: new Date(data.periodoFin),
        subtotal,
        itbis,
        total,
        creadoPorId: usuarioId,
        conduces: { connect: data.conduceIds.map((id) => ({ id })) },
      },
    })

    await tx.conduce.updateMany({
      where: { id: { in: data.conduceIds } },
      data: { estado: 'FACTURADO' },
    })

    return factura
  })
}

/**
 * Anula la factura y libera sus conduces (vuelven a estado EMITIDO,
 * disponibles para incluirse en una nueva factura). No toca el inventario:
 * el inventario ya se descontó al crear los conduces, y anular la factura
 * no implica que la comida no se haya entregado.
 */
/**
 * Marca la factura como pagada. Solo aplica a facturas en estado EMITIDA
 * (no se puede "pagar" una factura ya anulada). Al pagarla, registra
 * automáticamente el ingreso correspondiente en el módulo de contabilidad.
 */
export async function marcarFacturaPagada(id: string, usuarioId: string) {
  const factura = await prisma.factura.findUniqueOrThrow({ where: { id } })

  if (factura.estado === 'ANULADA') {
    throw new Error('No se puede marcar como pagada: esta factura está anulada.')
  }
  if (factura.estado === 'PAGADA') {
    throw new Error('Esta factura ya está marcada como pagada.')
  }

  const [facturaActualizada] = await prisma.$transaction([
    prisma.factura.update({ where: { id }, data: { estado: 'PAGADA' } }),
    prisma.ingreso.create({
      data: {
        concepto: `Pago de factura ${factura.numeroFactura} (NCF ${factura.ncf})`,
        monto: factura.total,
        origen: 'FACTURA',
        facturaId: factura.id,
        creadoPorId: usuarioId,
      },
    }),
  ])

  return facturaActualizada
}

export async function anularFactura(id: string) {
  return prisma.$transaction(async (tx) => {
    const factura = await tx.factura.findUniqueOrThrow({
      where: { id },
      include: { conduces: true },
    })

    if (factura.estado === 'ANULADA') {
      throw new Error('Esta factura ya está anulada.')
    }

    await tx.conduce.updateMany({
      where: { id: { in: factura.conduces.map((c) => c.id) } },
      data: { estado: 'EMITIDO', facturaId: null },
    })

    // Si la factura ya estaba pagada, elimina el ingreso contable asociado
    // para que el estado de resultados no quede con un ingreso "fantasma".
    await tx.ingreso.deleteMany({ where: { facturaId: id } })

    return tx.factura.update({ where: { id }, data: { estado: 'ANULADA' } })
  })
}