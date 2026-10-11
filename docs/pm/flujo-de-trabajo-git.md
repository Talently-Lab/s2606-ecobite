# Flujo de trabajo con Git

Definido el 10/10/2026. Por ahora aplica al frontend; el backend se suma cuando lo acuerde el equipo. No se trabaja con Pull Requests.

## Ramas

```text
main                      Setup de cada área. Solo recibe merges desde las ramas -dev.
 ├── frontend-dev         Rama principal del frontend.
 │    └── feature/<nombre>   Una rama por feature, creada por cada dev.
 └── backend-dev          (pendiente) Rama principal del backend.
      └── feature/<nombre>
```

- Nadie trabaja directo sobre `main` ni sobre la rama principal del área.
- Cada feature sale de la rama principal de su área (`frontend-dev` o `backend-dev`).
- Cuando `frontend-dev` está estable, se mergea a `main`.

Nombres de rama en minúsculas y con guiones: `feature/home-catalogo`, `feature/carrito`, `fix/login-error`.

## Flujo para una nueva feature

Los ejemplos usan `frontend-dev`; en backend es igual con `backend-dev`.

### 1. Actualizar la rama principal del área

Desde la rama en la que estés:

```bash
git checkout frontend-dev
git pull origin frontend-dev
```

> Si es la primera vez, o si el pull trajo cambios en `frontend/package.json`, correr `npm install` dentro de `frontend/`. La carpeta `node_modules` no se sube al repo, así que cada dev instala las dependencias en su máquina.

### 2. Crear la rama de la feature

```bash
git checkout -b feature/<nombre-de-la-feature>
```

### 3. Desarrollar y commitear en local

```bash
git add .
git commit -m "feat(frontend): <qué hace la feature>"
```

### 4. Volver a actualizar la rama principal

Antes de subir, traer los cambios que otros devs hayan subido mientras tanto:

```bash
git checkout frontend-dev
git pull origin frontend-dev
```

### 5. Integrar esos cambios en la feature y verificar

```bash
git checkout feature/<nombre-de-la-feature>
git merge frontend-dev
```

Si hay conflictos, resolverlos y commitear. Después verificar que todo siga funcionando:

```bash
cd frontend
npm install
npm run format:check && npm run lint && npm run test:run && npm run build
```

### 6. Subir la feature

```bash
git push -u origin feature/<nombre-de-la-feature>
```

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

- Proteger `main` para que no se pueda pushear directo por error.
- Agregar `.gitattributes` para unificar finales de línea entre Windows y Mac.
