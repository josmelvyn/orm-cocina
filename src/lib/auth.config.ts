// src/lib/auth.config.ts
// Configuración "edge-safe": SIN Prisma ni bcrypt aquí, porque el middleware
// corre en el Edge Runtime y esas librerías no son compatibles con Edge.
// Aquí solo definimos páginas, callbacks de autorización y el shape del token.

import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt', // obligatorio al usar Credentials provider
  },
  callbacks: {
    // Se ejecuta en cada request que pasa por el middleware.
    // Decide si el usuario puede ver la ruta solicitada.
    authorized({ auth, request }) {
      const usuarioLogueado = !!auth?.user
      const { pathname } = request.nextUrl

      const esRutaPublica =
        pathname.startsWith('/login') ||
        pathname.startsWith('/api/auth')

      if (esRutaPublica) return true
      if (!usuarioLogueado) return false

      return true // el chequeo fino de permisos por ruta se hace en el middleware.ts
    },

    // Se ejecuta al crear/actualizar el JWT. Inyecta rol y permisos en el token.
    // IMPORTANTE: vive aquí (no solo en auth.ts) porque el middleware corre en
    // Edge Runtime y solo tiene acceso a authConfig, no a la config completa.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.rol = user.rol
        token.permisos = user.permisos
      }
      return token
    },

    // Se ejecuta cada vez que se lee la sesión, tanto en el middleware como
    // en Server Components/Actions.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.rol = token.rol as string
        session.user.permisos = token.permisos as string[]
      }
      return session
    },
  },
  providers: [], // los providers reales (Credentials) se agregan en auth.ts (Node runtime)
} satisfies NextAuthConfig