// src/services/escuelas.service.ts
import { prisma } from '@/lib/prisma'
import type { EscuelaInput } from '@/lib/validaciones/institucion.schema'

export async function listarEscuelas(opts?: { busqueda?: string; institucionId?: string }) {
  return prisma.escuela.findMany({
    where: {
      activo: true,
      ...(opts?.institucionId ? { institucionId: opts.institucionId } : {}),
      ...(opts?.busqueda
        ? {
            OR: [
              { nombre: { contains: opts.busqueda, mode: 'insensitive' } },
              { codigo: { contains: opts.busqueda, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { institucion: true },
    orderBy: { nombre: 'asc' },
  })
}

export async function obtenerEscuela(id: string) {
  return prisma.escuela.findUniqueOrThrow({
    where: { id },
    include: { institucion: true },
  })
}

export async function crearEscuela(data: EscuelaInput) {
  return prisma.escuela.create({
    data: {
      codigo: data.codigo,
      nombre: data.nombre,
      direccion: data.direccion || null,
      telefono: data.telefono || null,
      encargado: data.encargado || null,
      director: data.director || null,
      provincia: data.provincia || null,
      ruta: data.ruta || null,
      regionalDistrito: data.regionalDistrito || null,
      institucionId: data.institucionId,
    },
  })
}

export async function actualizarEscuela(id: string, data: EscuelaInput) {
  return prisma.escuela.update({
    where: { id },
    data: {
      codigo: data.codigo,
      nombre: data.nombre,
      direccion: data.direccion || null,
      telefono: data.telefono || null,
      encargado: data.encargado || null,
      director: data.director || null,
      provincia: data.provincia || null,
      ruta: data.ruta || null,
      regionalDistrito: data.regionalDistrito || null,
      institucionId: data.institucionId,
    },
  })
}

export async function desactivarEscuela(id: string) {
  const conducesActivos = await prisma.conduce.count({
    where: { escuelaId: id, estado: { not: 'ANULADO' } },
  })
  if (conducesActivos > 0) {
    throw new Error(
      `No se puede desactivar: hay ${conducesActivos} conduce(s) activo(s) para esta escuela.`
    )
  }
  return prisma.escuela.update({ where: { id }, data: { activo: false } })
}