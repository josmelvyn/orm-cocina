-- AlterTable
ALTER TABLE "conduces" ADD COLUMN     "fechaRecepcion" TIMESTAMP(3),
ADD COLUMN     "horaRecepcion" TEXT,
ADD COLUMN     "nombreRecibe" TEXT,
ADD COLUMN     "postre" TEXT;

-- AlterTable
ALTER TABLE "escuelas" ADD COLUMN     "director" TEXT,
ADD COLUMN     "provincia" TEXT,
ADD COLUMN     "regionalDistrito" TEXT,
ADD COLUMN     "ruta" TEXT;

-- CreateTable
CREATE TABLE "empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "rnc" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);
