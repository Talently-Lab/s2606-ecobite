import { NextFunction, Request, Response } from "express";
import { verificarToken } from "../utils/jwt";

export const autenticarUsuarioOpcional = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    next();
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

  try {
    req.usuario = verificarToken(match[1]);
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