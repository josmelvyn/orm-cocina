'use server'
// src/actions/caja-chica.actions.ts

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { desembolsoSchema, reposicionSchema, configCajaSchema } from '@/lib/validaciones/caja-chica.schema'
import * as cajaChicaService from '@/services/caja-chica.service'

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

export async function configurarCajaAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'contabilidad.editar')

  const parsed = configCajaSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  await cajaChicaService.configurarCajaChica(parsed.data)
  revalidatePath('/caja-chica')
  return { success: true }
}

export async function abrirCajaAction(): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'contabilidad.crear')

  try {
    await cajaChicaService.abrirCaja(usuario.id)
    revalidatePath('/caja-chica')
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'No se pudo abrir la caja.' }
  }
}

export async function cerrarCajaAction(): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'contabilidad.crear')

  try {
    await cajaChicaService.cerrarCaja(usuario.id)
    revalidatePath('/caja-chica')
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'No se pudo cerrar la caja.' }
  }
}

export async function registrarDesembolsoAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'contabilidad.crear')

  const parsed = desembolsoSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await cajaChicaService.registrarDesembolso(parsed.data, usuario.id)
    revalidatePath('/caja-chica')
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'No se pudo registrar el desembolso.' }
  }
}

export async function reponerCajaAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'contabilidad.crear')

  const parsed = reposicionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await cajaChicaService.reponerCaja(parsed.data, usuario.id)
    revalidatePath('/caja-chica')
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'No se pudo reponer la caja.' }
  }
}