'use client'
// src/components/conduces/conduce-filtros.tsx

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Escuela = { id: string; nombre: string }

export function ConduceFiltros({ escuelas }: { escuelas: Escuela[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function actualizarFiltro(clave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (valor && valor !== 'TODOS') {
      params.set(clave, valor)
    } else {
      params.delete(clave)
    }
    router.push(`/conduces?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <Select
        defaultValue={searchParams.get('escuelaId') ?? 'TODOS'}
        onValueChange={(v) => actualizarFiltro('escuelaId', v ?? '')}
      >
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Todas las escuelas" />
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

      <Select
        defaultValue={searchParams.get('estado') ?? 'TODOS'}
        onValueChange={(v) => actualizarFiltro('estado', v ?? '')}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODOS">Todos los estados</SelectItem>
          <SelectItem value="EMITIDO">Emitido</SelectItem>
          <SelectItem value="FACTURADO">Facturado</SelectItem>
          <SelectItem value="ANULADO">Anulado</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-40"
        defaultValue={searchParams.get('desde') ?? ''}
        onChange={(e) => actualizarFiltro('desde', e.target.value)}
      />
      <span className="text-sm text-slate-400">hasta</span>
      <Input
        type="date"
        className="w-40"
        defaultValue={searchParams.get('hasta') ?? ''}
        onChange={(e) => actualizarFiltro('hasta', e.target.value)}
      />
    </div>
  )
}