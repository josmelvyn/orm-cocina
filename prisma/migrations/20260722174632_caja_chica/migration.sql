-- CreateEnum
CREATE TYPE "EstadoCaja" AS ENUM ('ABIERTA', 'CERRADA');

-- CreateEnum
CREATE TYPE "TipoMovimientoCaja" AS ENUM ('APERTURA', 'DESEMBOLSO', 'REPOSICION', 'CIERRE');

-- CreateTable
CREATE TABLE "caja_chica" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL DEFAULT 'Caja Chica Principal',
    "fondoFijo" DECIMAL(14,2) NOT NULL,
    "saldoActual" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "estado" "EstadoCaja" NOT NULL DEFAULT 'CERRADA',
    "responsable" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caja_chica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_caja_chica" (
    "id" TEXT NOT NULL,
    "cajaChicaId" TEXT NOT NULL,
    "tipo" "TipoMovimientoCaja" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(14,2) NOT NULL,
    "concepto" TEXT NOT NULL,
    "beneficiario" TEXT,
    "comprobante" TEXT,
    "saldoResultante" DECIMAL(14,2) NOT NULL,
    "creadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_caja_chica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "movimientos_caja_chica_cajaChicaId_idx" ON "movimientos_caja_chica"("cajaChicaId");

-- CreateIndex
CREATE INDEX "movimientos_caja_chica_fecha_idx" ON "movimientos_caja_chica"("fecha");

-- AddForeignKey
ALTER TABLE "movimientos_caja_chica" ADD CONSTRAINT "movimientos_caja_chica_cajaChicaId_fkey" FOREIGN KEY ("cajaChicaId") REFERENCES "caja_chica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_caja_chica" ADD CONSTRAINT "movimientos_caja_chica_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
