# EcoBite Frontend

Frontend del MVP de EcoBite, una plataforma FoodTech orientada a delivery sostenible.

## Stack

- React
- Vite
- React Router
- Context API
- Tailwind CSS
- ESLint

## Estructura inicial

- `src/components/`: componentes reutilizables.
- `src/pages/`: vistas principales de la aplicación.
- `src/services/`: comunicación con la API.
- `src/App.jsx`: componente principal.
- `src/index.css`: estilos globales y Tailwind.
- `src/main.jsx`: punto de entrada de React.

## Desarrollo local

Instalar dependencias con:

`npm install`

Iniciar el servidor de desarrollo con:

`npm run dev`

## Semana 1

Durante la primera semana se realizó:

- Inicialización del proyecto con React + Vite.
- Configuración de Tailwind CSS.
- Instalación de React Router.
- Definición de Context API como estrategia inicial de estado global.
- Creación de la arquitectura base de carpetas.
- Planificación de componentes reutilizables principales.
## Variables de entorno

Copiar `.env.example` a `.env` y completar `VITE_API_URL` con la URL de la API.

Si `VITE_API_URL` queda vacía, el login y el registro usan un mock en `localStorage` (`src/services/authService.js`). Sirve solo para desarrollar la UI mientras el backend de auth no esté listo.

## Pantallas

- `/login`: ingreso (EB-06).
- `/registro`: creación de cuenta con rol `cliente` (EB-05).
- `/`: placeholder de la Home.

El contrato de auth que espera el front está documentado al inicio de `src/services/authService.js`.
