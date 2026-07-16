import { LoginForm } from '@/components/auth/login-form'
 
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">
          Sistema de Cocina Industrial
        </h1>
        <p className="mb-6 text-sm text-slate-500">Inicia sesión para continuar</p>
        <LoginForm />
      </div>
    </div>
  )
}
 