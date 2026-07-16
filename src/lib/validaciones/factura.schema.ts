// src/lib/validaciones/factura.schema.ts
import { z } from 'zod'

export const facturaSchema = z.object({
  institucionId: z.string().min(1, 'Selecciona una institución'),
  ncf: z.string().min(6, 'El NCF es requerido'),
  tipoNcf: z.string().min(3, 'El tipo de comprobante es requerido'),
  periodoInicio: z.string().min(1, 'La fecha inicial es requerida'),
  periodoFin: z.string().min(1, 'La fecha final es requerida'),
  itbisPorcentaje: z.coerce.number().min(0).max(100).default(18),
  conduceIds: z.array(z.string()).min(1, 'Selecciona al menos un conduce'),
})

export type FacturaInput = z.infer<typeof facturaSchema>