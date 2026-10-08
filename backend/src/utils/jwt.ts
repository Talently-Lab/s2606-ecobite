import jwt from "jsonwebtoken";

interface JwtPayload {
  id_usuario: number;
  email: string;
  rol: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está configurado");
}

export const generarToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
};

export const verificarToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};