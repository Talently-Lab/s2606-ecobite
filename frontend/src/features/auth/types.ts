/*
 * Contrato de auth propuesto (pendiente de acordar con backend y pasar a docs/api).
 * Base: VITE_API_URL
 *
 *   POST /auth/register  RegisterPayload  -> 201 AuthResponse
 *                                            409 { message, errors: { email } }
 *   POST /auth/login     LoginPayload     -> 200 AuthResponse
 *                                            401 { message }
 *   GET  /auth/me        (Bearer token)   -> 200 { usuario: Usuario }
 */

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

export interface AuthResponse {
  token: string
  usuario: Usuario
}

export interface MeResponse {
  usuario: Usuario
}
