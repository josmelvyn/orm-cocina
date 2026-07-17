'use client'
// src/components/shared/descargar-pdf-button.tsx

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DescargarPdfButton({ href }: { href: string }) {
  return (
    <a href={href} download>
      <Button variant="outline">
        <Download className="mr-1.5 h-4 w-4" />
        Descargar PDF
      </Button>
    </a>
  )
}