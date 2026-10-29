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
          },
          required: [
            "id", "name", "address", "biodegradablePackaging", "ecoIndicator",
            "imageUrl", "category", "estimatedDeliveryMinutes", "rating",
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
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
