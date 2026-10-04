# EcoBite

MVP de delivery sustentable. Conecta a las personas con restaurantes que usan envases biodegradables y entregan en bici. El diferencial del producto es mostrar el CO₂ ahorrado frente a un envío en auto a nafta.

El alcance de estas 8 semanas es una web responsive para validar el flujo, no la aplicación final. Quedan afuera la app mobile nativa, los pagos reales, el tracking por GPS y el rescate de comida.

## Arquitectura

Tres piezas, todavía en ramas separadas:

- **Web.** React, Vite, React Router y Tailwind. El estado global previsto es Context API. Vive en `frontend/` y habla con la API desde `frontend/src/services/`.
- **API.** Node.js y Express, con carpetas de rutas, controladores y servicios. Vive en `backend/`. La base se consulta con Prisma.
- **Datos.** Postgres en Supabase. El modelo sale del diagrama del equipo y suma los campos que hacen falta para el impacto (zona, distancia, estado del pedido, tipo de envase y si el restaurante está activo).

El pedido simulado recorre catálogo, carrito y checkout sin pasarela de pago. La distancia no se mide en vivo: es el promedio de la zona del restaurante. El CO₂ del KPI se guarda cuando el pedido queda completado y la entrega es en bici. Si el pedido está pendiente o cancelado, la fila se conserva y el CO₂ de ese pedido no suma.

Los diagramas de arquitectura se van a sumar en este archivo más adelante. Hoy el modelo de datos está en `docs/proyecto_ecobite`.

## Estructura del repositorio

```text
backend/                 API Express
frontend/                Web React
docs/proyecto_ecobite/   Brief del MVP y diagrama de datos
docs/api/                Contratos de la API
docs/pm/                 Gestión del proyecto
docs/qa/                 Pruebas
product_y_growth/data/   KPIs, matriz de datos y dataset simulado
product_y_growth/design/
product_y_growth/marketing/
```

En `main` varias de esas carpetas son solo el esqueleto. El código de cada frente está en su rama.

## Ramas

| Rama | Qué tiene |
| --- | --- |
| `main` | Documentación del proyecto y este README |
| `feature/semana1-frontend-setup` | App React lista para desarrollar |
| `feature/semana1-backend-setup` | Servidor Express y carpetas de la API |
| `feature/semana2-data-csv` | Esquema SQL, datos ficticios y CSV |

## Datos

La matriz de KPIs de la semana 1 está en `product_y_growth/data/week1-kpis-and-data-matrix.md`.

El esquema, el seed y el CSV de pedidos están en la rama `feature/semana2-data-csv`, carpeta `product_y_growth/data/base_de_datos`. Esos SQL se ejecutan en el editor de Supabase. El detalle de tablas, estados y carga está en el README de esa carpeta.

## Desarrollo local

Cada frente se corre desde su rama, no desde `main`.

Web (`feature/semana1-frontend-setup`):

```powershell
cd frontend
npm install
npm run dev
```

API (`feature/semana1-backend-setup`):

```powershell
cd backend
npm install
node src/index.js
```

La API usa el puerto de la variable `PORT` o, si no está definida, el `3000`.

## Conexión a la base

Prisma necesita dos connection strings. Se comparten por mensaje privado y no se suben al repositorio.

- `DATABASE_URL`: pooler de Supabase, puerto `6543`, con `?pgbouncer=true`. La usa la API en runtime.
- `DIRECT_URL`: conexión directa, puerto `5432`. La usan las migraciones.

Prisma no usa la API key de Supabase. La clave `service_role` no va al repositorio ni al frontend.

## Documentación relacionada

- `docs/proyecto_ecobite/ecobite_mvp_blueprint.md`: problema, alcance y flujo del MVP.
- `docs/proyecto_ecobite/modelo_datos_ecobite.md`: entidades y relaciones.
- `product_y_growth/data/week1-kpis-and-data-matrix.md`: qué se mide y qué campos pide el análisis.
