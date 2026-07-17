// src/services/usuarios.service.ts
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { UsuarioInput } from '@/lib/validaciones/usuario.schema'

export async function listarUsuarios() {
  return prisma.usuario.findMany({
    include: { rol: true },
    orderBy: { nombre: 'asc' },
  })
}

export async function obtenerUsuario(id: string) {
  return prisma.usuario.findUniqueOrThrow({ where: { id }, include: { rol: true } })
}

export async function crearUsuario(data: UsuarioInput) {
  if (!data.password) {
    throw new Error('La contraseña es requerida al crear un usuario.')
  }
  const passwordHash = await bcrypt.hash(data.password, 10)

  return prisma.usuario.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      rolId: data.rolId,
      password: passwordHash,
    },
  })
}

export async function actualizarUsuario(id: string, data: UsuarioInput) {
  return prisma.usuario.update({
    where: { id },
    data: {
      nombre: data.nombre,
      email: data.email,
      rolId: data.rolId,
      // Solo actualiza la contraseña si se proporcionó una nueva
      ...(data.password ? { password: await bcrypt.hash(data.password, 10) } : {}),
    },
  })
}

export async function alternarActivoUsuario(id: string, activo: boolean) {
  return prisma.usuario.update({ where: { id }, data: { activo } })
}

// ------------------------------------------------------------
// Roles y permisos
// ------------------------------------------------------------

export async function listarRoles() {
  return prisma.rol.findMany({
    include: { permisos: true, _count: { select: { usuarios: true } } },
    orderBy: { nombre: 'asc' },
  })
}

export async function obtenerRol(id: string) {
  return prisma.rol.findUniqueOrThrow({
    where: { id },
    include: { permisos: true },
  })
}

export async function listarPermisosAgrupados() {
  const permisos = await prisma.permiso.findMany({ orderBy: [{ modulo: 'asc' }, { codigo: 'asc' }] })

  const porModulo = new Map<string, typeof permisos>()
  for (const p of permisos) {
    const grupo = porModulo.get(p.modulo) ?? []
    grupo.push(p)
    porModulo.set(p.modulo, grupo)
  }
  return [...porModulo.entries()].map(([modulo, permisos]) => ({ modulo, permisos }))
}

/** Reemplaza el set completo de permisos de un rol */
export async function actualizarPermisosRol(rolId: string, permisoIds: string[]) {
  return prisma.rol.update({
    where: { id: rolId },
    data: {
      permisos: {
        set: permisoIds.map((id) => ({ id })),
      },
    },
  })
}