// src/lib/auth.ts
// Configuración completa de NextAuth (corre en Node runtime: Server Actions, Route Handlers).
// Aquí sí podemos usar Prisma y bcrypt.

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/lib/auth.config'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const usuario = await prisma.usuario.findUnique({
          where: { email, activo: true },
          include: {
            rol: {
              include: { permisos: true },
            },
          },
        })

        if (!usuario) return null

        const passwordValida = await bcrypt.compare(password, usuario.password)
        if (!passwordValida) return null

        // Actualiza último acceso (no bloquea el login si falla)
        prisma.usuario
          .update({ where: { id: usuario.id }, data: { ultimoAcceso: new Date() } })
          .catch(() => {})

        // Lo que retornamos aquí queda disponible en el callback `jwt` como `user`
        return {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol.nombre,
          permisos: usuario.rol.permisos.map((p) => p.codigo),
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
  },
})