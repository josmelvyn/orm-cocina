'use server'
// src/actions/auth.actions.ts

import { signIn, signOut } from '@/lib/auth'
import { AuthError } from 'next-auth'

export async function authenticate(formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    })
    return { error: null }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Credenciales inválidas o usuario inactivo.' }
    }
    throw error
  }
}

export async function cerrarSesion() {
  await signOut({ redirectTo: '/login' })
}