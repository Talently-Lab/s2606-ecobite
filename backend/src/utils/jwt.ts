import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
  rol: "cliente" | "dueno" | "admin";
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

if (!JWT_SECRET || Buffer.byteLength(JWT_SECRET, "utf8") < 32) {
  throw new Error("JWT_SECRET debe tener al menos 32 bytes");
}

if (!JWT_EXPIRES_IN) {
  throw new Error("JWT_EXPIRES_IN no está configurado");
}

export const generarToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    algorithm: "HS256",
  });
};

export const verificarToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, JWT_SECRET, {
    algorithms: ["HS256"],
  });

  if (
    typeof decoded === "string" ||
    typeof decoded.sub !== "string" ||
    !/^\d+$/.test(decoded.sub) ||
    !["cliente", "dueno", "admin"].includes(String(decoded.rol))
  ) {
    throw new Error("Payload JWT inválido");
  }

  return {
    sub: decoded.sub,
    rol: decoded.rol as JwtPayload["rol"],
  };
};
