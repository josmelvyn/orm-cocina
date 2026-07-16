// src/lib/validaciones/receta.schema.ts
import { z } from 'zod'

export const ingredienteSchema = z.object({
  insumoId: z.string().min(1, 'Selecciona un insumo'),
  cantidad: z.coerce.number().positive('La cantidad debe ser mayor a 0'),
})

export const recetaSchema = z.object({
  codigo: z.string().min(2, 'El código es requerido').max(30),
  nombre: z.string().min(2, 'El nombre es requerido').max(120),
  tipoServicio: z.enum(['DESAYUNO', 'ALMUERZO', 'MERIENDA']),
  porcionesBase: z.coerce.number().int().positive('Debe ser al menos 1'),
  precioPorcion: z.coerce.number().positive('El precio debe ser mayor a 0'),
  ingredientes: z
    .array(ingredienteSchema)
    .min(1, 'Agrega al menos un ingrediente'),
})

export type RecetaInput = z.infer<typeof recetaSchema>
export type IngredienteInput = z.infer<typeof ingredienteSchema>