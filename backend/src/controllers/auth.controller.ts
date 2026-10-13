import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  getPublicUser(id: number) {
    return authService.getPublicUser(id);
  }

  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { nombre, email, password } = req.body ?? {};

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

      const result = await authService.register({
        nombre,
        email: normalizedEmail,
        password,
      });

      return res.status(201).json({
        message: "Usuario registrado correctamente",
        ...result,
      });
    } catch (error) {
      if (
        (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") ||
        (typeof error === "object" && error !== null && "code" in error && error.code === "P2002")
      ) {
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

      next(error);
      return;
    }
  }

  async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { email, password } = req.body ?? {};

      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({
          error: {
            code: "INVALID_INPUT",
            message: "Correo y contraseña son obligatorios",
            fields: {},
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

      if (!password) {
        return res.status(400).json({
          error: {
            code: "INVALID_PASSWORD",
            message: "La contraseña es obligatoria",
            fields: {
              password: "Ingresa tu contraseña",
            },
          },
        });
      }

      const result = await authService.login(normalizedEmail, password);

      return res.status(200).json({
        message: "Inicio de sesión exitoso",
        ...result,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "INVALID_CREDENTIALS"
      ) {
        return res.status(401).json({
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Correo o contraseña incorrectos",
            fields: {},
          },
        });
      }

      next(error);
      return;
    }
  }
}
