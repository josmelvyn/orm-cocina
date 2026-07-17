'use client'
// src/components/reportes/reporte-acciones.tsx

import { Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Convierte un array de objetos planos a CSV y dispara la descarga en el navegador */
function exportarCsv(filas: Record<string, unknown>[], nombreArchivo: string) {
  if (filas.length === 0) return

  const headers = Object.keys(filas[0])
  const csvLineas = [
    headers.join(','),
    ...filas.map((fila) =>
      headers
        .map((h) => {
          const valor = fila[h]
          const texto = valor === null || valor === undefined ? '' : String(valor)
          // Escapa comillas y envuelve en comillas si contiene coma
          return texto.includes(',') || texto.includes('"')
            ? `"${texto.replace(/"/g, '""')}"`
            : texto
        })
        .join(',')
    ),
  ]

  const blob = new Blob([csvLineas.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${nombreArchivo}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function ReporteAcciones({
  datosExportables,
  nombreArchivo,
}: {
  datosExportables: Record<string, unknown>[]
  nombreArchivo: string
}) {
  return (
    <div className="flex gap-2 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportarCsv(datosExportables, nombreArchivo)}
        disabled={datosExportables.length === 0}
      >
        <Download className="mr-1.5 h-3.5 w-3.5" />
        Exportar CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="mr-1.5 h-3.5 w-3.5" />
        Imprimir
      </Button>
    </div>
  )
}