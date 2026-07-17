'use server'
// src/actions/contabilidad.actions.ts

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { gastoSchema, ingresoSchema, categoriaGastoSchema } from '@/lib/validaciones/contabilidad.schema'
import * as contabilidadService from '@/services/contabilidad.service'

type ActionResult = { success: boolean; error?: string; fieldErrors?: Record<string, string> }

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

export async function crearGastoAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'contabilidad.crear')

  const parsed = gastoSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await contabilidadService.crearGasto(parsed.data, usuario.id)
    revalidatePath('/contabilidad')
    revalidatePath('/contabilidad/gastos')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo registrar el gasto.' }
  }
}

export async function eliminarGastoAction(id: string): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'contabilidad.eliminar')

  await contabilidadService.eliminarGasto(id)
  revalidatePath('/contabilidad/gastos')
  return { success: true }
}

export async function crearIngresoManualAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'contabilidad.crear')

  const parsed = ingresoSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await contabilidadService.crearIngresoManual(parsed.data, usuario.id)
    revalidatePath('/contabilidad')
    revalidatePath('/contabilidad/ingresos')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo registrar el ingreso.' }
  }
}

export async function eliminarIngresoAction(id: string): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'contabilidad.eliminar')

  try {
    await contabilidadService.eliminarIngresoManual(id)
    revalidatePath('/contabilidad/ingresos')
    return { success: true }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudo eliminar el ingreso.'
    return { success: false, error: mensaje }
  }
}

export async function crearCategoriaGastoAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'contabilidad.crear')

  const parsed = categoriaGastoSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await contabilidadService.crearCategoriaGasto(parsed.data.nombre)
    revalidatePath('/contabilidad/gastos')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo crear la categoría. Verifica que no exista ya.' }
  }
}