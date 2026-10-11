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

Si queda vacía, los servicios usan mocks en `localStorage` (por ejemplo `src/features/auth/services/authMock.ts`). Sirven solo para desarrollar la UI mientras el backend no esté listo.

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
      services/         authService (API real) y authMock
      messages.ts       Textos y mensajes de error
      types.ts          Tipos y contrato de la API de auth
      validation.ts     Validaciones (+ tests)
      index.ts          API pública de la feature
    home/               Inicio (placeholder)
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
- `/`: placeholder de la Home.

El contrato de auth que espera el front está documentado en `src/features/auth/types.ts`.
