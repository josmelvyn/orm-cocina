'use server'
// src/actions/escuelas.actions.ts

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { escuelaSchema } from '@/lib/validaciones/institucion.schema'
import * as escuelasService from '@/services/escuelas.service'

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

export async function crearEscuelaAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'escuela.crear')

  const parsed = escuelaSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await escuelasService.crearEscuela(parsed.data)
    revalidatePath('/escuelas')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo crear. Verifica que el código no exista.' }
  }
}

export async function actualizarEscuelaAction(id: string, formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'escuela.editar')

  const parsed = escuelaSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await escuelasService.actualizarEscuela(id, parsed.data)
    revalidatePath('/escuelas')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo actualizar la escuela.' }
  }
}

export async function desactivarEscuelaAction(id: string): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'escuela.editar')

  try {
    await escuelasService.desactivarEscuela(id)
    revalidatePath('/escuelas')
    return { success: true }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudo desactivar.'
    return { success: false, error: mensaje }
  }
}