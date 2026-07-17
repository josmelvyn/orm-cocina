'use server'
// src/actions/usuarios.actions.ts

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { usuarioSchema, rolPermisosSchema } from '@/lib/validaciones/usuario.schema'
import * as usuariosService from '@/services/usuarios.service'

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

export async function crearUsuarioAction(formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'usuario.crear')

  const parsed = usuarioSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await usuariosService.crearUsuario(parsed.data)
    revalidatePath('/usuarios')
    return { success: true }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudo crear el usuario.'
    return { success: false, error: mensaje }
  }
}

export async function actualizarUsuarioAction(id: string, formData: FormData): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'usuario.editar')

  const parsed = usuarioSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  try {
    await usuariosService.actualizarUsuario(id, parsed.data)
    revalidatePath('/usuarios')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'No se pudo actualizar el usuario. Verifica que el correo no esté en uso.' }
  }
}

export async function alternarActivoUsuarioAction(id: string, activo: boolean): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'usuario.editar')

  if (id === usuario.id && !activo) {
    return { success: false, error: 'No puedes desactivar tu propio usuario.' }
  }

  await usuariosService.alternarActivoUsuario(id, activo)
  revalidatePath('/usuarios')
  return { success: true }
}

export async function actualizarPermisosRolAction(
  rolId: string,
  formData: FormData
): Promise<ActionResult> {
  const usuario = await requiereSesion()
  requierePermiso(usuario.permisos, 'rol.administrar')

  const permisoIds = formData.getAll('permisoIds').map(String)
  const parsed = rolPermisosSchema.safeParse({ permisoIds })
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos.' }
  }

  await usuariosService.actualizarPermisosRol(rolId, parsed.data.permisoIds)
  revalidatePath('/roles')
  return { success: true }
}