import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "EcoBite API",
      version: "1.0.0",
      description:
        "Documentación de la API backend de EcoBite. Incluye autenticación y datos de Home.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local de desarrollo",
      },
    ],
    tags: [
      {
        name: "Autenticación",
        description: "Registro, inicio de sesión y perfil de usuario",
      },
      {
        name: "Home",
        description: "Datos de restaurantes, platos e impacto ambiental",
      },
      {
        name: "Catálogo y Perfil",
        description: "Catálogo de restaurantes y menú disponible",
      },
      {
        name: "Pedido confirmado e impacto",
        description: "Confirmación de pedidos y métricas de impacto persistidas",
      },
      {
        name: "Checkout",
        description: "Validación del carrito y cálculo preliminar de cotización",
      },
      {
        name: "Administración",
        description: "Indicadores generales y últimos pedidos para administradores",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Introduce el token JWT sin escribir el prefijo Bearer.",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "INVALID_INPUT" },
                message: {
                  type: "string",
                  example: "Los campos obligatorios no son válidos",
                },
                fields: {
                  type: "object",
                  additionalProperties: { type: "string" },
                },
              },
              required: ["code", "message", "fields"],
            },
          },
          required: ["error"],
        },
        OrderErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Los datos del pedido no son válidos",
            },
            code: {
              type: "string",
              example: "INVALID_ITEMS",
            },
          },
          required: ["message", "code"],
        },
        OrderMessageErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Error interno al crear el pedido",
            },
          },
          required: ["message"],
        },
        User: {
          type: "object",
          properties: {
            id_usuario: { type: "integer", example: 1 },
            nombre: { type: "string", example: "Usuario EcoBite" },
            email: {
              type: "string",
              format: "email",
              example: "usuario@example.com",
            },
            rol: {
              type: "string",
              enum: ["cliente", "dueno", "admin"],
              example: "cliente",
            },
            fecha_registro: {
              type: "string",
              format: "date-time",
            },
          },
          required: ["id_usuario", "nombre", "email", "rol"],
        },
        AuthResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            token: { type: "string", description: "JWT de autenticación" },
            user: { $ref: "#/components/schemas/User" },
          },
          required: ["message", "token", "user"],
        },
        RegisterRequest: {
          type: "object",
          properties: {
            nombre: { type: "string", minLength: 1, example: "Ana Pérez" },
            email: {
              type: "string",
              format: "email",
              example: "ana@example.com",
            },
            password: {
              type: "string",
              minLength: 8,
              description: "Mínimo 8 caracteres y máximo 72 bytes en UTF-8.",
              example: "ClaveSegura123",
            },
          },
          required: ["nombre", "email", "password"],
        },
        RestaurantCatalogItem: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Verde Bowl" },
            address: { type: "string", example: "Thames 1420, Palermo" },
            biodegradablePackaging: { type: "boolean", example: true },
            ecoIndicator: { type: "string", example: "A" },
            imageUrl: { type: "string", nullable: true, example: null },
            category: { type: "string", nullable: true, example: "Bowls" },
            estimatedDeliveryMinutes: { type: "integer", nullable: true, example: null },
            rating: { type: "number", nullable: true, example: null },
            latitude: { type: "number", nullable: true, example: null },
            longitude: { type: "number", nullable: true, example: null },
          },
          required: [
            "id", "name", "address", "biodegradablePackaging", "ecoIndicator",
            "imageUrl", "category", "estimatedDeliveryMinutes", "rating",
            "latitude", "longitude"
          ],
        },
        CatalogDish: {
          type: "object",
          properties: {
            id: { type: "integer", example: 16 },
            name: { type: "string", example: "Bowl quinoa" },
            price: { type: "number", example: 4500 },
            co2SavedPerUnit: { type: "number", example: 0.05 },
            category: { type: "string", nullable: true, example: "Bowls" },
            restaurantId: { type: "integer", example: 1 },
            imageUrl: { type: "string", nullable: true, example: null },
            available: { type: "boolean", example: true },
            restaurant: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                name: { type: "string", example: "Verde Bowl" },
                ecoIndicator: { type: "string", example: "A" },
                biodegradablePackaging: { type: "boolean", example: true },
              },
              required: ["id", "name", "ecoIndicator", "biodegradablePackaging"],
            },
          },
          required: [
            "id", "name", "price", "co2SavedPerUnit", "category",
            "restaurantId", "imageUrl", "available", "restaurant",
          ],
        },
        RestaurantMenu: {
          type: "object",
          properties: {
            restaurant: { $ref: "#/components/schemas/RestaurantCatalogItem" },
            dishes: {
              type: "array",
              items: { $ref: "#/components/schemas/CatalogDish" },
            },
          },
          required: ["restaurant", "dishes"],
        },
        RestaurantCatalogResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Catálogo obtenido correctamente" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/RestaurantCatalogItem" },
            },
          },
          required: ["message", "data"],
        },
        RestaurantMenuResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Menú obtenido correctamente" },
            data: { $ref: "#/components/schemas/RestaurantMenu" },
          },
          required: ["message", "data"],
        },
                RestaurantRating: {
          type: "object",
          properties: {
            id: { type: "integer", example: 12 },
            score: {
              type: "integer",
              minimum: 1,
              maximum: 5,
              example: 5,
            },
            comment: {
              type: "string",
              nullable: true,
              example: "Excelente comida y atención",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-10-31T18:30:00.000Z",
            },
          },
          required: ["id", "score", "comment", "createdAt"],
        },
        RestaurantRatingsData: {
          type: "object",
          properties: {
            averageScore: {
              type: "number",
              example: 4.5,
              description: "Promedio de puntuaciones redondeado a dos decimales.",
            },
            totalRatings: {
              type: "integer",
              example: 10,
            },
            ratings: {
              type: "array",
              items: { $ref: "#/components/schemas/RestaurantRating" },
            },
          },
          required: ["averageScore", "totalRatings", "ratings"],
        },
        RestaurantRatingRequest: {
          type: "object",
          properties: {
            score: {
              type: "integer",
              minimum: 1,
              maximum: 5,
              example: 5,
            },
            comment: {
              type: "string",
              nullable: true,
              example: "Excelente comida y atención",
            },
          },
          required: ["score"],
        },
        RestaurantRatingsResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Valoraciones obtenidas correctamente",
            },
            data: {
              $ref: "#/components/schemas/RestaurantRatingsData",
            },
          },
          required: ["message", "data"],
        },
        RestaurantRatingMutationResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Valoración creada correctamente",
            },
            data: {
              $ref: "#/components/schemas/RestaurantRating",
            },
          },
          required: ["message", "data"],
        },
        RatingMutationErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "La puntuación no es válida" },
            code: { type: "string", example: "INVALID_RATING_SCORE" },
          },
          required: ["message", "code"],
        },
        OrderConfirmationItem: {
          type: "object",
          properties: {
            dishId: { type: "integer", example: 16 },
            name: { type: "string", example: "Bowl quinoa" },
            quantity: { type: "integer", example: 2 },
            unitPrice: { type: "number", example: 4500 },
            subtotal: { type: "number", example: 9000 },
            co2SavedKg: {
              type: "number",
              example: 0.1,
              description: "Valor persistido en el detalle del pedido; no se recalcula.",
            },
            packagingType: { type: "string", example: "biodegradable" },
          },
          required: [
            "dishId", "name", "quantity", "unitPrice",
            "subtotal", "co2SavedKg", "packagingType",
          ],
        },
        OrderConfirmation: {
          type: "object",
          properties: {
            id: { type: "integer", example: 42 },
            date: { type: "string", format: "date-time" },
            status: { type: "string", example: "completed" },
            total: { type: "number", example: 9000 },
            zone: { type: "string", example: "Palermo" },
            restaurant: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                name: { type: "string", example: "Verde Bowl" },
              },
              required: ["id", "name"],
            },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderConfirmationItem" },
            },
            environmentalImpact: {
              type: "object",
              nullable: true,
              description: "Métrica ambiental persistida del pedido; null si no existe.",
              properties: {
                co2SavedKg: { type: "number", example: 0.1 },
              },
              required: ["co2SavedKg"],
            },
          },
          required: [
            "id", "date", "status", "total", "zone",
            "restaurant", "items", "environmentalImpact",
          ],
        },
        OrderConfirmationResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Confirmación del pedido obtenida correctamente",
            },
            data: {
              type: "object",
              properties: {
                order: { $ref: "#/components/schemas/OrderConfirmation" },
                myImpact: {
                  type: "object",
                  properties: {
                    co2SavedKg: { type: "number", example: 2.03 },
                    ordersCount: {
                      type: "integer",
                      example: 6,
                      description: "Cantidad de métricas de impacto registradas para el usuario.",
                    },
                  },
                  required: ["co2SavedKg", "ordersCount"],
                },
              },
              required: ["order", "myImpact"],
            },
          },
          required: ["message", "data"],
        },
        CheckoutQuoteRequest: {
          type: "object",
          required: ["restaurantId", "zone", "items"],
          properties: {
            restaurantId: { type: "integer", minimum: 1, example: 1 },
            zone: {
              type: "string",
              minLength: 1,
              maxLength: 50,
              example: "cercana",
              description: "Zona indicada por el cliente. En esta cotización solo se valida que sea un texto de hasta 50 caracteres.",
            },
            items: {
              type: "array",
              minItems: 1,
              maxItems: 20,
              items: {
                type: "object",
                required: ["dishId", "quantity"],
                properties: {
                  dishId: { type: "integer", minimum: 1, example: 16 },
                  quantity: {
                    type: "integer",
                    minimum: 1,
                    maximum: 20,
                    example: 2,
                  },
                },
              },
              description: "Hasta 20 productos distintos; no se admiten identificadores de plato repetidos.",
            },
          },
        },
        CheckoutQuoteItem: {
          type: "object",
          properties: {
            dishId: { type: "integer", example: 16 },
            name: { type: "string", example: "Bowl quinoa" },
            quantity: { type: "integer", example: 2 },
            unitPrice: { type: "number", example: 4500 },
            subtotal: { type: "number", example: 9000 },
          },
          required: ["dishId", "name", "quantity", "unitPrice", "subtotal"],
        },
        CheckoutQuoteResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Cotización calculada correctamente",
            },
            data: {
              type: "object",
              properties: {
                restaurantId: { type: "integer", example: 1 },
                restaurantName: { type: "string", example: "Verde Bowl" },
                zone: { type: "string", example: "cercana" },
                items: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CheckoutQuoteItem" },
                },
                subtotal: { type: "number", example: 9000 },
                deliveryFee: { type: "number", nullable: true, example: null },
                total: { type: "number", nullable: true, example: null },
                environmentalImpact: {
                  type: "number",
                  nullable: true,
                  example: null,
                },
                requiresEnvironmentalRules: {
                  type: "boolean",
                  example: true,
                },
              },
              required: [
                "restaurantId", "restaurantName", "zone", "items", "subtotal",
                "deliveryFee", "total", "environmentalImpact",
                "requiresEnvironmentalRules",
              ],
            },
          },
          required: ["message", "data"],
        },
        LoginRequest: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "ana@example.com",
            },
            password: {
              type: "string",
              description: "Contraseña de la cuenta.",
              example: "ClaveSegura123",
            },
          },
          required: ["email", "password"],
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Autenticación"],
          summary: "Registrar un usuario",
          description:
            "Crea una cuenta con rol cliente y devuelve un token JWT.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" },
              },
            },
          },
          responses: {
            "201": {
              description: "Usuario registrado correctamente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            "400": {
              description: "Datos de entrada no válidos",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "409": {
              description: "El correo electrónico ya está registrado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "429": { description: "Demasiados intentos" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Autenticación"],
          summary: "Iniciar sesión",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Inicio de sesión exitoso",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            "400": {
              description: "Datos de entrada no válidos",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "401": {
              description: "Credenciales incorrectas",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "429": { description: "Demasiados intentos" },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Autenticación"],
          summary: "Consultar el usuario autenticado",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Usuario autenticado",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Usuario autenticado",
                      },
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Token inválido o usuario no activo",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/restaurantes": {
        get: {
          tags: ["Catálogo y Perfil"],
          summary: "Obtener el catálogo de restaurantes",
          description: "Devuelve restaurantes activos. Los filtros de búsqueda se aplican al nombre, dirección y categorías derivadas de los platos disponibles.",
          parameters: [
            {
              name: "search",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Filtra por nombre o dirección.",
              example: "Verde",
            },
            {
              name: "categoria",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Categoría derivada de los nombres de platos disponibles.",
              example: "Bowls",
            },
          ],
          responses: {
            "200": {
              description: "Catálogo obtenido correctamente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RestaurantCatalogResponse" },
                },
              },
            },
          },
        },
      },
      "/api/restaurantes/{id}": {
        get: {
          tags: ["Catálogo y Perfil"],
          summary: "Obtener el perfil y menú de un restaurante",
          description: "Devuelve los datos disponibles del restaurante activo y sus platos disponibles. La valoración y el tiempo de entrega pueden ser null.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer", minimum: 1 },
              description: "Identificador entero positivo del restaurante.",
              example: 1,
            },
          ],
          responses: {
            "200": {
              description: "Menú obtenido correctamente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/RestaurantMenuResponse" },
                },
              },
            },
            "400": {
              description: "Identificador no válido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "404": {
              description: "Restaurante no encontrado o inactivo",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
            "/api/restaurantes/{id}/valoraciones": {
        get: {
          tags: ["Catálogo y Perfil"],
          summary: "Obtener las valoraciones de un restaurante",
          description:
            "Devuelve el promedio, la cantidad y el listado de valoraciones. No requiere autenticación.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer", minimum: 1 },
              description: "Identificador entero positivo del restaurante.",
              example: 1,
            },
          ],
          responses: {
            "200": {
              description: "Valoraciones obtenidas correctamente",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RestaurantRatingsResponse",
                  },
                },
              },
            },
            "400": {
              description: "Identificador de restaurante inválido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "404": {
              description: "Restaurante no encontrado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
        post: {
          tags: ["Catálogo y Perfil"],
          summary: "Crear una valoración para un restaurante",
          description:
            "Requiere JWT y rol cliente. El cliente debe tener al menos un pedido completado en el restaurante. Solo permite una valoración por cliente y restaurante.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer", minimum: 1 },
              example: 1,
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RestaurantRatingRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Valoración creada correctamente",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RestaurantRatingMutationResponse",
                  },
                },
              },
            },
            "400": {
              description: "Datos de valoración o identificador inválidos",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/RatingMutationErrorResponse" },
                    ],
                  },
                },
              },
            },
            "401": {
              description: "Token ausente, inválido o usuario no válido",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "403": {
              description:
                "El usuario no tiene rol cliente o no cuenta con un pedido completado en el restaurante",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/RatingMutationErrorResponse" },
                    ],
                  },
                },
              },
            },
            "404": {
              description: "Restaurante no encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RatingMutationErrorResponse",
                  },
                },
              },
            },
            "409": {
              description: "El cliente ya tiene una valoración para este restaurante",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RatingMutationErrorResponse",
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ["Catálogo y Perfil"],
          summary: "Actualizar la valoración de un restaurante",
          description:
            "Requiere JWT y rol cliente. Actualiza la valoración que el cliente autenticado ya registró para el restaurante. Si se omite el comentario, se conserva el anterior; si se envía null o vacío, se elimina.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer", minimum: 1 },
              example: 1,
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RestaurantRatingRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Valoración actualizada correctamente",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RestaurantRatingMutationResponse",
                  },
                },
              },
            },
            "400": {
              description: "Datos de valoración o identificador inválidos",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/RatingMutationErrorResponse" },
                    ],
                  },
                },
              },
            },
            "401": {
              description: "Token ausente, inválido o usuario no válido",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "403": {
              description: "El usuario autenticado no tiene rol cliente",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "404": {
              description: "No existe una valoración del cliente para este restaurante",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RatingMutationErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/checkout/cotizar": {
        post: {
          tags: ["Checkout"],
          summary: "Calcular una cotización preliminar del carrito",
          description:
            "Valida el restaurante activo y los platos disponibles, y calcula los precios y subtotales usando los valores del catálogo. No crea pedidos ni calcula el costo de despacho, el total final o el impacto ambiental.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CheckoutQuoteRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Cotización calculada correctamente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CheckoutQuoteResponse" },
                },
              },
            },
            "400": {
              description: "Datos del carrito, restaurante o productos inválidos",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "401": {
              description: "Token ausente o inválido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "404": {
              description: "Restaurante inexistente o no disponible",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "500": {
              description: "Error interno o datos de precios inválidos en el catálogo",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/pedidos": {
        post: {
          tags: ["Pedidos"],
          summary: "Crear un pedido",
          description:
            "Crea un pedido para un restaurante activo. El usuario se identifica mediante el token JWT; los precios y la disponibilidad se validan en el backend.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["restaurantId", "zone", "items"],
                  properties: {
                    restaurantId: {
                      type: "integer",
                      minimum: 1,
                      example: 1,
                    },
                    zone: {
                      type: "string",
                      maxLength: 50,
                      description: "Zona de demostración con distancia simulada provisional. Valores admitidos: cercana (2 km), media (5 km), lejana (8 km). Se aceptan mayúsculas y minúsculas.",
                      enum: ["cercana", "media", "lejana"],
                      example: "cercana",
                    },
                    items: {
                      type: "array",
                      minItems: 1,
                      items: {
                        type: "object",
                        required: ["dishId", "quantity"],
                        properties: {
                          dishId: {
                            type: "integer",
                            minimum: 1,
                            example: 12,
                          },
                          quantity: {
                            type: "integer",
                            minimum: 1,
                            example: 2,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description:
                "Pedido creado correctamente con su confirmación e impacto ambiental actualizado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/OrderConfirmationResponse",
                  },
                },
              },
            },
            "400": {
              description: "Datos del pedido inválidos o cuerpo JSON inválido",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/OrderErrorResponse" },
                      { $ref: "#/components/schemas/ErrorResponse" },
                    ],
                  },
                },
              },
            },
            "401": {
              description: "Token ausente o usuario autenticado no válido",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/OrderErrorResponse" },
                      { $ref: "#/components/schemas/ErrorResponse" },
                    ],
                  },
                },
              },
            },
            "404": {
              description: "Restaurante inexistente o inactivo",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/OrderErrorResponse" },
                },
              },
            },
            "422": {
              description:
                "Valor ambiental inválido o impacto ambiental total fuera del límite permitido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/OrderErrorResponse" },
                },
              },
            },
            "500": {
              description:
                "Error interno durante la creación del pedido o la generación de su confirmación",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/OrderErrorResponse" },
                      { $ref: "#/components/schemas/OrderMessageErrorResponse" },
                      { $ref: "#/components/schemas/ErrorResponse" },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      "/api/pedidos/{id}/confirmacion": {
        get: {
          tags: ["Pedido confirmado e impacto"],
          summary: "Consultar la confirmación de un pedido",
          description:
            "Devuelve un pedido perteneciente al usuario autenticado, sus detalles y las métricas ambientales persistidas. No crea pedidos ni recalcula el impacto.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer", minimum: 1 },
              description: "Identificador entero positivo del pedido.",
              example: 42,
            },
          ],
          responses: {
            "200": {
              description: "Confirmación obtenida correctamente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/OrderConfirmationResponse" },
                },
              },
            },
            "400": {
              description: "Identificador de pedido inválido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "401": {
              description: "Token ausente o usuario autenticado no válido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "404": {
              description: "Pedido inexistente o no perteneciente al usuario autenticado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "500": {
              description: "Error interno del servidor al consultar la confirmación del pedido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/home": {
        get: {
          tags: ["Home"],
          summary: "Obtener los datos de Home",
          description:
            "Devuelve restaurantes activos, platos destacados, impacto personal e impacto comunitario. El impacto personal es null cuando no se proporciona un usuario autenticado; el comunitario siempre se devuelve.",
          security: [{ bearerAuth: [] }, {}],
          responses: {
            "200": {
              description: "Datos obtenidos correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Datos obtenidos correctamente",
                      },
                        data: {
                          type: "object",
                          properties: {
                            userImpact: {
                              type: "object",
                              nullable: true,
                              properties: {
                                co2SavedKg: {
                                  type: "number",
                                  example: 2.5,
                                },
                              },
                              required: ["co2SavedKg"],
                            },
                            communityImpact: {
                              type: "object",
                              properties: {
                                co2SavedKg: {
                                  type: "number",
                                  example: 22.2,
                                  description:
                                    "Kilogramos de CO₂ evitados en pedidos completados de toda la comunidad.",
                                },
                              },
                              required: ["co2SavedKg"],
                            },
                            categories: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer", example: 1 },
                                  name: { type: "string", example: "Bowls" },
                                  slug: { type: "string", example: "bowls" },
                                },
                                required: ["id", "name", "slug"],
                              },
                            },
                            restaurants: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer", example: 1 },
                                  name: { type: "string", example: "Verde Bowl" },
                                  address: { type: "string", example: "Thames 1420, Palermo" },
                                  imageUrl: {
                                    type: "string",
                                    nullable: true,
                                    example: null,
                                  },
                                  biodegradablePackaging: {
                                    type: "boolean",
                                    example: true,
                                  },
                                  ecoIndicator: { type: "string", example: "A" },
                                },
                                required: [
                                  "id",
                                  "name",
                                  "address",
                                  "imageUrl",
                                  "biodegradablePackaging",
                                  "ecoIndicator",
                                ],
                              },
                            },
                            featuredDishes: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "integer", example: 16 },
                                  name: { type: "string", example: "Bowl quinoa" },
                                  imageUrl: {
                                    type: "string",
                                    nullable: true,
                                    example: null,
                                  },
                                  price: { type: "number", example: 4500 },
                                  co2SavedPerUnit: { type: "number", example: 0.05 },
                                  category: {
                                    type: "string",
                                    nullable: true,
                                    example: "Bowls",
                                  },
                                  restaurant: {
                                    type: "object",
                                    properties: {
                                      id: { type: "integer", example: 1 },
                                      name: { type: "string", example: "Verde Bowl" },
                                      ecoIndicator: { type: "string", example: "A" },
                                      biodegradablePackaging: {
                                        type: "boolean",
                                        example: true,
                                      },
                                    },
                                    required: [
                                      "id",
                                      "name",
                                      "ecoIndicator",
                                      "biodegradablePackaging",
                                    ],
                                  },
                                },
                                required: [
                                  "id",
                                  "name",
                                  "imageUrl",
                                  "price",
                                  "co2SavedPerUnit",
                                  "category",
                                  "restaurant",
                                ],
                              },
                            },
                            howItWorks: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  step: { type: "integer", example: 1 },
                                  title: { type: "string", example: "Elige tu comida" },
                                  description: {
                                    type: "string",
                                    example: "Descubre restaurantes y platillos disponibles en EcoBite.",
                                  },
                                },
                                required: ["step", "title", "description"],
                              },
                            },
                          },
                          required: [
                            "userImpact",
                            "communityImpact",
                            "categories",
                            "restaurants",
                            "featuredDishes",
                            "howItWorks",
                          ],
                        },
                      },
                    required: ["message", "data"],
                  },
                },
              },
            },
            "401": {
              description:
                "Token inválido cuando se envía autenticación opcional",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/admin/dashboard": {
        get: {
          tags: ["Administración"],
          summary: "Obtener el panel administrativo",
          description:
            "Devuelve indicadores generales y los últimos 10 pedidos. Requiere un usuario autenticado con rol admin.",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Panel administrativo obtenido correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          summary: {
                            type: "object",
                            properties: {
                              co2SavedKg: { type: "number", example: 12.5 },
                              ordersCount: { type: "integer", example: 60 },
                              activeRestaurantsCount: {
                                type: "integer",
                                example: 7,
                              },
                              averageTicket: { type: "number", example: 8500 },
                            },
                            required: [
                              "co2SavedKg",
                              "ordersCount",
                              "activeRestaurantsCount",
                              "averageTicket",
                            ],
                          },
                          recentOrders: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "integer", example: 42 },
                                date: {
                                  type: "string",
                                  format: "date-time",
                                },
                                customer: { type: "string", example: "Ana Pérez" },
                                restaurant: {
                                  type: "string",
                                  example: "Verde Bowl",
                                },
                                zone: { type: "string", example: "cercana" },
                                total: { type: "number", example: 9000 },
                                co2SavedKg: {
                                  type: "number",
                                  nullable: true,
                                  example: 0.1,
                                },
                                status: {
                                  type: "string",
                                  example: "completed",
                                },
                              },
                              required: [
                                "id",
                                "date",
                                "customer",
                                "restaurant",
                                "zone",
                                "total",
                                "co2SavedKg",
                                "status",
                              ],
                            },
                          },
                        },
                        required: ["summary", "recentOrders"],
                      },
                    },
                    required: ["message", "data"],
                  },
                },
              },
            },
            "401": {
              description: "Token ausente o inválido",
            },
            "403": {
              description: "El usuario autenticado no tiene rol admin",
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
