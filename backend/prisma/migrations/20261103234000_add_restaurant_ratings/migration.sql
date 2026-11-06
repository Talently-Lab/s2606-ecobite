-- CreateTable
CREATE TABLE "valoraciones" (
    "id_valoracion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_restaurante" INTEGER NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "fecha_valoracion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "valoraciones_pkey" PRIMARY KEY ("id_valoracion")
);

-- CreateIndex
CREATE UNIQUE INDEX "valoraciones_id_usuario_id_restaurante_key"
ON "valoraciones"("id_usuario", "id_restaurante");

-- CreateIndex
CREATE INDEX "valoraciones_id_restaurante_idx"
ON "valoraciones"("id_restaurante");

-- AddForeignKey
ALTER TABLE "valoraciones"
ADD CONSTRAINT "valoraciones_id_restaurante_fkey"
FOREIGN KEY ("id_restaurante")
REFERENCES "restaurantes"("id_restaurante")
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "valoraciones"
ADD CONSTRAINT "valoraciones_id_usuario_fkey"
FOREIGN KEY ("id_usuario")
REFERENCES "usuarios"("id_usuario")
ON DELETE NO ACTION ON UPDATE NO ACTION;
