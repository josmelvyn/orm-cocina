// src/lib/validaciones/contabilidad.schema.ts
import { z } from 'zod'

export const gastoSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  categoriaId: z.string().min(1, 'Selecciona una categoría'),
  descripcion: z.string().min(2, 'La descripción es requerida').max(200),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  metodoPago: z.enum(['Efectivo', 'Transferencia', 'Cheque', 'Tarjeta']),
  comprobante: z.string().max(50).optional(),
})

export type GastoInput = z.infer<typeof gastoSchema>

export const ingresoSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  concepto: z.string().min(2, 'El concepto es requerido').max(200),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
})

export type IngresoInput = z.infer<typeof ingresoSchema>

export const categoriaGastoSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido').max(60),
})