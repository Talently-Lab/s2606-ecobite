# Roadmap de implementación: Home y Perfil EcoBite

## Objetivo

Implementar primero el Home de descubrimiento y luego el Perfil del cliente, usando el PDF **EcoBite — Pantallas UX UI** como referencia visual y el alcance del MVP de 8 semanas como límite. En el diseño, “Perfil” se interpreta como **Mi impacto**: resumen del CO₂ ahorrado e historial personal de pedidos. No incluye el dashboard administrativo.

## Estado actual observado

- El repositorio contiene backend TypeScript/Express y Prisma. El frontend solo tiene `frontend/src/.gitkeep`: falta inicializar la aplicación React y su navegación.
- `GET /api/home` ya entrega locales, platos destacados, categorías y CO₂ individual cuando hay token.
- `POST /api/auth/register`, `POST /api/auth/login` y `GET /api/auth/me` están implementados.
- El esquema de datos incluye pedidos, detalle, métricas de impacto, zona, distancia y estado simulado. No se observa endpoint para resumen/historial del cliente.
- El diseño muestra Home con búsqueda por barrio, categorías, locales, explicación de 3 pasos y un bloque de impacto. La pantalla “Mi impacto” tiene total de CO₂, pedidos sostenibles, km en bici, envases, filtros por periodo, historial y explicación del cálculo.

## Secuencia recomendada

Estimación orientativa para un equipo pequeño; se puede ejecutar en 3 semanas de trabajo enfocadas, ajustando por disponibilidad. El Home desbloquea validación visual/datos temprano y Perfil depende del contrato del historial.

| Etapa | Duración | Entregables | Criterio de salida |
|---|---:|---|---|
| 0. Alinear alcance y contratos | 1–2 días | Acordar responsive, identidad visual, reglas de métricas y contrato del Perfil. Definir vacíos del diseño: búsqueda/filtros reales, contenido sin datos y datos de ejemplo vs reales. | Figma/PDF traducido a lista priorizada; contrato API aprobado por frontend/backend. |
| 1. Base frontend y sistema visual | 2–3 días | Inicializar React + Vite + Router + Tailwind según README; estructura de páginas, layout común, componentes de marca, tokens de color/tipografía, cabecera, estados de carga/error/vacío. | Home y Perfil navegables en desktop y móvil con contenido de prueba. |
| 2. Home: estructura y datos | 3–4 días | Hero, búsqueda de barrio/local/plato, categorías, tarjetas de locales con indicadores eco, pasos “Cómo funciona” y pie. Conectar `GET /api/home`; mapear campos disponibles y definir fallback para calificación, tiempos/fotos que hoy no aparecen en el contrato. | Datos reales del endpoint visibles, layout responsive, búsqueda/categorías con comportamiento acordado y estados completos. |
| 3. Perfil / Mi impacto: contrato y backend | 2–4 días | Agregar endpoint autenticado (p.ej. `GET /api/profile/impact?period=all|month`) para totales e historial. Agregar agregados de pedidos completados y métricas persistidas; verificar criterio de bici/envases según modelo y datos. | Respuesta documentada incluye CO₂, pedidos, distancia, envases e historial paginado/ordenado; solo devuelve información del usuario autenticado. |
| 4. Perfil / Mi impacto: interfaz | 3–4 días | Página protegida; total destacado, tarjetas KPI, selector de periodo, tabla/lista de pedidos, desglose y texto sobre estimación. Enlace desde Home/header; manejo de sesión expirada y perfil sin pedidos. | Una persona autenticada ve únicamente su impacto, cambia periodo y entiende el origen estimado de cada cifra. |
| 5. Integración y cierre funcional | 2–3 días | Conectar sesión/token y navegación, revisar formatos CLP/fechas/unidades, accesibilidad básica, responsividad y consistencia entre Home y Perfil. | Flujos Home → ingresar → Mi impacto operan con datos coherentes; revisión manual en tamaños móvil y escritorio completada. |

## Prioridad funcional

### Home (MVP)

1. Header con marca, acceso a impacto, ingresar/perfil y carrito (el carrito puede enlazar al flujo existente cuando esté disponible).
2. Hero con propuesta sustentable, búsqueda/entrada de barrio y bloque de CO₂ comunitario. No fijar valor inventado: usar API o indicar que falta el dato comunitario.
3. Categorías y lista de locales/platillos con envase y transporte eco. El endpoint actual provee destacados y locales; ratings, fotos, tiempos y disponibilidad por zona necesitan dato/decisión adicional.
4. Sección educativa de tres pasos.
5. Responsive y estados: carga, error de API, catálogo vacío y sin resultados.

### Perfil / Mi impacto (MVP)

1. Proteger la ruta y obtener el usuario con `/api/auth/me`.
2. Resumen total de CO₂ para pedidos que califican, con filtros “este mes” y “todo el tiempo”.
3. KPIs: pedidos sostenibles, km en bici y envases compostables. Definir con Datos cómo contar cada uno para evitar inferencias que la base no sustente.
4. Historial con fecha, local, zona, total y CO₂ por pedido; ordenar del más reciente y prever paginación.
5. Explicar que el CO₂ es estimado; enlazar método/fuentes aprobados. Los valores de muestra del diseño no se deben presentar como reales.

## Dependencias y decisiones por cerrar

- Frontend: framework y estructura previstos en README pero aún no presentes en la rama inspeccionada.
- Producto/Datos: confirmar fórmula de CO₂, qué significa “envases compostables” (cantidad por unidad/detalle), estimación de km y qué estados suman. El backend de Home actualmente suma métricas de pedidos `completed` del usuario; la pantalla de confirmación usa el término “confirmado”, así que unificar estados/nomenclatura.
- Backend: agregar DTO y endpoint para el historial/resumen del usuario; no calcular KPIs a partir de campos incompletos sin acordar regla.
- Diseño: definir si se mantiene el texto/datos del mockup en ARS y CABA o se adapta a moneda/zona objetivo del lanzamiento; validar breakpoints y accesibilidad.
- Catálogo: la búsqueda por barrio requiere que la API soporte zona/distancia o que se acuerde primero el alcance de búsqueda. Hoy el Home no filtra por zona.

## Fuera del roadmap

Pagos reales, tracking GPS, aplicación nativa, chat, edición extensa de cuenta, dashboard administrativo y optimización prematura. Mantener el checkout como simulación según el MVP.

## Riesgos y mitigación

- **Desfase diseño/API:** acordar DTO y campos faltantes en la etapa 0; usar placeholders explícitos para contenido todavía no disponible.
- **Métricas inconsistentes:** cerrar fórmulas con Datos antes de diseñar agregados y etiquetar el resultado como estimación.
- **Alcance del Home crece hacia catálogo completo:** priorizar navegación/descubrimiento en Home y dejar filtros avanzados para iteración posterior.
- **Perfil sin pedidos reales:** diseñar estado vacío con invitación a explorar locales, sin cifras ficticias.
