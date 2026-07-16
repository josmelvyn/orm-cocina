'use server'
// src/actions/conduces.actions.ts

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { conduceSchema } from '@/lib/validaciones/conduce.schema'
import * as conducesService from '@/services/conduces.service'

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

function parsearFormConduce(formData: FormData) {
  const detallesRaw = formData.get('detalles')
  let detalles: unknown = []
  try {
    detalles = detallesRaw ? JSON.parse(String(detallesRaw)) : []
  } catch {
    detalles = []
  }

  return conduceSchema.safeParse({
    escuelaId: formData.get('escuelaId'),
    tipoServicio: formData.get('tipoServicio'),
    fecha: formData.get('fecha'),
    observaciones: formData.get('observaciones') || undefined,
    detalles,
  })
}

export async function crearConduceAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'conduce.crear')

  const parsed = parsearFormConduce(formData)
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return {
      success: false,
      error: flat.formErrors[0],
      fieldErrors: flat.fieldErrors as Record<string, string>,
    }
  }

  try {
    const conduce = await conducesService.crearConduce(parsed.data, usuario.id)
    revalidatePath('/conduces')
    revalidatePath('/inventario')
    revalidatePath('/dashboard')
    return { success: true, id: conduce.id }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudo crear el conduce.'
    return { success: false, error: mensaje }
  }
}

export async function anularConduceAction(id: string): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'conduce.anular')

  try {
    await conducesService.anularConduce(id, usuario.id)
    revalidatePath('/conduces')
    revalidatePath(`/conduces/${id}`)
    revalidatePath('/inventario')
    return { success: true }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudo anular el conduce.'
    return { success: false, error: mensaje }
  }
}