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
  },
  providers: [], // los providers reales (Credentials) se agregan en auth.ts (Node runtime)
} satisfies NextAuthConfig