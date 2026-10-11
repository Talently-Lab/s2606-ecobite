# Flujo de trabajo con Git

Definido el 10/10/2026. Por ahora aplica al frontend; el backend se suma cuando lo acuerde el equipo.

## Ramas

```text
main                      Setup de cada área. Solo recibe merges desde las ramas -dev.
 ├── frontend-dev         Rama principal del frontend.
 │    └── feature/<nombre>   Una rama por feature o tarea, creada por cada dev.
 └── backend-dev          (pendiente) Rama principal del backend.
      └── feature/<nombre>
```

- Nadie trabaja directo sobre `main` ni sobre `frontend-dev`.
- Cada feature sale de `frontend-dev` y vuelve a `frontend-dev` con un Pull Request.
- Cuando `frontend-dev` está estable, se mergea a `main`.

## Arrancar una feature

```bash
git fetch origin
git checkout frontend-dev
git pull
git checkout -b feature/<nombre-de-la-feature>
cd frontend && npm install
```

Nombres de rama en minúsculas y con guiones: `feature/home-catalogo`, `feature/carrito`, `fix/login-error`.

## Antes de abrir el PR

Traer lo último de `frontend-dev` y verificar:

```bash
git fetch origin
git merge origin/frontend-dev
cd frontend
npm run format:check && npm run lint && npm run test:run && npm run build
```

El PR va contra `frontend-dev` y lo revisa al menos otra persona del equipo.

## Commits

Formato [Conventional Commits](https://www.conventionalcommits.org/es/) en español:

```text
feat(frontend): pantalla de carrito
fix(frontend): validar email vacío en login
refactor(frontend): extraer CardLocal a shared
docs: flujo de trabajo con git
```

El autor del commit debe ser el email verificado en tu cuenta de GitHub, para que el commit aparezca con tu perfil:

```bash
git config user.name "Tu Nombre"
git config user.email "tu-email-de-github@ejemplo.com"
```

## Recomendado en GitHub (pendiente)

- Proteger `main` y `frontend-dev`: sin push directo, merge solo con PR aprobado.
- Agregar `.gitattributes` para unificar finales de línea entre Windows y Mac.
