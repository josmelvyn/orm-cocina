'use client'
// src/components/caja-chica/caja-chica-dashboard.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  DollarSign,
  Wallet,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  Settings,
} from 'lucide-react'
import {
  abrirCajaAction,
  cerrarCajaAction,
  registrarDesembolsoAction,
  reponerCajaAction,
  configurarCajaAction,
} from '@/actions/caja-chica.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Caja = {
  id: string
  nombre: string
  fondoFijo: number
  saldoActual: number
  estado: string
  responsable: string | null
}

type Movimiento = {
  id: string
  tipo: string
  fecha: Date
  monto: number
  concepto: string
  beneficiario: string | null
  comprobante: string | null
  saldoResultante: number
  creadoPor: string
}

function formatoRD(v: number) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v)
}

const ESTILO_TIPO: Record<string, string> = {
  APERTURA: 'bg-blue-50 text-blue-700',
  DESEMBOLSO: 'bg-red-50 text-red-700',
  REPOSICION: 'bg-emerald-50 text-emerald-700',
  CIERRE: 'bg-slate-100 text-slate-700',
}

export function CajaChicaDashboard({
  caja,
  movimientos,
}: {
  caja: Caja
  movimientos: Movimiento[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [mostrarConfig, setMostrarConfig] = useState(caja.fondoFijo === 0)
  const [mostrarReposicion, setMostrarReposicion] = useState(false)

  const abierta = caja.estado === 'ABIERTA'
  const porcentajeUsado =
    caja.fondoFijo > 0 ? ((caja.fondoFijo - caja.saldoActual) / caja.fondoFijo) * 100 : 0
  const saldoBajo = porcentajeUsado > 70

  function ejecutar(action: () => Promise<{ success: boolean; error?: string }>, mensajeExito: string) {
    setError(null)
    setExito(null)
    startTransition(async () => {
      const res = await action()
      if (!res.success) {
        setError(res.error || 'Error inesperado.')
        return
      }
      setExito(mensajeExito)
      router.refresh()
    })
  }

  function handleDesembolso(formData: FormData) {
    setError(null)
    setExito(null)
    setErrores({})
    startTransition(async () => {
      const res = await registrarDesembolsoAction(formData)
      if (!res.success) {
        if (res.fieldErrors) setErrores(res.fieldErrors)
        setError(res.error || 'Error al registrar.')
        return
      }
      setExito('Desembolso registrado.')
      router.refresh()
    })
  }

  function handleReposicion(formData: FormData) {
    setError(null)
    setExito(null)
    startTransition(async () => {
      const res = await reponerCajaAction(formData)
      if (!res.success) {
        setError(res.error || 'Error al reponer.')
        return
      }
      setExito('Reposición registrada.')
      setMostrarReposicion(false)
      router.refresh()
    })
  }

  function handleConfig(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await configurarCajaAction(formData)
      if (!res.success) {
        if (res.fieldErrors) setErrores(res.fieldErrors)
        return
      }
      setMostrarConfig(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de estado */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Fondo fijo autorizado</p>
            <Wallet className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatoRD(caja.fondoFijo)}</p>
        </div>

        <div
          className={cn(
            'rounded-xl border p-5',
            saldoBajo ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'
          )}
        >
          <div className="flex items-center justify-between">
            <p className={cn('text-sm', saldoBajo ? 'text-amber-700' : 'text-emerald-700')}>
              Saldo disponible
            </p>
            {saldoBajo ? (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            ) : (
              <DollarSign className="h-4 w-4 text-emerald-600" />
            )}
          </div>
          <p className={cn('mt-2 text-2xl font-semibold', saldoBajo ? 'text-amber-700' : 'text-emerald-700')}>
            {formatoRD(caja.saldoActual)}
          </p>
          {caja.fondoFijo > 0 && (
            <div className="mt-2">
              <div className="h-1.5 w-full rounded-full bg-white/60">
                <div
                  className={cn('h-1.5 rounded-full', saldoBajo ? 'bg-amber-500' : 'bg-emerald-500')}
                  style={{ width: `${Math.max(100 - porcentajeUsado, 0)}%` }}
                />
              </div>
              <p className={cn('mt-1 text-xs', saldoBajo ? 'text-amber-600' : 'text-emerald-600')}>
                {porcentajeUsado.toFixed(0)}% utilizado
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Estado</p>
            {abierta ? (
              <Unlock className="h-4 w-4 text-emerald-600" />
            ) : (
              <Lock className="h-4 w-4 text-slate-400" />
            )}
          </div>
          <p className={cn('mt-2 text-lg font-semibold', abierta ? 'text-emerald-700' : 'text-slate-500')}>
            {abierta ? 'Abierta' : 'Cerrada'}
          </p>
          <div className="mt-3 flex gap-2">
            {!abierta && (
              <Button
                size="sm"
                onClick={() => ejecutar(abrirCajaAction, 'Caja abierta.')}
                disabled={isPending || caja.fondoFijo === 0}
              >
                Abrir caja
              </Button>
            )}
            {abierta && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => ejecutar(cerrarCajaAction, 'Caja cerrada.')}
                disabled={isPending}
              >
                Cerrar caja
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMostrarConfig((v) => !v)}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
      {exito && <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{exito}</p>}

      {/* Configuración */}
      {mostrarConfig && (
        <form
          action={handleConfig}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
        >
          <h2 className="text-sm font-semibold text-slate-900">Configurar caja chica</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fondoFijo">Fondo fijo autorizado (RD$)</Label>
              <Input id="fondoFijo" name="fondoFijo" type="number" step="0.01" defaultValue={caja.fondoFijo || ''} />
              {errores.fondoFijo && <p className="text-xs text-red-600">{errores.fondoFijo}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="responsable">Custodio / Responsable</Label>
              <Input id="responsable" name="responsable" defaultValue={caja.responsable ?? ''} />
            </div>
          </div>
          <Button type="submit" size="sm" disabled={isPending}>
            Guardar configuración
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Formulario de desembolso */}
        <div className="lg:col-span-1 space-y-4">
          {abierta && (
            <form
              action={handleDesembolso}
              className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"
            >
              <h2 className="text-sm font-semibold text-slate-900">Registrar desembolso</h2>

              <div className="space-y-1.5">
                <Label htmlFor="monto">Monto (RD$)</Label>
                <Input id="monto" name="monto" type="number" step="0.01" min="0" />
                {errores.monto && <p className="text-xs text-red-600">{errores.monto}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="concepto">Concepto</Label>
                <Input id="concepto" name="concepto" placeholder="Ej: Compra de gas para cocina" />
                {errores.concepto && <p className="text-xs text-red-600">{errores.concepto}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="beneficiario">Beneficiario (opcional)</Label>
                <Input id="beneficiario" name="beneficiario" placeholder="A quién se le pagó" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comprobante">No. recibo/voucher (opcional)</Label>
                <Input id="comprobante" name="comprobante" />
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Registrando...' : 'Registrar desembolso'}
              </Button>
            </form>
          )}

          {abierta && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              {!mostrarReposicion ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMostrarReposicion(true)}
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Reponer caja
                </Button>
              ) : (
                <form action={handleReposicion} className="space-y-3">
                  <h2 className="text-sm font-semibold text-slate-900">Reponer caja chica</h2>
                  <div className="space-y-1.5">
                    <Label htmlFor="montoRepo">Monto a reponer (RD$)</Label>
                    <Input
                      id="montoRepo"
                      name="monto"
                      type="number"
                      step="0.01"
                      defaultValue={(caja.fondoFijo - caja.saldoActual).toFixed(2)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="conceptoRepo">Concepto (opcional)</Label>
                    <Input id="conceptoRepo" name="concepto" defaultValue="Reposición de caja chica" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isPending}>
                      Reponer
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setMostrarReposicion(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {!abierta && (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
              Abre la caja para registrar desembolsos.
            </div>
          )}
        </div>

        {/* Historial de movimientos */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
              Historial de movimientos
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Fecha</th>
                  <th className="px-4 py-2 font-medium">Tipo</th>
                  <th className="px-4 py-2 font-medium">Concepto</th>
                  <th className="px-4 py-2 text-right font-medium">Monto</th>
                  <th className="px-4 py-2 text-right font-medium">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-2 text-slate-500">
                      {new Date(m.fecha).toLocaleDateString('es-DO')}
                    </td>
                    <td className="px-4 py-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ESTILO_TIPO[m.tipo])}>
                        {m.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {m.concepto}
                      {m.beneficiario && (
                        <span className="ml-1 text-xs text-slate-400">→ {m.beneficiario}</span>
                      )}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-2 text-right font-medium',
                        m.tipo === 'DESEMBOLSO' ? 'text-red-600' : 'text-emerald-600'
                      )}
                    >
                      {m.tipo === 'DESEMBOLSO' ? '-' : '+'}{formatoRD(m.monto)}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-900">{formatoRD(m.saldoResultante)}</td>
                  </tr>
                ))}
                {movimientos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No hay movimientos todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
