# EcoBite — Diagrama Entidad-Relación

```mermaid
erDiagram

    USERS ||--o{ ORDERS : realiza
    RESTAURANTS ||--o{ PRODUCTS : ofrece
    RESTAURANTS ||--o{ ORDERS : recibe
    ORDERS ||--|{ ORDER_ITEMS : contiene
    PRODUCTS ||--o{ ORDER_ITEMS : incluye

    USERS {
        uuid user_id PK
        string email
        datetime created_at
    }

    RESTAURANTS {
        uuid restaurant_id PK
        string nombre
        boolean activo
        boolean es_eco_certificado
        datetime created_at
    }

    PRODUCTS {
        uuid product_id PK
        uuid restaurant_id FK
        string nombre
        decimal precio
        string tipo_envase_default
    }

    ORDERS {
        uuid order_id PK
        uuid user_id FK
        uuid restaurant_id FK
        datetime created_at
        string status
        decimal monto_total
        decimal distancia_km
        string tipo_transporte
        decimal co2_ahorrado_kg
    }

    ORDER_ITEMS {
        uuid order_item_id PK
        uuid order_id FK
        uuid product_id FK
        integer cantidad
        decimal precio_unitario
        string tipo_envase
    }

```

## Relaciones principales

- Un usuario puede realizar muchos pedidos.
- Cada pedido pertenece a un único usuario.
- Un restaurante puede recibir muchos pedidos.
- Cada pedido pertenece a un único restaurante.
- Un restaurante puede ofrecer muchos productos.
- Un pedido contiene uno o más ítems.
- Cada ítem referencia un producto.

Para el MVP se propone que un pedido corresponda a un solo restaurante.
