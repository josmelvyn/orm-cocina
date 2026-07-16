

import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/lib/auth.config'
import { permisosRequeridosPara, tieneAlgunPermiso } from '@/lib/permisos'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const usuario = req.auth?.user

  const esRutaPublica =
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')

  if (esRutaPublica) {
    return NextResponse.next()
  }

  // 1. No hay sesión -> redirige a login conservando la ruta de destino
  if (!usuario) {
    const loginUrl = new URL('/login', req.nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Hay sesión -> verifica si la ruta exige permisos específicos
  const permisosRequeridos = permisosRequeridosPara(pathname)

  if (permisosRequeridos) {
    const permisosUsuario = usuario.permisos ?? []
    const autorizado = tieneAlgunPermiso(permisosUsuario, permisosRequeridos)

    if (!autorizado) {
      const url = new URL('/dashboard', req.nextUrl.origin)
      url.searchParams.set('error', 'sin-permiso')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
})

// Define en qué rutas corre el middleware (todo excepto assets estáticos)
export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.svg$).*)'],
}