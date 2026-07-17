'use server'
// src/actions/facturacion.actions.ts

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { facturaSchema } from '@/lib/validaciones/factura.schema'
import * as facturacionService from '@/services/facturacion.service'

type ActionResult = { success: boolean; error?: string; fieldErrors?: Record<string, string>; id?: string }

async function requiereSesion() {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')
  return session.user
}

function requierePermiso(permisos: string[], requerido: string) {
  if (!permisos.includes(requerido)) {
    throw new Error('No tienes permiso para realizar esta acción')
  }
}

function parsearFormFactura(formData: FormData) {
  const conduceIdsRaw = formData.get('conduceIds')
  let conduceIds: unknown = []
  try {
    conduceIds = conduceIdsRaw ? JSON.parse(String(conduceIdsRaw)) : []
  } catch {
    conduceIds = []
  }

  return facturaSchema.safeParse({
    institucionId: formData.get('institucionId'),
    ncf: formData.get('ncf'),
    tipoNcf: formData.get('tipoNcf'),
    ncfValidoHasta: formData.get('ncfValidoHasta') || undefined,
    periodoInicio: formData.get('periodoInicio'),
    periodoFin: formData.get('periodoFin'),
    itbisPorcentaje: formData.get('itbisPorcentaje') || 18,
    conduceIds,
  })
}

export async function generarFacturaAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'factura.emitir')

  const parsed = parsearFormFactura(formData)
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return {
      success: false,
      error: flat.formErrors[0],
      fieldErrors: flat.fieldErrors as Record<string, string>,
    }
  }

  try {
    const factura = await facturacionService.generarFactura(parsed.data, usuario.id)
    revalidatePath('/facturacion')
    revalidatePath('/conduces')
    revalidatePath('/dashboard')
    return { success: true, id: factura.id }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudo generar la factura.'
    return { success: false, error: mensaje }
  }
}

export async function anularFacturaAction(id: string): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'factura.anular')

  try {
    await facturacionService.anularFactura(id)
    revalidatePath('/facturacion')
    revalidatePath(`/facturacion/${id}`)
    revalidatePath('/conduces')
    return { success: true }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudo anular la factura.'
    return { success: false, error: mensaje }
  }
}

export async function marcarPagadaFacturaAction(id: string): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'factura.emitir') // reusa el permiso de facturación

  try {
    await facturacionService.marcarFacturaPagada(id, usuario.id)
    revalidatePath('/facturacion')
    revalidatePath(`/facturacion/${id}`)
    revalidatePath('/contabilidad')
    return { success: true }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudo marcar como pagada.'
    return { success: false, error: mensaje }
  }
}

export async function buscarConducesFacturablesAction(
  institucionId: string,
  periodoInicio: string,
  periodoFin: string
) {
  await requiereSesion()

  if (!institucionId || !periodoInicio || !periodoFin) return []

  const conduces = await facturacionService.listarConducesFacturables(
    institucionId,
    periodoInicio,
    periodoFin
  )

  return conduces.map((c) => ({
    id: c.id,
    numero: c.numero,
    fecha: c.fecha.toISOString(),
    tipoServicio: c.tipoServicio,
    escuelaNombre: c.escuela.nombre,
    totalRaciones: c.detalles.reduce((acc, d) => acc + d.cantidad, 0),
    totalMonto: c.detalles.reduce((acc, d) => acc + Number(d.subtotal), 0),
  }))
}