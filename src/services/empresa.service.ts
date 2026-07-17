// src/services/empresa.service.ts
import { prisma } from '@/lib/prisma'

/**
 * La empresa (suplidor) es un registro único — no hay CRUD de "muchas empresas",
 * solo se edita el mismo registro. Si no existe todavía, se crea uno vacío
 * la primera vez que se consulta.
 */
export async function obtenerEmpresa() {
  const existente = await prisma.empresa.findFirst()
  if (existente) return existente

  return prisma.empresa.create({
    data: {
      nombre: 'Mi Empresa',
      direccion: '',
      telefono: '',
      rnc: '',
    },
  })
}

export async function actualizarEmpresa(data: {
  nombre: string
  direccion: string
  telefono: string
  email?: string
  rnc: string
}) {
  const empresa = await obtenerEmpresa()
  return prisma.empresa.update({
    where: { id: empresa.id },
    data: {
      nombre: data.nombre,
      direccion: data.direccion,
      telefono: data.telefono,
      email: data.email || null,
      rnc: data.rnc,
    },
  })
}