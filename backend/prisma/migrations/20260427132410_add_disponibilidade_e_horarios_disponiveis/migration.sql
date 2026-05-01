/*
  Warnings:

  - You are about to drop the `disponibilidade_janela_servicos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `manicureId` to the `disponibilidade_janelas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "disponibilidade_janela_servicos" DROP CONSTRAINT "disponibilidade_janela_servicos_janelaId_fkey";

-- DropForeignKey
ALTER TABLE "disponibilidade_janela_servicos" DROP CONSTRAINT "disponibilidade_janela_servicos_servicoId_fkey";

-- AlterTable
ALTER TABLE "disponibilidade_janelas" ADD COLUMN     "manicureId" TEXT NOT NULL,
ALTER COLUMN "data" SET DATA TYPE DATE,
ALTER COLUMN "horaInicio" SET DATA TYPE TIME,
ALTER COLUMN "horaFim" SET DATA TYPE TIME;

-- DropTable
DROP TABLE "disponibilidade_janela_servicos";

-- CreateTable
CREATE TABLE "disponibilidade_servico_janelas" (
    "id" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disponibilidadeJanelaId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,

    CONSTRAINT "disponibilidade_servico_janelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_disponiveis" (
    "id" TEXT NOT NULL,
    "horaInicio" TIME NOT NULL,
    "horaFim" TIME NOT NULL,
    "pedidoId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "disponibilidadeJanelaId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,

    CONSTRAINT "horarios_disponiveis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "disponibilidade_servico_janelas_disponibilidadeJanelaId_idx" ON "disponibilidade_servico_janelas"("disponibilidadeJanelaId");

-- CreateIndex
CREATE INDEX "disponibilidade_servico_janelas_servicoId_idx" ON "disponibilidade_servico_janelas"("servicoId");

-- CreateIndex
CREATE UNIQUE INDEX "disponibilidade_servico_janelas_disponibilidadeJanelaId_ser_key" ON "disponibilidade_servico_janelas"("disponibilidadeJanelaId", "servicoId");

-- CreateIndex
CREATE INDEX "horarios_disponiveis_disponibilidadeJanelaId_idx" ON "horarios_disponiveis"("disponibilidadeJanelaId");

-- CreateIndex
CREATE INDEX "horarios_disponiveis_servicoId_idx" ON "horarios_disponiveis"("servicoId");

-- CreateIndex
CREATE INDEX "horarios_disponiveis_pedidoId_idx" ON "horarios_disponiveis"("pedidoId");

-- CreateIndex
CREATE INDEX "disponibilidade_janelas_manicureId_idx" ON "disponibilidade_janelas"("manicureId");

-- AddForeignKey
ALTER TABLE "disponibilidade_janelas" ADD CONSTRAINT "disponibilidade_janelas_manicureId_fkey" FOREIGN KEY ("manicureId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidade_servico_janelas" ADD CONSTRAINT "disponibilidade_servico_janelas_disponibilidadeJanelaId_fkey" FOREIGN KEY ("disponibilidadeJanelaId") REFERENCES "disponibilidade_janelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidade_servico_janelas" ADD CONSTRAINT "disponibilidade_servico_janelas_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_disponiveis" ADD CONSTRAINT "horarios_disponiveis_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_disponiveis" ADD CONSTRAINT "horarios_disponiveis_disponibilidadeJanelaId_fkey" FOREIGN KEY ("disponibilidadeJanelaId") REFERENCES "disponibilidade_janelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_disponiveis" ADD CONSTRAINT "horarios_disponiveis_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
