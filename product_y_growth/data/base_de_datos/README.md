# EcoBite — base de datos simulada (semana 2)

Dataset ficticio y esquema Postgres para Supabase. La app todavía no tiene usuarios reales. Estos archivos alimentan el dashboard y le dejan al backend la fórmula para programarla.

La moneda de `total` es ARS. En el CSV y en el SQL los importes van sin símbolo (`12800.00`) y las fechas del CSV van en `YYYY-MM-DD`.

## Fórmula de negocio

Para una entrega en bici, el ahorro es lo que habría emitido un auto a nafta en la misma distancia:

```text
co2_ahorrado_kg = distancia_km × 0.17
```

`0.17` es el factor del MVP, en kg de CO₂ por km. Es el punto de partida del brief de la semana 2 (un auto a nafta). La matriz de la semana 1 usaba 180 g/km (`0.18`); queda como referencia cercana, no como la fórmula vigente.

`distancia_km` no sale de un GPS. Es el promedio fijo de la zona del restaurante.

El valor se guarda en `pedidos.co2_total_ahorrado`. Si el pedido está `completed`, se copia en `metricas_impacto.co2_evitado_kg`.

`platillos.co2_ahorrado_unit` y `detalle_pedidos.co2_subtotal` (`co2_ahorrado_unit × cantidad`) están en el diagrama y se cargan como dato de catálogo. No entran en esta fórmula. Sumarlos junto con `co2_total_ahorrado` contaría el impacto dos veces.

`transporte_sin_emision` acepta `bike` o `ev`. En este dataset todos los pedidos son `bike`, así que la fórmula aplica a todos. `ev` queda permitido para más adelante y todavía no tiene factor propio.

## Zonas

| Zona | distancia_km | CO₂ si el pedido está completed |
| --- | ---: | ---: |
| Palermo | 2.50 | 0.43 |
| Belgrano | 4.00 | 0.68 |
| Caballito | 3.20 | 0.54 |
| San Telmo | 1.80 | 0.31 |
| Nunez | 5.50 | 0.94 |
| Almagro | 2.80 | 0.48 |

El redondeo es a 2 decimales, mitad hacia arriba (`0.425` → `0.43`).

## Regla de cancelación

`estado_simulado` solo puede ser `pending`, `completed` o `cancelled`.

El CO₂ del KPI cuenta únicamente cuando el estado es `completed`. En `pending` y `cancelled`, `co2_total_ahorrado` es `0` y no se inserta fila en `metricas_impacto`. El pedido se conserva.

En el seed hay 60 pedidos: 42 `completed`, 10 `pending` y 8 `cancelled`. Hay 42 filas de métricas, una por pedido completado.

## Qué más hay en los datos

- 15 usuarios: 1 `admin`, 8 `dueno`, 6 `cliente`. Cada dueño administra un restaurante. El admin y los clientes no administran ninguno.
- 8 restaurantes y 24 platillos (3 por restaurante). `Taller Cerrado` (`id_restaurante = 8`) está inactivo (`activo = false`) y igual conserva pedidos históricos.
- `Almagro Clasico` no usa envase biodegradable. Sus ítems tienen `tipo_envase = plastico`. El resto usa `biodegradable`.
- `password_hash` es un texto de relleno, no una contraseña real.

## CSV para el dashboard

[semana2-pedidos.csv](semana2-pedidos.csv) tiene las mismas 60 filas que `pedidos`.

| Columna del CSV | Columna en la base |
| --- | --- |
| `id_pedido` | `pedidos.id_pedido` |
| `fecha` | día calendario de `pedidos.fecha_pedido` |
| `id_restaurante` | `pedidos.id_restaurante` |
| `zona` | `pedidos.zona` |
| `distancia_km` | `pedidos.distancia_km` |
| `monto_total` | `pedidos.total` |
| `co2_ahorrado_kg` | `pedidos.co2_total_ahorrado` |
| `estado` | `pedidos.estado_simulado` |
| `tipo_transporte` | `pedidos.transporte_sin_emision` |

`estado` y `tipo_transporte` no estaban en la lista mínima del brief. Están para poder filtrar. El KPI de CO₂ se suma sobre `estado = completed`.

## Cómo cargarlo en Supabase

1. Crear un proyecto en [Supabase](https://supabase.com).
2. Abrir **SQL Editor**.
3. Pegar y ejecutar [001_schema.sql](001_schema.sql). Crea los tipos, las tablas, las claves y las restricciones. Volver a ejecutarlo borra las tablas y los datos.
4. Pegar y ejecutar [002_seed.sql](002_seed.sql).
5. En **Table Editor**, confirmar 60 filas en `pedidos` y 42 en `metricas_impacto`.

Las seis tablas tienen Row Level Security activado y ninguna política para los roles `anon` y `authenticated`. La publishable key del proyecto no puede leer `password_hash`. La conexión de Prisma usa el usuario de la base y sí puede leer y escribir.

## Qué necesita el backend (Prisma)

Prisma se conecta a Postgres con dos connection strings. No usa la API key de Supabase para eso.

Mandar por mensaje privado, nunca por el repositorio:

- `DATABASE_URL`: **Transaction pooler**, puerto `6543`. La usa la app en runtime. Si la URI no incluye `pgbouncer=true`, agregarlo al final.
- `DIRECT_URL`: conexión **directa** o **Session**, puerto `5432`. La usa `prisma migrate`.

En el proyecto: **Project Settings → Database → Connection string**. Copiar la URI y reemplazar `[YOUR-PASSWORD]` por la contraseña de la base.

Solo si además usan `@supabase/supabase-js`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Salen de **Project Settings → API**.

`service_role` no hace falta para Prisma. No va al repositorio ni al frontend: saltea las políticas de seguridad y lee todas las filas, incluido `password_hash`.

Los nombres de las variables, vacíos, están en [.env.example](.env.example). Quien complete los valores lo guarda fuera de git.
