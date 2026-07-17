// src/app/(dashboard)/configuracion/empresa/page.tsx
import { obtenerEmpresa } from '@/services/empresa.service'
import { EmpresaForm } from '@/components/configuracion/empresa-form'

export default async function ConfiguracionEmpresaPage() {
  const empresa = await obtenerEmpresa()

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Datos de la empresa</h1>
        <p className="text-sm text-slate-500">
          Esta información aparece en el encabezado de los conduces impresos
        </p>
      </div>

      <EmpresaForm empresa={empresa} />
    </div>
  )
}