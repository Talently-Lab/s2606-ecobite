# EcoBite — Planificación Frontend Semana 1

## Stack definido

- Framework: React
- Build tool: Vite
- Navegación: React Router
- Estado global: Context API
- Estilos: Tailwind CSS

Para el MVP se utilizará Context API en lugar de Redux debido al alcance reducido del proyecto y para mantener una implementación simple.

Tailwind CSS se utilizará para acelerar la construcción de interfaces y mantener consistencia visual.

## Componentes reutilizables iniciales

### Navbar

Barra principal de navegación de la aplicación.

Responsabilidades previstas:

- Mostrar identidad de EcoBite.
- Acceso a las principales secciones.
- Acceso al carrito.
- Acceso a sesión/perfil cuando corresponda.

### RestaurantCard

Tarjeta reutilizable para representar un restaurante dentro del catálogo.

Responsabilidades previstas:

- Mostrar nombre del restaurante.
- Mostrar información visual.
- Mostrar indicadores relacionados con sostenibilidad.
- Permitir acceder al detalle del restaurante.

### CartItem

Representa un producto agregado al carrito.

Responsabilidades previstas:

- Mostrar producto.
- Mostrar cantidad.
- Mostrar precio.
- Permitir modificar o eliminar el ítem.

### GreenBadge

Indicador visual reutilizable para destacar características sostenibles.

Ejemplos:

- Producto eco.
- Envase biodegradable.
- Restaurante certificado.
- Entrega sostenible.

## Arquitectura inicial

La carpeta `src` se organizará inicialmente en:

- `components/`: componentes reutilizables.
- `pages/`: vistas principales asociadas a rutas.
- `services/`: comunicación con la API y servicios externos.

La estructura podrá ampliarse durante las siguientes semanas según las necesidades del MVP.