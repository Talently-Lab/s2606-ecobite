import { NextFunction, Request, Response } from "express";
import { verificarToken } from "../utils/jwt";

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

    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
      res.status(401).json({
        error: {
          code: "INVALID_TOKEN",
          message: "El formato del token no es válido",
          fields: {},
        },
      });
      return;
    }

    const payload = verificarToken(token);

    req.usuario = payload;

    next();
    
  } catch (error) {
    console.error("Error en autenticación:", error);

    res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "El token no es válido o ha expirado",
        fields: {},
      },
    });
  }
};