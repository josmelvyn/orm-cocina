// src/services/instituciones.service.ts
import { prisma } from '@/lib/prisma'
import type { InstitucionInput } from '@/lib/validaciones/institucion.schema'

export async function listarInstituciones(opts?: { busqueda?: string }) {
  return prisma.institucion.findMany({
    where: {
      activo: true,
      ...(opts?.busqueda
        ? {
            OR: [
              { nombre: { contains: opts.busqueda, mode: 'insensitive' } },
              { rnc: { contains: opts.busqueda, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { _count: { select: { escuelas: true, facturas: true } } },
    orderBy: { nombre: 'asc' },
  })
}

export async function obtenerInstitucion(id: string) {
  return prisma.institucion.findUniqueOrThrow({
    where: { id },
    include: { escuelas: { where: { activo: true } } },
  })
}

export async function crearInstitucion(data: InstitucionInput) {
  return prisma.institucion.create({
    data: {
      nombre: data.nombre,
      rnc: data.rnc,
      direccion: data.direccion || null,
      telefono: data.telefono || null,
      email: data.email || null,
    },
  })
}

export async function actualizarInstitucion(id: string, data: InstitucionInput) {
  return prisma.institucion.update({
    where: { id },
    data: {
      nombre: data.nombre,
      rnc: data.rnc,
      direccion: data.direccion || null,
      telefono: data.telefono || null,
      email: data.email || null,
    },
  })
}

export async function desactivarInstitucion(id: string) {
  const escuelasActivas = await prisma.escuela.count({ where: { institucionId: id, activo: true } })
  if (escuelasActivas > 0) {
    throw new Error(
      `No se puede desactivar: hay ${escuelasActivas} escuela(s) activa(s) bajo esta institución.`
    )
  }
  return prisma.institucion.update({ where: { id }, data: { activo: false } })
}