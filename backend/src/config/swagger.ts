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
      "/api/home": {
        get: {
          tags: ["Home"],
          summary: "Obtener los datos de Home",
          description:
            "Devuelve restaurantes activos, platos destacados, impacto personal e impacto comunitario. El impacto personal es null cuando no se proporciona un usuario autenticado; el comunitario siempre se devuelve.",
          security: [{ bearerAuth: [] }],
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
                            nullable: true,
                            type: "object",
                            properties: {
                              co2SavedKg: { type: "number", example: 2.5 },
                            },
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
                            items: { type: "object" },
                          },
                          restaurants: {
                            type: "array",
                            items: { type: "object" },
                          },
                          featuredDishes: {
                            type: "array",
                            items: { type: "object" },
                          },
                          howItWorks: {
                            type: "array",
                            items: { type: "object" },
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
