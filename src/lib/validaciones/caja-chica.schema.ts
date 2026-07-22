// src/lib/validaciones/caja-chica.schema.ts
import { z } from 'zod'

export const desembolsoSchema = z.object({
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  concepto: z.string().min(2, 'El concepto es requerido').max(200),
  beneficiario: z.string().max(100).optional(),
  comprobante: z.string().max(50).optional(),
})

export type DesembolsoInput = z.infer<typeof desembolsoSchema>

export const reposicionSchema = z.object({
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  concepto: z.string().max(200).optional(),
})

export const configCajaSchema = z.object({
  fondoFijo: z.coerce.number().positive('El fondo fijo debe ser mayor a 0'),
  responsable: z.string().max(100).optional(),
})