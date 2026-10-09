import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
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
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    typeof decoded === "string" ||
    typeof decoded.sub !== "string" ||
    typeof decoded.rol !== "string"
  ) {
    throw new Error("Payload JWT inválido");
  }

  return {
    sub: decoded.sub,
    rol: decoded.rol,
  };
};
