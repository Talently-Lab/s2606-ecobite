# EcoBite — Semana 1: KPIs y matriz de datos requeridos

**Rol:** Data Analyst  
**Audiencia:** Backend, Project Manager, Frontend (campos del checkout)  
**Estado:** Borrador para alinear al equipo — se requiere confirmación de Backend sobre los campos **Must**  
**Última actualización:** 2026-09-17

---

## 1. Propósito

Este documento define:

1. **Qué medimos** — KPIs de negocio y KPIs de impacto ambiental para el MVP.
2. **Qué debe guardar el sistema** — entidades y campos que Backend necesita persistir desde el día 1 para que los dashboards de semanas posteriores sean posibles.

> **Crítico:** Si en cada pedido no se guardan `distancia_km`, `tipo_transporte` y `tipo_envase`, no podremos calcular el CO₂ ahorrado ni los plásticos evitados en las semanas 6–8.

---

## 2. KPIs de negocio

| KPI | Definición | Fórmula | Unidad | Frecuencia | Fuente de datos |
|-----|------------|---------|--------|------------|-----------------|
| Pedidos totales | Cantidad de pedidos creados en el período | `COUNT(orders)` | pedidos | Diaria / semanal / acumulada | `orders` |
| Pedidos completados | Pedidos que finalizaron el checkout simulado con éxito | `COUNT(orders WHERE status = 'completed')` | pedidos | Diaria / semanal | `orders.status` |
| Ticket promedio (AOV) | Monto promedio de los pedidos completados | `SUM(monto_total) / COUNT(completed orders)` | moneda (ARS o USD — definir con PM) | Semanal / acumulada | `orders.monto_total` |
| Restaurantes activos | Restaurantes con al menos un pedido en el período | `COUNT(DISTINCT restaurant_id) WHERE has order in period` | restaurantes | Semanal | `orders` + `restaurants` |
| Usuarios registrados | Usuarios que completaron el registro | `COUNT(users)` | usuarios | Acumulada | `users` |
| Tasa de conversión (MVP) | Proporción de usuarios registrados que hacen ≥1 pedido | `users_with_≥1_order / registered_users` | % | Semanal | `users` + `orders` |
| Pedidos por usuario | Profundidad de uso | `completed_orders / users_with_≥1_order` | pedidos/usuario | Semanal | `orders` |

### Notas de KPIs de negocio para PM

- La moneda de `monto_total` debe definirse una sola vez (recomendación: documentar el código ISO en el README o en variables de entorno).
- “Restaurantes activos” usa una ventana móvil (ej. últimos 7 días); confirmar la ventana con PM.
- Cancelaciones / checkout fallido pueden quedar fuera del reporte del MVP si `status` solo tiene `pending` / `completed`.

---

## 3. KPIs de impacto (core de EcoBite)

| KPI | Definición | Fórmula | Unidad | Frecuencia | Fuente de datos |
|-----|------------|---------|--------|------------|-----------------|
| CO₂ ahorrado | Emisiones evitadas vs. un baseline de delivery en vehículo a combustión | Ver §4 | kg CO₂ | Por pedido + acumulado | `orders.distancia_km`, `orders.tipo_transporte` |
| Plásticos de un solo uso evitados | Unidades de plástico no usadas porque el envase es biodegradable | `SUM(items WHERE tipo_envase = 'biodegradable')` (o pesos mapeados — ver §4) | unidades (o g de plástico) | Por pedido + acumulado | `order_items.tipo_envase` |
| % de entregas eco | Proporción de pedidos completados enviados en bici o EV | `COUNT(orders WHERE tipo_transporte IN ('bike','ev') AND status='completed') / completed_orders` | % | Semanal | `orders.tipo_transporte` |

### Nota de alcance (coherencia del brief)

El brief de Semana 1 se centra en **envases biodegradables** y **delivery sin emisiones** (bici / EV). En Semana 8 aparece “kg de comida rescatada”; esa métrica **queda fuera de Semana 1** salvo que Product confirme que el rescate de alimentos está en el MVP. Si se agrega después, necesita campos propios (ej. `kg_comida_rescatada` por publicación).

---

## 4. Supuestos de cálculo (para el equipo)

Son **hipótesis del MVP**. Se pueden refinar después; deben quedar fijas y versionadas para que Backend/Frontend y los dashboards sean consistentes.

### 4.1 CO₂ ahorrado (por pedido)

```
CO2_ahorrado_kg = distancia_km × (factor_combustion_g_per_km − factor_ecobite_g_per_km) / 1000
```

| Parámetro | Valor MVP por defecto | Notas |
|-----------|----------------------|--------|
| `factor_combustion_g_per_km` | `180` | Baseline aproximado de auto (g CO₂/km). Reemplazar con fuente citada cuando exista. |
| `factor_ecobite_g_per_km` para `bike` | `0` | Entrega a pedaleo. |
| `factor_ecobite_g_per_km` para `ev` | `50` | Placeholder para vehículo eléctrico; refinar después. |
| `distancia_km` | Obligatorio en el pedido | Estimada en el checkout está bien (sin GPS en vivo en el alcance). |

**Recomendación:** Backend puede (a) guardar solo los inputs crudos y calcular el CO₂ en analytics, o (b) además persistir `co2_ahorrado_kg` al crear el pedido con los mismos factores. Preferir **siempre los inputs crudos**; el CO₂ guardado es caché opcional.

### 4.2 Plásticos evitados (por pedido)

Regla simple del MVP:

```
plasticos_evitados_unidades = COUNT(order_items WHERE tipo_envase = 'biodegradable')
```

Mejora opcional después: mapear cada `tipo_envase` a gramos de plástico evitado (tabla de lookup). No es obligatorio en Semana 1.

---

## 5. Referencia de industria (Kaggle / Food Delivery)

Un analista suele no inventar el esquema desde cero. Buscar **“Food Delivery Dataset”** en [Kaggle](https://www.kaggle.com) muestra columnas habituales en datos tipo industria:

| Campos comunes en la industria | ¿Relevante para el MVP EcoBite? | Nuestro campo |
|--------------------------------|----------------------------------|---------------|
| Order ID | Sí | `order_id` |
| Customer / User ID | Sí | `user_id` |
| Restaurant ID | Sí | `restaurant_id` |
| Order timestamp | Sí | `created_at` |
| Order status | Sí | `status` |
| Order amount / total | Sí | `monto_total` |
| Delivery time | Deseable | `tiempo_entrega_min` (Should) |
| Delivery fee | Deseable | `costo_envio` (Could) |
| Distance | **Sí — obligatorio para CO₂** | `distancia_km` (Must) |
| Lat / long | Fuera del alcance del MVP (sin geo avanzada) | Sin tracking en vivo; alcanza estimar la distancia |
| Rating | Después | Could |

Usar esto solo como inspiración; los campos diferenciales de EcoBite son `tipo_transporte` y `tipo_envase`.

---

## 6. Matriz de datos requeridos (para Backend)

Prioridad:

- **Must** — sin esto fallan los KPIs / métricas de impacto de Semana 1  
- **Should** — alto valor para los dashboards del MVP  
- **Could** — postergable si hay poco tiempo  

### 6.1 Entidad: `users`

| Campo | Tipo | Prioridad | Ejemplo | Usado por KPI | Notas |
|-------|------|-----------|---------|---------------|--------|
| `user_id` | UUID / string | Must | `usr_01H…` | Usuarios registrados, conversión | PK |
| `email` | string | Must | `ana@mail.com` | Auth / ops | Único |
| `created_at` | datetime (ISO) | Must | `2026-09-17T18:00:00Z` | Crecimiento en el tiempo | Timestamp de registro |
| `ciudad` o `zona` | string | Could | `CABA` | Segmentación | Opcional |

### 6.2 Entidad: `restaurants`

| Campo | Tipo | Prioridad | Ejemplo | Usado por KPI | Notas |
|-------|------|-----------|---------|---------------|--------|
| `restaurant_id` | UUID / string | Must | `rest_42` | Restaurantes activos | PK |
| `nombre` | string | Must | `Verde Bowl` | Catálogo / admin | |
| `activo` | boolean | Must | `true` | Filtros de catálogo | Soft-disable |
| `es_eco_certificado` | boolean | Should | `true` | Badge de sustentabilidad | Señal de UX |
| `created_at` | datetime | Should | ISO | Ops | |

### 6.3 Entidad: `orders`

| Campo | Tipo | Prioridad | Ejemplo | Usado por KPI | Notas |
|-------|------|-----------|---------|---------------|--------|
| `order_id` | UUID / string | Must | `ord_1001` | Todos los KPIs de pedidos | PK |
| `user_id` | FK | Must | `usr_01H…` | Conversión, pedidos/usuario | |
| `restaurant_id` | FK | Must | `rest_42` | Restaurantes activos | |
| `created_at` | datetime | Must | ISO | Series de tiempo | |
| `status` | enum | Must | `completed` | Pedidos completados | Sugerido: `pending`, `completed`, `cancelled` |
| `monto_total` | decimal | Must | `12500.00` | AOV | Misma moneda en todas las filas |
| `distancia_km` | decimal | **Must** | `3.5` | **CO₂ ahorrado** | Estimada en checkout OK |
| `tipo_transporte` | enum | **Must** | `bike` | **CO₂ ahorrado**, % eco | Sugerido: `bike`, `ev` |
| `co2_ahorrado_kg` | decimal | Should | `0.63` | Dashboard de impacto | Opcional si se calcula con la fórmula |
| `tiempo_entrega_min` | integer | Should | `35` | Ops / UX | Inspirado en industria |
| `costo_envio` | decimal | Could | `500` | Unit economics | |

### 6.4 Entidad: `order_items`

| Campo | Tipo | Prioridad | Ejemplo | Usado por KPI | Notas |
|-------|------|-----------|---------|---------------|--------|
| `order_item_id` | UUID / string | Must | `oi_55` | Detalle de línea | PK |
| `order_id` | FK | Must | `ord_1001` | Join al pedido | |
| `product_id` o `nombre_producto` | string | Should | `Bowl quinoa` | Analytics de catálogo | |
| `cantidad` | integer | Must | `2` | Cantidades | |
| `precio_unitario` | decimal | Should | `4500` | Conciliar AOV | |
| `tipo_envase` | enum | **Must** | `biodegradable` | **Plásticos evitados** | Sugerido: `biodegradable`, `plastico` |

### 6.5 Entidad: `products` (opcional en el esquema de Semana 1; útil pronto)

| Campo | Tipo | Prioridad | Ejemplo | Usado por KPI | Notas |
|-------|------|-----------|---------|---------------|--------|
| `product_id` | UUID / string | Should | `prod_9` | Catálogo | |
| `restaurant_id` | FK | Should | `rest_42` | | |
| `nombre` | string | Should | `Bowl quinoa` | | |
| `precio` | decimal | Should | `4500` | Componentes del AOV | |
| `tipo_envase_default` | enum | Should | `biodegradable` | Default hacia `order_items` | |

---

## 7. Checklist evento → campo (para Frontend + Backend)

Cuando el usuario completa el **checkout simulado**, la API debería persistir al menos:

1. Quién pidió (`user_id`)
2. Qué restaurante (`restaurant_id`)
3. `monto_total`
4. `distancia_km` (input o estimación por defecto, ej. por zona)
5. `tipo_transporte` (`bike` o `ev`)
6. Ítems de línea con `tipo_envase` (default del producto / política eco del restaurante)

Sin los pasos 4–6, los KPIs de impacto no se pueden armar después.

---

## 8. Pedido de confirmación a Backend / PM

Responder (comentario en el PR o en Notion) con:

- [ ] Acuerdo sobre los campos **Must** de la §6  
- [ ] Confirmar moneda de `monto_total`  
- [ ] Confirmar enums de `tipo_transporte` y `tipo_envase`  
- [ ] Confirmar si el CO₂ se calcula al escribir el pedido o solo en analytics  
- [ ] Confirmar si “comida rescatada (kg)” entra al MVP o queda fuera  

---

## 9. Checklist del entregable de Semana 1

- [x] KPIs de negocio definidos (definición + fórmula + unidad)
- [x] KPIs de impacto definidos (CO₂ + plásticos)
- [x] Supuestos de cálculo documentados
- [x] Referencia de campos de industria anotada
- [x] Matriz de datos entregada al equipo de desarrollo
- [ ] Confirmación escrita de Backend sobre campos Must
- [ ] Archivo linkeado en el tablero del equipo (Trello / Notion)

---

## 10. Próximos pasos (después de Semana 1)

1. Backend implementa los campos Must en el modelo de datos / migraciones.
2. Frontend captura `distancia_km`, `tipo_transporte` y `tipo_envase` en el checkout (defaults permitidos).
3. Data Analyst prepara CSVs de seed / muestra en `product_y_growth/data/` para prototipar dashboards.
4. Semanas posteriores: dashboard en Looker Studio / Power BI con estas mismas definiciones.
