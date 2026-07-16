
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      rol: string
      permisos: string[]
    } & DefaultSession['user']
  }

  interface User {
    rol: string
    permisos: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    rol: string
    permisos: string[]
  }
}