import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, email, password } = req.body;

      if (
        typeof nombre !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({
          error: {
            code: "INVALID_INPUT",
            message: "Nombre, correo y contraseña son obligatorios",
            fields: {},
          },
        });
      }

      if (!nombre.trim()) {
        return res.status(400).json({
          error: {
            code: "INVALID_NAME",
            message: "El nombre es obligatorio",
            fields: {
              nombre: "El nombre no puede estar vacío",
            },
          },
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          error: {
            code: "INVALID_EMAIL",
            message: "El correo electrónico no es válido",
            fields: {
              email: "Ingresa un correo electrónico válido",
            },
          },
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          error: {
            code: "INVALID_PASSWORD",
            message: "La contraseña debe tener al menos 8 caracteres",
            fields: {
              password: "Mínimo 8 caracteres",
            },
          },
        });
      }

      const user = await authService.register({
        nombre,
        email: normalizedEmail,
        password,
      });

      return res.status(201).json({
        message: "Usuario registrado correctamente",
        user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
        return res.status(409).json({
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "El correo electrónico ya está registrado",
            fields: {
              email: "Este correo ya está en uso",
            },
          },
        });
      }

      console.error("Error en registro:", error);

      return res.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Ocurrió un error interno del servidor",
          fields: {},
        },
      });
    }
  }
}