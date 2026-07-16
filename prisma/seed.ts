// prisma/seed.ts
// Ejecutar con: npx prisma db seed
// (requiere agregar en package.json -> "prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" })

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg';


const prisma = new PrismaClient();

// ------------------------------------------------------------
// Definición de permisos por módulo
// ------------------------------------------------------------
const PERMISOS = [
  // Inventario
  { codigo: 'inventario.ver', modulo: 'inventario' },
  { codigo: 'inventario.crear', modulo: 'inventario' },
  { codigo: 'inventario.editar', modulo: 'inventario' },
  { codigo: 'inventario.eliminar', modulo: 'inventario' },
  { codigo: 'inventario.ajustar', modulo: 'inventario' },

  // Recetas
  { codigo: 'receta.ver', modulo: 'receta' },
  { codigo: 'receta.crear', modulo: 'receta' },
  { codigo: 'receta.editar', modulo: 'receta' },
  { codigo: 'receta.eliminar', modulo: 'receta' },

  // Escuelas / Instituciones
  { codigo: 'escuela.ver', modulo: 'escuela' },
  { codigo: 'escuela.crear', modulo: 'escuela' },
  { codigo: 'escuela.editar', modulo: 'escuela' },
  { codigo: 'institucion.ver', modulo: 'institucion' },
  { codigo: 'institucion.crear', modulo: 'institucion' },
  { codigo: 'institucion.editar', modulo: 'institucion' },

  // Conduces
  { codigo: 'conduce.ver', modulo: 'conduce' },
  { codigo: 'conduce.crear', modulo: 'conduce' },
  { codigo: 'conduce.anular', modulo: 'conduce' },
  { codigo: 'conduce.imprimir', modulo: 'conduce' },

  // Facturación
  { codigo: 'factura.ver', modulo: 'factura' },
  { codigo: 'factura.emitir', modulo: 'factura' },
  { codigo: 'factura.anular', modulo: 'factura' },
  { codigo: 'factura.imprimir', modulo: 'factura' },

  // Reportes
  { codigo: 'reporte.ver', modulo: 'reporte' },
  { codigo: 'reporte.exportar', modulo: 'reporte' },

  // Usuarios / Roles (administración)
  { codigo: 'usuario.ver', modulo: 'usuario' },
  { codigo: 'usuario.crear', modulo: 'usuario' },
  { codigo: 'usuario.editar', modulo: 'usuario' },
  { codigo: 'rol.administrar', modulo: 'rol' },
] as const

// ------------------------------------------------------------
// Definición de roles y qué permisos tiene cada uno
// ------------------------------------------------------------
const ROLES: Record<string, { descripcion: string; permisos: string[] }> = {
  ADMIN: {
    descripcion: 'Acceso total al sistema',
    permisos: PERMISOS.map((p) => p.codigo), // todos
  },
  PRODUCCION: {
    descripcion: 'Gestiona recetas e inventario de producción',
    permisos: [
      'inventario.ver',
      'inventario.crear',
      'inventario.editar',
      'inventario.ajustar',
      'receta.ver',
      'receta.crear',
      'receta.editar',
      'reporte.ver',
    ],
  },
  DESPACHO: {
    descripcion: 'Genera y gestiona conduces hacia las escuelas',
    permisos: [
      'conduce.ver',
      'conduce.crear',
      'conduce.imprimir',
      'escuela.ver',
      'receta.ver',
      'inventario.ver',
      'reporte.ver',
    ],
  },
  FACTURACION: {
    descripcion: 'Genera facturas con comprobante gubernamental a partir de conduces',
    permisos: [
      'factura.ver',
      'factura.emitir',
      'factura.anular',
      'factura.imprimir',
      'conduce.ver',
      'institucion.ver',
      'institucion.crear',
      'institucion.editar',
      'reporte.ver',
      'reporte.exportar',
    ],
  },
  SUPERVISOR: {
    descripcion: 'Solo lectura de reportes y consultas generales',
    permisos: [
      'inventario.ver',
      'receta.ver',
      'conduce.ver',
      'factura.ver',
      'escuela.ver',
      'institucion.ver',
      'reporte.ver',
      'reporte.exportar',
    ],
  },
}

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Crear permisos (upsert para poder correr el seed varias veces sin duplicar)
  console.log('→ Creando permisos...')
  for (const permiso of PERMISOS) {
    await prisma.permiso.upsert({
      where: { codigo: permiso.codigo },
      update: {},
      create: permiso,
    })
  }

  // 2. Crear roles y conectar sus permisos
  console.log('→ Creando roles...')
  for (const [nombreRol, config] of Object.entries(ROLES)) {
    await prisma.rol.upsert({
      where: { nombre: nombreRol },
      update: {
        descripcion: config.descripcion,
        permisos: {
          set: [], // limpia y vuelve a conectar (idempotente)
          connect: config.permisos.map((codigo) => ({ codigo })),
        },
      },
      create: {
        nombre: nombreRol,
        descripcion: config.descripcion,
        permisos: {
          connect: config.permisos.map((codigo) => ({ codigo })),
        },
      },
    })
  }

  // 3. Crear usuario administrador inicial
  console.log('→ Creando usuario administrador...')
  const rolAdmin = await prisma.rol.findUniqueOrThrow({ where: { nombre: 'ADMIN' } })

  const passwordHash = await bcrypt.hash('Admin123!', 10)

  await prisma.usuario.upsert({
    where: { email: 'admin@cocinaindustrial.com' },
    update: {},
    create: {
      nombre: 'Administrador del Sistema',
      email: 'admin@cocinaindustrial.com',
      password: passwordHash,
      rolId: rolAdmin.id,
      activo: true,
    },
  })

  // 4. Institución gubernamental de ejemplo
  console.log('→ Creando institución de ejemplo...')
  const institucion = await prisma.institucion.upsert({
    where: { rnc: '401000000' },
    update: {},
    create: {
      nombre: 'Ministerio de Educación',
      rnc: '401000000',
      direccion: 'Santo Domingo, República Dominicana',
      email: 'contacto@minerd.gob.do',
    },
  })

  // 5. Escuela de ejemplo
  console.log('→ Creando escuela de ejemplo...')
  await prisma.escuela.upsert({
    where: { codigo: 'ESC-001' },
    update: {},
    create: {
      codigo: 'ESC-001',
      nombre: 'Escuela Primaria Ejemplo',
      direccion: 'Calle Principal #1',
      encargado: 'Director de Ejemplo',
      institucionId: institucion.id,
    },
  })

  // 6. Categoría e insumo de ejemplo
  console.log('→ Creando categoría e insumo de ejemplo...')
  const categoria = await prisma.categoriaInsumo.upsert({
    where: { nombre: 'Víveres' },
    update: {},
    create: { nombre: 'Víveres' },
  })

  await prisma.insumo.upsert({
    where: { codigo: 'INS-001' },
    update: {},
    create: {
      codigo: 'INS-001',
      nombre: 'Arroz',
      categoriaId: categoria.id,
      unidadMedida: 'lb',
      stockActual: 500,
      stockMinimo: 100,
      costoUnitario: 35.0,
    },
  })

  console.log('✅ Seed completado.')
  console.log('   Usuario: admin@cocinaindustrial.com')
  console.log('   Password: Admin123!')
  console.log('   ⚠️  Cambia esta contraseña en producción.')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })