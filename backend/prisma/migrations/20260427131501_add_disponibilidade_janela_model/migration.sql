-- CreateTable
CREATE TABLE "disponibilidade_janelas" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "horaFim" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disponibilidade_janelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidade_janela_servicos" (
    "id" TEXT NOT NULL,
    "janelaId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disponibilidade_janela_servicos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "disponibilidade_janelas_data_idx" ON "disponibilidade_janelas"("data");

-- CreateIndex
CREATE INDEX "disponibilidade_janelas_ativo_idx" ON "disponibilidade_janelas"("ativo");

-- CreateIndex
CREATE INDEX "disponibilidade_janela_servicos_janelaId_idx" ON "disponibilidade_janela_servicos"("janelaId");

-- CreateIndex
CREATE INDEX "disponibilidade_janela_servicos_servicoId_idx" ON "disponibilidade_janela_servicos"("servicoId");

-- CreateIndex
CREATE UNIQUE INDEX "disponibilidade_janela_servicos_janelaId_servicoId_key" ON "disponibilidade_janela_servicos"("janelaId", "servicoId");

-- AddForeignKey
ALTER TABLE "disponibilidade_janela_servicos" ADD CONSTRAINT "disponibilidade_janela_servicos_janelaId_fkey" FOREIGN KEY ("janelaId") REFERENCES "disponibilidade_janelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidade_janela_servicos" ADD CONSTRAINT "disponibilidade_janela_servicos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
