📊 Diagrama Entidad-Relación (ERD)

Diagram
    USUARIOS ||--o| RESTAURANTES : "administra (1 a 0..1)"
    USUARIOS ||--o PEDIDOS : "realiza (1 a 0..N)"
    RESTAURANTES ||--| PLATILLOS : "ofrece (1 a 1..N)"
    RESTAURANTES ||--o PEDIDOS : "recibe (1 a 0..N)"
    PEDIDOS ||--| DETALLE_PEDIDOS : "contiene (1 a 1..N)"
    PLATILLOS ||--o DETALLE_PEDIDOS : "incluido en (1 a 0..N)"
    PEDIDOS ||--o| METRICAS_IMPACTO : "genera KPI (1 a 0..1)"

    USUARIOS {
        int id_usuario PK
        string nombre
        string email
        string password_hash
        enum rol
        datetime fecha_registro
    }

    RESTAURANTES {
        int id_restaurante PK
        int id_usuario_owner FK
        string nombre
        text direccion
        boolean envase_biodegradable
        string indicador_eco
    }

    PLATILLOS {
        int id_platillo PK
        int id_restaurante FK
        string nombre
        decimal precio
        decimal co2_ahorrado_unit
        boolean disponible
    }

    PEDIDOS {
        int id_pedido PK
        int id_usuario_cliente FK
        int id_restaurante FK
        datetime fecha_pedido
        string estado_simulado
        string transporte_sin_emision
        decimal total
        decimal co2_total_ahorrado
    }

    DETALLE_PEDIDOS {
        int id_detalle PK
        int id_pedido FK
        int id_platillo FK
        int cantidad
        decimal precio_unitario
        decimal co2_subtotal
    }

    METRICAS_IMPACTO {
        int id_metrica PK
        int id_pedido FK
        int id_usuario FK
        decimal co2_evitado_kg
        datetime fecha_calculo
    }

