'use server'
// src/actions/inventario.actions.ts

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { insumoSchema, movimientoSchema, categoriaSchema } from '@/lib/validaciones/insumo.schema'
import * as inventarioService from '@/services/inventario.service'

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

export async function crearInsumoAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'inventario.crear')

  const parsed = insumoSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await inventarioService.crearInsumo(parsed.data)
    revalidatePath('/inventario')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo crear el insumo. Verifica que el código no exista.' }
  }
}

export async function actualizarInsumoAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'inventario.editar')

  const parsed = insumoSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await inventarioService.actualizarInsumo(id, parsed.data)
    revalidatePath('/inventario')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo actualizar el insumo.' }
  }
}

export async function desactivarInsumoAction(id: string): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'inventario.eliminar')

  await inventarioService.desactivarInsumo(id)
  revalidatePath('/inventario')
  return { success: true }
}

export async function registrarMovimientoAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'inventario.ajustar')

  const parsed = movimientoSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await inventarioService.registrarMovimiento(parsed.data, usuario.id)
    revalidatePath('/inventario')
    revalidatePath('/inventario/movimientos')
    return { success: true }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudo registrar el movimiento.'
    return { success: false, error: mensaje }
  }
}

export async function crearCategoriaAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'inventario.crear')

  const parsed = categoriaSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await inventarioService.crearCategoria(parsed.data.nombre)
    revalidatePath('/inventario/categorias')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo crear la categoría. Verifica que no exista ya.' }
  }
}

export async function actualizarCategoriaAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'inventario.editar')

  const parsed = categoriaSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await inventarioService.actualizarCategoria(id, parsed.data.nombre)
    revalidatePath('/inventario/categorias')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo actualizar la categoría.' }
  }
}

export async function eliminarCategoriaAction(id: string): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'inventario.eliminar')

  try {
    await inventarioService.eliminarCategoria(id)
    revalidatePath('/inventario/categorias')
    return { success: true }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudo eliminar la categoría.'
    return { success: false, error: mensaje }
  }
}