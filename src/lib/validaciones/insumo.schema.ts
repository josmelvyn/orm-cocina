// src/lib/validaciones/insumo.schema.ts
import { z } from 'zod'

export const insumoSchema = z.object({
  codigo: z.string().min(2, 'El código es requerido').max(30),
  nombre: z.string().min(2, 'El nombre es requerido').max(100),
  categoriaId: z.string().optional().nullable(),
  unidadMedida: z.string().min(1, 'La unidad de medida es requerida'),
  stockMinimo: z.coerce.number().min(0, 'No puede ser negativo'),
  costoUnitario: z.coerce.number().min(0, 'No puede ser negativo'),
})

export type InsumoInput = z.infer<typeof insumoSchema>

export const movimientoSchema = z.object({
  insumoId: z.string().min(1, 'Selecciona un insumo'),
  tipo: z.enum(['ENTRADA', 'SALIDA', 'AJUSTE', 'MERMA']),
  cantidad: z.coerce.number().positive('La cantidad debe ser mayor a 0'),
  costoUnitario: z.coerce.number().min(0).optional(),
  motivo: z.string().max(200).optional(),
})

export type MovimientoInput = z.infer<typeof movimientoSchema>

export const categoriaSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido').max(60),
})

export type CategoriaInput = z.infer<typeof categoriaSchema>