import bcrypt from "bcryptjs";
import prisma from "../config/db";
import { generarToken } from "../utils/jwt";  

interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
}

export class AuthService {
  async register({ nombre, email, password }: RegisterInput) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.usuarios.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.usuarios.create({
      data: {
        nombre: nombre.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        rol: "cliente",
        fecha_registro: new Date(),
      },
      select: {
        id_usuario: true,
        nombre: true,
        email: true,
        rol: true,
        fecha_registro: true,
      },
    });

    return user;
  }
    async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.usuarios.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = generarToken({
      id_usuario: user.id_usuario,
      email: user.email,
      rol: user.rol,
    });

    return {
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }
}
