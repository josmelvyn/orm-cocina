'use client'
// src/components/conduces/imprimir-button.tsx

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ImprimirButton() {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Printer className="mr-1.5 h-4 w-4" />
      Imprimir
    </Button>
  )
}