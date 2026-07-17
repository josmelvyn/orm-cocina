'use client'
// src/components/reportes/reporte-filtros.tsx

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Opcion = { id: string; nombre: string }

export function ReporteFiltros({
  instituciones,
  escuelas,
  mostrarEstado,
  opcionesEstado,
}: {
  instituciones?: Opcion[]
  escuelas?: Opcion[]
  mostrarEstado?: boolean
  opcionesEstado?: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function actualizar(clave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (valor && valor !== 'TODOS') params.set(clave, valor)
    else params.delete(clave)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 print:hidden">
      <Input
        type="date"
        className="w-40"
        defaultValue={searchParams.get('desde') ?? ''}
        onChange={(e) => actualizar('desde', e.target.value)}
      />
      <span className="text-sm text-slate-400">hasta</span>
      <Input
        type="date"
        className="w-40"
        defaultValue={searchParams.get('hasta') ?? ''}
        onChange={(e) => actualizar('hasta', e.target.value)}
      />

      {instituciones && (
        <Select
          defaultValue={searchParams.get('institucionId') ?? 'TODOS'}
          onValueChange={(v) => actualizar('institucionId', v?? "")}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Todas las instituciones">
            {(value: string) => instituciones.find((e) => e.id === value)?.nombre}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todas las instituciones</SelectItem>
            {instituciones.map((i) => (
              <SelectItem key={i.id} value={i.id}>
                {i.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {escuelas && (
        <Select
          defaultValue={searchParams.get('escuelaId') ?? 'TODOS'}
          onValueChange={(v) => actualizar('escuelaId', v ?? "")}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Todas las escuelas">
            {(value: string) => escuelas.find((e) => e.id === value)?.nombre}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todas las escuelas</SelectItem>
            {escuelas.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {mostrarEstado && opcionesEstado && (
        <Select
          defaultValue={searchParams.get('estado') ?? 'TODOS'}
          onValueChange={(v) => actualizar('estado', v ?? "")}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos los estados</SelectItem>
            {opcionesEstado.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}