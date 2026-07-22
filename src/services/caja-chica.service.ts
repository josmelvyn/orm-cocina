// src/services/caja-chica.service.ts
import { prisma } from '@/lib/prisma'

/**
 * Obtiene la caja chica (singleton). Si no existe, la crea con fondo 0
 * para que la UI pueda mostrar el formulario de configuración inicial.
 */
export async function obtenerCajaChica() {
  const existente = await prisma.cajaChica.findFirst({
    include: { _count: { select: { movimientos: true } } },
  })
  if (existente) return existente

  return prisma.cajaChica.create({
    data: { nombre: 'Caja Chica Principal', fondoFijo: 0, saldoActual: 0 },
    include: { _count: { select: { movimientos: true } } },
  })
}

export async function configurarCajaChica(data: { fondoFijo: number; responsable?: string }) {
  const caja = await obtenerCajaChica()
  return prisma.cajaChica.update({
    where: { id: caja.id },
    data: { fondoFijo: data.fondoFijo, responsable: data.responsable || null },
  })
}

/**
 * Abre la caja cargándola con el fondo fijo autorizado.
 * Solo se puede abrir si está cerrada.
 */
export async function abrirCaja(usuarioId: string) {
  const caja = await obtenerCajaChica()

  if (caja.estado === 'ABIERTA') {
    throw new Error('La caja ya está abierta.')
  }
  if (Number(caja.fondoFijo) <= 0) {
    throw new Error('Configura el fondo fijo antes de abrir la caja.')
  }

  return prisma.$transaction(async (tx) => {
    const nuevoSaldo = Number(caja.fondoFijo)

    await tx.movimientoCajaChica.create({
      data: {
        cajaChicaId: caja.id,
        tipo: 'APERTURA',
        monto: nuevoSaldo,
        concepto: 'Apertura de caja chica',
        saldoResultante: nuevoSaldo,
        creadoPorId: usuarioId,
      },
    })

    return tx.cajaChica.update({
      where: { id: caja.id },
      data: { estado: 'ABIERTA', saldoActual: nuevoSaldo },
    })
  })
}

/**
 * Registra un desembolso (gasto) desde la caja chica.
 * Valida que haya saldo suficiente.
 */
export async function registrarDesembolso(
  data: { monto: number; concepto: string; beneficiario?: string; comprobante?: string },
  usuarioId: string
) {
  const caja = await obtenerCajaChica()

  if (caja.estado !== 'ABIERTA') {
    throw new Error('La caja está cerrada. Ábrela antes de registrar desembolsos.')
  }

  const saldoActual = Number(caja.saldoActual)
  if (data.monto > saldoActual) {
    throw new Error(
      `Saldo insuficiente. Disponible: RD$${saldoActual.toFixed(2)}, desembolso: RD$${data.monto.toFixed(2)}`
    )
  }

  const nuevoSaldo = saldoActual - data.monto

  return prisma.$transaction(async (tx) => {
    await tx.movimientoCajaChica.create({
      data: {
        cajaChicaId: caja.id,
        tipo: 'DESEMBOLSO',
        monto: data.monto,
        concepto: data.concepto,
        beneficiario: data.beneficiario || null,
        comprobante: data.comprobante || null,
        saldoResultante: nuevoSaldo,
        creadoPorId: usuarioId,
      },
    })

    return tx.cajaChica.update({
      where: { id: caja.id },
      data: { saldoActual: nuevoSaldo },
    })
  })
}

/**
 * Repone dinero a la caja chica (normalmente se repone hasta el fondo fijo).
 */
export async function reponerCaja(data: { monto: number; concepto?: string }, usuarioId: string) {
  const caja = await obtenerCajaChica()

  if (caja.estado !== 'ABIERTA') {
    throw new Error('La caja está cerrada. Ábrela antes de reponer.')
  }

  const nuevoSaldo = Number(caja.saldoActual) + data.monto

  return prisma.$transaction(async (tx) => {
    await tx.movimientoCajaChica.create({
      data: {
        cajaChicaId: caja.id,
        tipo: 'REPOSICION',
        monto: data.monto,
        concepto: data.concepto || 'Reposición de caja chica',
        saldoResultante: nuevoSaldo,
        creadoPorId: usuarioId,
      },
    })

    return tx.cajaChica.update({
      where: { id: caja.id },
      data: { saldoActual: nuevoSaldo },
    })
  })
}

/**
 * Cierra la caja chica (para arqueo). Registra el saldo al cierre.
 */
export async function cerrarCaja(usuarioId: string) {
  const caja = await obtenerCajaChica()

  if (caja.estado !== 'ABIERTA') {
    throw new Error('La caja ya está cerrada.')
  }

  const saldoAlCierre = Number(caja.saldoActual)

  return prisma.$transaction(async (tx) => {
    await tx.movimientoCajaChica.create({
      data: {
        cajaChicaId: caja.id,
        tipo: 'CIERRE',
        monto: saldoAlCierre,
        concepto: `Cierre de caja — saldo: RD$${saldoAlCierre.toFixed(2)}`,
        saldoResultante: saldoAlCierre,
        creadoPorId: usuarioId,
      },
    })

    return tx.cajaChica.update({
      where: { id: caja.id },
      data: { estado: 'CERRADA' },
    })
  })
}

export async function listarMovimientos(opts?: { limite?: number }) {
  const caja = await obtenerCajaChica()
  return prisma.movimientoCajaChica.findMany({
    where: { cajaChicaId: caja.id },
    include: { creadoPor: { select: { nombre: true } } },
    orderBy: { createdAt: 'desc' },
    take: opts?.limite ?? 200,
  })
}