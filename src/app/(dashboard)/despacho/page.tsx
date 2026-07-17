// src/app/(dashboard)/despacho/page.tsx
import { listarRecetasParaDespacho } from '@/services/recetas.service'
import { PreDespachoForm } from '@/components/despacho/pre-despacho-form'

export default async function DespachoPage() {
  const recetasRaw = await listarRecetasParaDespacho()

  // Aplanamos los Decimal de Prisma a number antes de mandarlo al client component
  const recetas = recetasRaw.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    tipoServicio: r.tipoServicio,
    porcionesBase: r.porcionesBase,
    ingredientes: r.ingredientes.map((ing) => ({
      insumoId: ing.insumoId,
      insumoNombre: ing.insumo.nombre,
      unidadMedida: ing.insumo.unidadMedida,
      cantidadPorPorcionBase: Number(ing.cantidad),
      stockActual: Number(ing.insumo.stockActual),
    })),
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Pre-despacho</h1>
        <p className="text-sm text-slate-500">
          Calcula cuánto insumo se necesita sacar de almacén antes de generar el conduce
        </p>
      </div>

      <PreDespachoForm recetas={recetas} />
    </div>
  )
}