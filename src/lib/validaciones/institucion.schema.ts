// src/lib/validaciones/institucion.schema.ts
import { z } from 'zod'

export const institucionSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido').max(150),
  rnc: z.string().min(5, 'El RNC es requerido').max(20),
  direccion: z.string().max(200).optional(),
  telefono: z.string().max(30).optional(),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
})

export type InstitucionInput = z.infer<typeof institucionSchema>

export const escuelaSchema = z.object({
  codigo: z.string().min(2, 'El código es requerido').max(30),
  nombre: z.string().min(2, 'El nombre es requerido').max(150),
  direccion: z.string().max(200).optional(),
  telefono: z.string().max(30).optional(),
  encargado: z.string().max(100).optional(),
  director: z.string().max(100).optional(),
  provincia: z.string().max(100).optional(),
  ruta: z.string().max(60).optional(),
  regionalDistrito: z.string().max(20).optional(),
  institucionId: z.string().min(1, 'Selecciona una institución'),
})

export type EscuelaInput = z.infer<typeof escuelaSchema>

export const empresaSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido').max(150),
  direccion: z.string().min(2, 'La dirección es requerida').max(200),
  telefono: z.string().min(4, 'El teléfono es requerido').max(30),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  rnc: z.string().min(5, 'El RNC es requerido').max(20),
})