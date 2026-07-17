// src/lib/validaciones/conduce.schema.ts
import { z } from 'zod'

export const detalleConduceSchema = z.object({
  recetaId: z.string().min(1, 'Selecciona una receta'),
  cantidad: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
})

export const conduceSchema = z.object({
  escuelaId: z.string().min(1, 'Selecciona una escuela'),
  tipoServicio: z.enum(['DESAYUNO', 'ALMUERZO', 'MERIENDA']),
  fecha: z.string().min(1, 'La fecha es requerida'),
  postre: z.string().max(100).optional(),
  observaciones: z.string().max(500).optional(),
  detalles: z.array(detalleConduceSchema).min(1, 'Agrega al menos una receta'),
})

export type ConduceInput = z.infer<typeof conduceSchema>
export type DetalleConduceInput = z.infer<typeof detalleConduceSchema>