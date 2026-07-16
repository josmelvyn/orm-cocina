'use server'
// src/actions/recetas.actions.ts

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { recetaSchema } from '@/lib/validaciones/receta.schema'
import * as recetasService from '@/services/recetas.service'

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

/** Convierte el FormData plano + el campo JSON "ingredientes" a un objeto validable */
function parsearFormReceta(formData: FormData) {
  const ingredientesRaw = formData.get('ingredientes')
  let ingredientes: unknown = []
  try {
    ingredientes = ingredientesRaw ? JSON.parse(String(ingredientesRaw)) : []
  } catch {
    ingredientes = []
  }

  return recetaSchema.safeParse({
    codigo: formData.get('codigo'),
    nombre: formData.get('nombre'),
    tipoServicio: formData.get('tipoServicio'),
    porcionesBase: formData.get('porcionesBase'),
    precioPorcion: formData.get('precioPorcion'),
    ingredientes,
  })
}

export async function crearRecetaAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'receta.crear')

  const parsed = parsearFormReceta(formData)
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return {
      success: false,
      error: flat.formErrors[0],
      fieldErrors: flat.fieldErrors as Record<string, string>,
    }
  }

  try {
    await recetasService.crearReceta(parsed.data)
    revalidatePath('/recetas')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo crear la receta. Verifica que el código no exista.' }
  }
}

export async function actualizarRecetaAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'receta.editar')

  const parsed = parsearFormReceta(formData)
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return {
      success: false,
      error: flat.formErrors[0],
      fieldErrors: flat.fieldErrors as Record<string, string>,
    }
  }

  try {
    await recetasService.actualizarReceta(id, parsed.data)
    revalidatePath('/recetas')
    revalidatePath(`/recetas/${id}`)
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo actualizar la receta.' }
  }
}

export async function desactivarRecetaAction(id: string): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'receta.eliminar')

  await recetasService.desactivarReceta(id)
  revalidatePath('/recetas')
  return { success: true }
}