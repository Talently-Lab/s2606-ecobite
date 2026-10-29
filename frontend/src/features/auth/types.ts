/** Espeja el enum rol_usuario del schema de Prisma. */
export type Rol = 'cliente' | 'dueno' | 'admin'

/** Tabla `usuarios` sin password_hash. */
export interface Usuario {
  id_usuario: number
  nombre: string
  email: string
  rol: Rol
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  nombre: string
  email: string
  password: string
}

/** Respuesta de POST /api/auth/register y POST /api/auth/login. */
export interface AuthApiResponse {
  message: string
  token: string
  user: Usuario & { fecha_registro: string }
}

export interface AuthResponse {
  token: string
  usuario: Usuario
}

/** Respuesta de GET /api/auth/me. */
export interface MeApiResponse {
  message: string
  user: Usuario & { fecha_registro: string }
}

export interface MeResponse {
  usuario: Usuario
}
