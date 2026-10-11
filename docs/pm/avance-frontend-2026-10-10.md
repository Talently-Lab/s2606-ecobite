# Avance frontend · 10/10/2026 (semana 4)

## Resumen

- Se definió el flujo de ramas: `main` → `frontend-dev` → `feature/*` ([flujo-de-trabajo-git.md](flujo-de-trabajo-git.md)).
- El setup del frontend (semana 1, molinerisit) se mergeó a `main` y se creó `frontend-dev`.
- Se construyeron las pantallas de **Login** (EB-06) y **Registro** (EB-05) según el diseño del canvas.
- El frontend se migró a **TypeScript** y se organizó **por features**, con tests, Prettier y convenciones documentadas.
- Se propuso el contrato de la API de auth ([../api/auth.md](../api/auth.md)).

## Ramas

| Rama                            | Contenido                                                   |
| ------------------------------- | ----------------------------------------------------------- |
| `main`                          | README del proyecto + setup del frontend                    |
| `frontend-dev`                  | Todo lo anterior + login/registro + arquitectura TypeScript |
| `feature/auth-screens`          | Ya mergeada en `frontend-dev`                               |
| `feature/frontend-architecture` | Ya mergeada en `frontend-dev`                               |

> **Estado:** todo está commiteado en local y **todavía no se subió a GitHub**. La cuenta `LumDev86` recibe error 403 (sin permiso de escritura en `Talently-Lab/s2606-ecobite`). Se pidió acceso _Write_ al admin de la organización. Cuando esté, se sube con `git push origin main frontend-dev`.

## Pantallas

Diseño de referencia: canvas "EcoBite" en Claude (7 pantallas desktop: Home, Local + carrito, Checkout, Confirmación, Mi impacto, Login/Registro, Admin).

| Ruta        | Pantalla | Historia | Estado                                                 |
| ----------- | -------- | -------- | ------------------------------------------------------ |
| `/login`    | Login    | EB-06    | Lista (con mock de auth)                               |
| `/registro` | Registro | EB-05    | Lista (con mock de auth)                               |
| `/`         | Home     | -        | Placeholder: saluda al usuario y permite cerrar sesión |

Comportamiento:

- Panel de marca a la izquierda (logo real, mensaje, beneficios en Registro) y formulario a la derecha. En celular se apilan.
- Validación en el cliente: nombre obligatorio, email válido, contraseña de 8+ caracteres con medidor de fuerza, repetición igual, términos aceptados.
- Errores por campo y alerta general con los textos del diseño. Email duplicado ofrece ir a "Ingresá".
- La sesión persiste al recargar. Con sesión iniciada, `/login` y `/registro` redirigen al inicio.

## Arquitectura del frontend

Stack: React 19, TypeScript estricto, Vite, React Router, Context API, Tailwind 4, lucide-react, Vitest + Testing Library, ESLint + Prettier.

```text
src/
  app/          App y router
  features/
    auth/       pages, components, context, hooks, routes, services, messages, types, validation
    home/       placeholder
  shared/       ui (Button, TextField, PasswordField, Alert), Logo, useForm, http, storage, rutas, estilos, assets
  test/         setup y helpers
```

Decisiones:

- **Por features:** cada funcionalidad tiene sus archivos y expone una API pública en `index.ts`. ESLint impide importar archivos internos de otra feature.
- **TypeScript:** el back ya usa TS; los tipos del contrato (`Usuario`, `Rol`) reflejan el schema de Prisma.
- **Mock de auth:** si `VITE_API_URL` está vacía, login y registro usan `localStorage`. Solo para desarrollar la UI.
- **Rutas:** `GuestRoute` (login, registro) y `ProtectedRoute` con roles, listo para Mi impacto y el panel admin.
- **Formularios:** hook `useForm` + validaciones puras con tests + textos en `messages.ts`.
- **Estilos:** tokens de la paleta extendida (diapositiva 11 de las Slides de diseño) en `shared/styles/index.css`: `bosque`, `noche`, `terracota`, `tinta`, `musgo`, `crema`, `brote`, `error`, etc. Tipografías Poppins (títulos) e Inter (texto).

Convenciones completas en [`frontend/README.md`](../../frontend/README.md).

## Verificación

- 18 tests (validaciones, LoginPage, RegisterPage) pasando.
- Lint, formato, typecheck y build sin errores, desde instalación limpia (`npm ci`).
- Prueba en navegador: registro con errores, registro correcto, email duplicado, login incorrecto y correcto, sesión tras recargar, vista mobile 390 px sin scroll horizontal.

## Pendientes

1. **Acceso de escritura al repo** para subir `main` y `frontend-dev`.
2. **Backend:** revisar y acordar el contrato de auth ([../api/auth.md](../api/auth.md)) e implementarlo.
3. **Backend:** acordar con los devs el flujo `backend-dev` (el setup más completo está en `feature/semana3-backend-setup`). Ojo: el script `prisma:migrate` corre `migrate dev` contra Supabase sin historial de migraciones.
4. Proteger `main` y `frontend-dev` en GitHub y agregar `.gitattributes`.
5. Siguientes pantallas: Home, Local + carrito, Checkout, Confirmación, Mi impacto, Admin.
6. Producto: fórmula de CO₂ (factores, línea base, distancia por zona) y definición de EB-07.
7. Diseño: exportar las pantallas a Figma cuando se renueve el cupo del MCP (plan Starter, 20 llamadas/mes).
