'use client'
// src/components/facturacion/factura-form.tsx

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { generarFacturaAction, buscarConducesFacturablesAction } from '@/actions/facturacion.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Institucion = { id: string; nombre: string; rnc: string }
type ConduceFacturable = {
  id: string
  numero: string
  fecha: string
  tipoServicio: string
  escuelaNombre: string
  totalRaciones: number
  totalMonto: number
}

function formatoRD(valor: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

function inicioMesISO() {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

export function FacturaForm({ instituciones }: { instituciones: Institucion[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isBuscando, startBusqueda] = useTransition()
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const [institucionId, setInstitucionId] = useState('')
  const [periodoInicio, setPeriodoInicio] = useState(inicioMesISO())
  const [periodoFin, setPeriodoFin] = useState(hoyISO())
  const [itbisPorcentaje, setItbisPorcentaje] = useState('18')

  const [conducesDisponibles, setConducesDisponibles] = useState<ConduceFacturable[]>([])
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!institucionId || !periodoInicio || !periodoFin) {
      setConducesDisponibles([])
      return
    }
    startBusqueda(async () => {
      const resultado = await buscarConducesFacturablesAction(institucionId, periodoInicio, periodoFin)
      setConducesDisponibles(resultado)
      setSeleccionados(new Set(resultado.map((c) => c.id))) // selecciona todos por defecto
    })
  }, [institucionId, periodoInicio, periodoFin])

  function toggleConduce(id: string) {
    setSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const subtotal = conducesDisponibles
    .filter((c) => seleccionados.has(c.id))
    .reduce((acc, c) => acc + c.totalMonto, 0)
  const itbis = subtotal * (parseFloat(itbisPorcentaje) / 100 || 0)
  const total = subtotal + itbis

  function handleSubmit(formData: FormData) {
    setErrores({})
    setErrorGeneral(null)

    formData.set('conduceIds', JSON.stringify([...seleccionados]))

    startTransition(async () => {
      const resultado = await generarFacturaAction(formData)

      if (!resultado.success) {
        if (resultado.fieldErrors) setErrores(resultado.fieldErrors)
        setErrorGeneral(resultado.error || 'Revisa los campos marcados.')
        return
      }

      router.push(`/facturacion/${resultado.id}`)
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="space-y-1.5">
          <Label htmlFor="institucionId">Institución gubernamental</Label>
          <Select name="institucionId" onValueChange={(value) => setInstitucionId(String(value))}>
            <SelectTrigger id="institucionId">
              <SelectValue placeholder="Selecciona una institución" />
            </SelectTrigger>
            <SelectContent>
              {instituciones.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.nombre} — RNC {i.rnc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errores.institucionId && <p className="text-xs text-red-600">{errores.institucionId}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="periodoInicio">Período desde</Label>
            <Input
              id="periodoInicio"
              name="periodoInicio"
              type="date"
              value={periodoInicio}
              onChange={(e) => setPeriodoInicio(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="periodoFin">Período hasta</Label>
            <Input
              id="periodoFin"
              name="periodoFin"
              type="date"
              value={periodoFin}
              onChange={(e) => setPeriodoFin(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tipoNcf">Tipo de comprobante (NCF)</Label>
            <Input id="tipoNcf" name="tipoNcf" placeholder="B15" />
            {errores.tipoNcf && <p className="text-xs text-red-600">{errores.tipoNcf}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ncf">Número de comprobante</Label>
            <Input id="ncf" name="ncf" placeholder="B1500000001" />
            {errores.ncf && <p className="text-xs text-red-600">{errores.ncf}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="itbisPorcentaje">ITBIS (%)</Label>
            <Input
              id="itbisPorcentaje"
              name="itbisPorcentaje"
              type="number"
              step="0.01"
              value={itbisPorcentaje}
              onChange={(e) => setItbisPorcentaje(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Conduces disponibles para facturar
        </h2>

        {isBuscando && <p className="text-sm text-slate-400">Buscando conduces...</p>}

        {!isBuscando && institucionId && conducesDisponibles.length === 0 && (
          <p className="text-sm text-slate-400">
            No hay conduces en estado "EMITIDO" para esta institución en el período seleccionado.
          </p>
        )}

        {!isBuscando && !institucionId && (
          <p className="text-sm text-slate-400">Selecciona una institución para ver sus conduces.</p>
        )}

        {conducesDisponibles.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="px-3 py-2 font-medium">Número</th>
                  <th className="px-3 py-2 font-medium">Escuela</th>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 text-right font-medium">Raciones</th>
                  <th className="px-3 py-2 text-right font-medium">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {conducesDisponibles.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={seleccionados.has(c.id)}
                        onChange={() => toggleConduce(c.id)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900">{c.numero}</td>
                    <td className="px-3 py-2 text-slate-600">{c.escuelaNombre}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-500">
                      {new Date(c.fecha).toLocaleDateString('es-DO')}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-500">{c.totalRaciones}</td>
                    <td className="px-3 py-2 text-right text-slate-900">{formatoRD(c.totalMonto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {errores.conduceIds && <p className="mt-2 text-xs text-red-600">{errores.conduceIds}</p>}

        <div className="mt-4 space-y-1 rounded-lg bg-slate-50 px-4 py-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal ({seleccionados.size} conduce(s))</span>
            <span>{formatoRD(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>ITBIS ({itbisPorcentaje}%)</span>
            <span>{formatoRD(itbis)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatoRD(total)}</span>
          </div>
        </div>
      </div>

      {errorGeneral && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorGeneral}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || seleccionados.size === 0}>
          {isPending ? 'Generando factura...' : 'Generar factura'}
        </Button>
      </div>
    </form>
  )
}