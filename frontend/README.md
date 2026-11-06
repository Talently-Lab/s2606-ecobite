# EcoBite Frontend

Frontend del MVP de EcoBite, una plataforma FoodTech orientada a delivery sostenible.

## Stack

- React 19 + TypeScript
- Vite
- React Router
- Context API
- Tailwind CSS 4
- lucide-react (íconos)
- Vitest + Testing Library
- ESLint + Prettier

## Desarrollo local

```bash
npm install
cp .env.example .env   # opcional, ver "Variables de entorno"
npm run dev
```

| Script                 | Qué hace                               |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Servidor de desarrollo                 |
| `npm run build`        | Chequeo de tipos + build de producción |
| `npm run typecheck`    | Solo chequeo de tipos                  |
| `npm run lint`         | ESLint                                 |
| `npm run format`       | Formatea todo con Prettier             |
| `npm run format:check` | Verifica el formato sin modificar      |
| `npm test`             | Tests en modo watch                    |
| `npm run test:run`     | Tests una sola vez (para CI)           |

Antes de subir una feature (ver `docs/pm/flujo-de-trabajo-git.md`): `npm run format:check && npm run lint && npm run test:run && npm run build`.

## Variables de entorno

`VITE_API_URL`: URL base de la API (ej. `http://localhost:3000/api`).

Si queda vacía, se usa `http://localhost:3000/api`. El frontend requiere la API; no hay un modo mock.

`VITE_IMAGES_BASE_URL`: base pública de CloudFront para completar las fotos del catálogo cuando la API devuelve `imageUrl: null`. El valor está en `.env.example`; se usan las rutas `restaurants/{id}.jpg` y `dishes/{id}.jpg`. Las URLs de la API tienen prioridad. Si no se configura esta variable o una imagen falla, se conserva el estado sin fotografía. Reiniciá Vite después de cambiar `.env`.

## Estructura

Organizada por funcionalidad (feature). Cada feature tiene todo lo suyo y expone una API pública en su `index.ts`.

```text
src/
  app/                  App, router y providers globales
  features/
    auth/               Login, registro y sesión
      components/       Componentes propios de la feature
      context/          AuthProvider
      hooks/            useAuth
      pages/            LoginPage, RegisterPage (+ tests)
      routes/           GuestRoute, ProtectedRoute
      services/         authService (API real)
      messages.ts       Textos y mensajes de error
      types.ts          Tipos y contrato de la API de auth
      validation.ts     Validaciones (+ tests)
      index.ts          API pública de la feature
    home/               Portada, mapa y estimación de rutas
    catalog/            Restaurantes, menús y carrito
    panel/              Checkout, confirmaciones, impacto y administración
    information/        Metodología, contacto y adhesión de locales
  shared/
    assets/             Logos
    components/ui/      Button, TextField, PasswordField, Alert…
    components/         Logo y otros componentes compartidos
    config/routes.ts    Constantes de rutas
    hooks/useForm.ts    Estado, validación y envío de formularios
    lib/http.ts         Cliente HTTP, token y ApiError
    lib/storage.ts      Acceso seguro a localStorage
    styles/index.css    Tokens de la paleta y estilos base
  test/                 Setup y helpers de tests
```

## Convenciones

- **Imports:** usar el alias `@/` para salir de la carpeta actual (`@/shared/...`). Dentro de una feature se usan imports relativos. ESLint bloquea `../../`.
- **Entre features:** importar solo desde el `index.ts` de la feature (`import { useAuth } from '@/features/auth'`), nunca archivos internos.
- **Nueva pantalla:** crear `features/<feature>/pages/<Nombre>Page.tsx`, exportarla en el `index.ts` de la feature, sumar la ruta en `shared/config/routes.ts` y en `app/router.tsx`. Si requiere sesión, va dentro de `<ProtectedRoute />` (con `roles={['admin']}` para el panel).
- **Componentes:** exports con nombre (no `export default`), un componente por archivo, props tipadas con `interface`.
- **Estilos:** clases de Tailwind con los tokens de la paleta (`bg-bosque`, `text-musgo`, `font-display`…), definidos en `shared/styles/index.css`. No usar colores sueltos.
- **Textos:** los mensajes de error y textos repetidos van en el `messages.ts` de la feature.
- **Formularios:** usar `useForm` con una función `validate` pura y testeada.
- **Tests:** junto al archivo que prueban (`Algo.test.tsx`).

## Pantallas

- `/login`: ingreso (EB-06).
- `/registro`: creación de cuenta con rol `cliente` (EB-05).
- `/`: portada y mapa interactivo de restaurantes.

El contrato de auth que espera el front está documentado en `src/features/auth/types.ts`.

## Diseño y movimiento

La interfaz usa Fraunces para títulos e Inter para lectura. El hero de descubrimiento
usa Inter en su título «Encontrá dónde comer.» y agrupa «Ver restaurantes» y
«Explorar el mapa» en un solo bloque de acciones. La portada y Leaflet se cargan solo al entrar al inicio. GSAP y
ScrollTrigger también se cargan bajo demanda. La inicialización espera al montaje del contenedor,
incluso cuando el módulo ya está en caché. Las animaciones y los listeners se
limpian al salir; imágenes del hero y fuentes disparan el recálculo de medidas.
El hero se transforma en un mapa de ancho completo mediante zoom del bowl y apertura
circular. En escritorio se fija temporalmente la escena durante el scroll; en móvil
se usa una revelación breve en flujo normal. Se respeta `prefers-reduced-motion` y
el enlace «Explorar el mapa» permite saltar la animación.

El mapa se prepara al recibir las ubicaciones, independientemente del scroll:
se inicializa con los límites reales y se revela tras montar los marcadores y
ajustar el encuadre. Mientras se esperan los datos se muestra un fondo neutro.
Los avisos de tamaño repetidos no vuelven a centrarlo; solo un cambio real de
dimensiones recalcula el encuadre. Los mosaicos de OpenStreetMap se cargan aparte.

La portada no muestra tarjetas ni categorías. Los marcadores abren una ficha con
nombre, dirección e información ecológica. «Ver más» lleva a
`/restaurantes?restaurante=ID`; el catálogo filtra el resultado actual por ID sin
modificar la API y ofrece «Ver todos» para quitar la selección.
Los WebP de marca y sus prompts están en `src/shared/assets/GENERATED-ASSETS.md`.
Las tarjetas usan las imágenes de la API o la base de CloudFront configurada; si fallan, muestran el estado sin fotografía.

`Mi impacto` consulta el CO₂ acumulado de `/home`. No muestra historial ni métricas
sin fuente real. Los campos opcionales `imageUrl` y `communityImpact` permiten usar
la respuesta actual de inicio y conservar compatibilidad con respuestas anteriores.
