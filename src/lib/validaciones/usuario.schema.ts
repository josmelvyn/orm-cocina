// src/lib/validaciones/usuario.schema.ts
import { z } from 'zod'

export const usuarioSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido').max(100),
  email: z.string().email('Correo inválido'),
  rolId: z.string().min(1, 'Selecciona un rol'),
  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .optional()
    .or(z.literal('')), // opcional al editar (si vacío, no se cambia)
})

export type UsuarioInput = z.infer<typeof usuarioSchema>

export const rolPermisosSchema = z.object({
  permisoIds: z.array(z.string()),
})