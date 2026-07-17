'use server'
// src/actions/empresa.actions.ts

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { empresaSchema } from '@/lib/validaciones/institucion.schema'
import * as empresaService from '@/services/empresa.service'

type ActionResult = { success: boolean; error?: string; fieldErrors?: Record<string, string> }

export async function actualizarEmpresaAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) throw new Error('No autenticado')
  if (!session.user.permisos.includes('empresa.editar')) {
    return { success: false, error: 'No tienes permiso para realizar esta acción' }
  }

  const parsed = empresaSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  await empresaService.actualizarEmpresa(parsed.data)
  revalidatePath('/configuracion/empresa')
  return { success: true }
}