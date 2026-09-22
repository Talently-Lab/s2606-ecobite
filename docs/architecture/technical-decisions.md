# EcoBite — Decisiones técnicas iniciales

## Backend

- Runtime: Node.js
- Framework HTTP: Express
- Base de datos: PostgreSQL
- Driver PostgreSQL: pg
- Variables de entorno: dotenv
- CORS: cors

## Decisión de base de datos

Para el MVP se utilizará PostgreSQL.

La elección se basa en que el dominio de EcoBite presenta relaciones claras entre usuarios, restaurantes, productos, pedidos e ítems de pedido, por lo que un modelo relacional resulta adecuado.

Durante Semana 1 no se implementará todavía la lógica de persistencia. El objetivo es dejar preparado el proyecto, el modelo de datos y la estructura inicial.