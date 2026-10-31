-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('cliente', 'dueno', 'admin');

-- CreateTable
CREATE TABLE "detalle_pedidos" (
    "id_detalle" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_platillo" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "co2_subtotal" DECIMAL(8,2) NOT NULL,
    "tipo_envase" VARCHAR(20) NOT NULL,

    CONSTRAINT "detalle_pedidos_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "metricas_impacto" (
    "id_metrica" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "co2_evitado_kg" DECIMAL(8,2) NOT NULL,
    "fecha_calculo" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "metricas_impacto_pkey" PRIMARY KEY ("id_metrica")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id_pedido" SERIAL NOT NULL,
    "id_usuario_cliente" INTEGER NOT NULL,
    "id_restaurante" INTEGER NOT NULL,
    "fecha_pedido" TIMESTAMPTZ(6) NOT NULL,
    "estado_simulado" VARCHAR(30) NOT NULL,
    "transporte_sin_emision" VARCHAR(50) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "co2_total_ahorrado" DECIMAL(8,2) NOT NULL,
    "zona" VARCHAR(50) NOT NULL,
    "distancia_km" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "platillos" (
    "id_platillo" SERIAL NOT NULL,
    "id_restaurante" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "co2_ahorrado_unit" DECIMAL(8,2) NOT NULL,
    "disponible" BOOLEAN NOT NULL,

    CONSTRAINT "platillos_pkey" PRIMARY KEY ("id_platillo")
);

-- CreateTable
CREATE TABLE "restaurantes" (
    "id_restaurante" SERIAL NOT NULL,
    "id_usuario_owner" INTEGER NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "direccion" TEXT NOT NULL,
    "envase_biodegradable" BOOLEAN NOT NULL,
    "indicador_eco" VARCHAR(50) NOT NULL,
    "activo" BOOLEAN NOT NULL,

    CONSTRAINT "restaurantes_pkey" PRIMARY KEY ("id_restaurante")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol" "rol_usuario" NOT NULL,
    "fecha_registro" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateIndex
CREATE INDEX "idx_detalle_pedido" ON "detalle_pedidos"("id_pedido");

-- CreateIndex
CREATE INDEX "idx_detalle_platillo" ON "detalle_pedidos"("id_platillo");

-- CreateIndex
CREATE UNIQUE INDEX "metricas_impacto_id_pedido_key" ON "metricas_impacto"("id_pedido");

-- CreateIndex
CREATE INDEX "idx_metricas_usuario" ON "metricas_impacto"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_pedidos_restaurante" ON "pedidos"("id_restaurante");

-- CreateIndex
CREATE INDEX "idx_pedidos_usuario" ON "pedidos"("id_usuario_cliente");

-- CreateIndex
CREATE INDEX "idx_platillos_restaurante" ON "platillos"("id_restaurante");

-- CreateIndex
CREATE UNIQUE INDEX "restaurantes_id_usuario_owner_key" ON "restaurantes"("id_usuario_owner");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "detalle_pedidos" ADD CONSTRAINT "detalle_pedidos_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_pedidos" ADD CONSTRAINT "detalle_pedidos_id_platillo_fkey" FOREIGN KEY ("id_platillo") REFERENCES "platillos"("id_platillo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "metricas_impacto" ADD CONSTRAINT "metricas_impacto_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "metricas_impacto" ADD CONSTRAINT "metricas_impacto_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_restaurante_fkey" FOREIGN KEY ("id_restaurante") REFERENCES "restaurantes"("id_restaurante") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_usuario_cliente_fkey" FOREIGN KEY ("id_usuario_cliente") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "platillos" ADD CONSTRAINT "platillos_id_restaurante_fkey" FOREIGN KEY ("id_restaurante") REFERENCES "restaurantes"("id_restaurante") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "restaurantes" ADD CONSTRAINT "restaurantes_id_usuario_owner_fkey" FOREIGN KEY ("id_usuario_owner") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;
