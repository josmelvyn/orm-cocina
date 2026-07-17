// src/app/(dashboard)/instituciones/nueva/page.tsx
import { InstitucionForm } from '@/components/instituciones/institucion-form'

export default function NuevaInstitucionPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Nueva institución</h1>
      <InstitucionForm />
    </div>
  )
}