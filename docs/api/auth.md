# API de autenticación (propuesta)

**Estado:** propuesta del frontend, pendiente de revisión con backend. Fecha: 10/10/2026.

El frontend ya consume estos endpoints (`frontend/src/features/auth/services/authService.ts`). Mientras no existan, usa un mock local. Si backend necesita cambiar algo, se ajusta acá y en `frontend/src/features/auth/types.ts`.

## Decisiones de producto que lo condicionan

- La web del MVP es para clientes y un panel admin.
- El registro crea solo usuarios con rol `cliente`.
- Los dueños de locales (`dueno`) y los admins vienen del seed; no hay registro de dueños en el MVP.
- Auth propia en Express: contraseña con bcrypt y sesión con JWT, sobre la tabla `usuarios` de Supabase.
- Sin recuperación de contraseña por email (fuera de alcance).

## Base

`VITE_API_URL`, por ejemplo `http://localhost:3000/api`. Todas las respuestas en JSON.

Las rutas protegidas reciben el token en el header:

```text
Authorization: Bearer <token>
```

## Tipos

```ts
type Rol = "cliente" | "dueno" | "admin"; // enum rol_usuario

interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: Rol;
} // tabla usuarios, sin password_hash
```

## Endpoints

### POST /auth/register

```json
{
  "nombre": "Lucía Pérez",
  "email": "lucia@mail.com",
  "password": "verde2026bici"
}
```

| Respuesta | Cuerpo                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------ |
| 201       | `{ "token": "…", "usuario": Usuario }`                                                                                   |
| 400       | `{ "message": "…", "errors": { "<campo>": "<mensaje>" } }`                                                               |
| 409       | `{ "message": "Ya existe una cuenta con este correo.", "errors": { "email": "Ya existe una cuenta con este correo." } }` |

Reglas: `nombre` obligatorio, `email` válido y único (comparar en minúsculas), `password` de 8 caracteres o más. El rol siempre es `cliente`.

### POST /auth/login

```json
{ "email": "lucia@mail.com", "password": "verde2026bici" }
```

| Respuesta | Cuerpo                                                         |
| --------- | -------------------------------------------------------------- |
| 200       | `{ "token": "…", "usuario": Usuario }`                         |
| 401       | `{ "message": "El correo o la contraseña no son correctos." }` |

El 401 no debe indicar si lo incorrecto es el correo o la contraseña.

### GET /auth/me

Requiere token.

| Respuesta | Cuerpo                             |
| --------- | ---------------------------------- |
| 200       | `{ "usuario": Usuario }`           |
| 401       | `{ "message": "Sesión vencida." }` |

El front lo llama al cargar la app para validar el token guardado.

## Formato de errores

Cualquier error responde `{ "message": string, "errors"?: { [campo]: string } }`. El front muestra `message` como alerta general y `errors` debajo de cada campo.

## Logout

Sin endpoint: con JWT sin estado, el front borra el token.

## Para acordar con backend

- Duración del JWT y si hace falta refresh token.
- CORS para el origen del front en desarrollo (`http://localhost:5173`).
- Mensajes de error en español, como en la tabla.
