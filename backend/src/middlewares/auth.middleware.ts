import { NextFunction, Request, Response } from "express";
import { verificarToken } from "../utils/jwt";
import prisma from "../config/db";

export const autenticarUsuario = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      res.status(401).json({
        error: {
          code: "TOKEN_REQUIRED",
          message: "Se requiere un token de autenticación",
          fields: {},
        },
      });
      return;
    }

    const match = /^Bearer ([^\s]+)$/.exec(authorization);
    if (!match) {
      res.status(401).json({
        error: {
          code: "INVALID_TOKEN",
          message: "El formato del token no es válido",
          fields: {},
        },
      });
      return;
    }

    const payload = verificarToken(match[1]);

    req.usuario = payload;

    next();
    
  } catch {
    res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "El token no es válido o ha expirado",
        fields: {},
      },
    });
  }
};

export const requireRole = (rolRequerido: "cliente" | "dueno" | "admin") => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.usuario) {
      res.status(401).json({
        error: {
          code: "TOKEN_REQUIRED",
          message: "Se requiere autenticación",
          fields: {},
        },
      });
      return;
    }

    try {
      const userId = Number(req.usuario.sub);
      const user = await prisma.usuarios.findUnique({
        where: { id_usuario: userId },
        select: { rol: true },
      });

      if (!user) {
        res.status(401).json({
          error: { code: "INVALID_TOKEN", message: "El token no es válido", fields: {} },
        });
        return;
      }

      if (user.rol !== rolRequerido) {
        res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a este recurso",
            fields: {},
          },
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
