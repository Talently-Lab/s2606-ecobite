# EcoBite

MVP de delivery sustentable. Conecta a las personas con restaurantes que usan envases biodegradables y entregan en bici. El diferencial del producto es mostrar el CO₂ ahorrado frente a un envío en auto a nafta.

El alcance de estas 8 semanas es una web responsive para validar el flujo, no la aplicación final. Quedan afuera la app mobile nativa, los pagos reales, el tracking por GPS y el rescate de comida.

## Arquitectura

Tres piezas, todavía en ramas separadas:

- **Web.** React, Vite, React Router y Tailwind. El estado global previsto es Context API. Vive en `frontend/` y habla con la API desde `frontend/src/services/`.
- **API.** Node.js y Express, con carpetas de rutas, controladores y servicios. Vive en `backend/`. La base se consulta con Prisma. El despliegue en Lambda y API Gateway está en [`docs/api/backend-lambda-deploy.md`](docs/api/backend-lambda-deploy.md).
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

- [`docs/api/backend-lambda-deploy.md`](docs/api/backend-lambda-deploy.md): despliegue de la API en Lambda y API Gateway.
- `docs/proyecto_ecobite/ecobite_mvp_blueprint.md`: problema, alcance y flujo del MVP.
- `docs/proyecto_ecobite/modelo_datos_ecobite.md`: entidades y relaciones.
- `product_y_growth/data/week1-kpis-and-data-matrix.md`: qué se mide y qué campos pide el análisis.

## Autenticación del backend

La API expone `POST /api/auth/register` (201), `POST /api/auth/login` (200) y `GET /api/auth/me` (200). Registro/login devuelven `{ message, token, user }`; `user` contiene solo campos públicos. Los errores usan `{ error: { code, message, fields } }`. `/me` requiere `Authorization: Bearer <token>` y consulta los datos actuales del usuario.

Configura en el entorno del backend:

- `JWT_SECRET`: secreto aleatorio de al menos 32 bytes. No lo guardes en el repositorio ni lo registres.
- `JWT_EXPIRES_IN`: duración aceptada por `jsonwebtoken` (por ejemplo, `15m` o `1h`); es obligatoria.
- `CORS_ORIGIN`: origen web exacto permitido, incluyendo esquema y puerto cuando corresponda (por ejemplo, `http://localhost:5173`). No uses `*`.

Registro y login comparten un límite de 10 solicitudes por IP cada 15 minutos. El almacén predeterminado es local al proceso; en despliegues con varias instancias debe configurarse un almacén compartido y validarse la IP cliente con la topología de proxy real antes de ajustar `trust proxy`.
