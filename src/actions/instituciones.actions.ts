'use server'
// src/actions/instituciones.actions.ts

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { institucionSchema } from '@/lib/validaciones/institucion.schema'
import * as institucionesService from '@/services/instituciones.service'

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

export async function crearInstitucionAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'institucion.crear')

  const parsed = institucionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await institucionesService.crearInstitucion(parsed.data)
    revalidatePath('/instituciones')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo crear. Verifica que el RNC no esté ya registrado.' }
  }
}

export async function actualizarInstitucionAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'institucion.editar')

  const parsed = institucionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await institucionesService.actualizarInstitucion(id, parsed.data)
    revalidatePath('/instituciones')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo actualizar la institución.' }
  }
}

export async function desactivarInstitucionAction(id: string): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'institucion.editar')

  try {
    await institucionesService.desactivarInstitucion(id)
    revalidatePath('/instituciones')
    return { success: true }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudo desactivar.'
    return { success: false, error: mensaje }
  }
}