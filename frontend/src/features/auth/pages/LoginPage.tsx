import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, PasswordField, TextField } from '@/shared/components/ui'
import { ROUTES } from '@/shared/config/routes'
import { useForm } from '@/shared/hooks/useForm'
import { AuthHeader } from '../components/AuthHeader'
import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import { AUTH_MESSAGES } from '../messages'
import { validateLogin, type LoginValues } from '../validation'

interface LocationState {
  from?: string
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as LocationState | null)?.from ?? ROUTES.home

  const { values, formError, submitting, field, handleSubmit } = useForm<LoginValues>({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
    onSubmit: async ({ email, password }) => {
      await login({ email: email.trim(), password })
      navigate(from, { replace: true })
    },
    mapError: (error) => (error.status === 401 ? AUTH_MESSAGES.invalidCredentials : error.message),
  })

  return (
    <AuthLayout intro="Ingresá para ver tu historial y seguir sumando CO₂ ahorrado en Mi impacto.">
      <AuthHeader title="Hola de nuevo" subtitle="Ingresá para pedir y seguir sumando impacto." />

      {formError && <Alert>{formError}</Alert>}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4.5">
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={values.email}
          {...field('email')}
        />
        <PasswordField
          label="Contraseña"
          autoComplete="current-password"
          value={values.password}
          {...field('password')}
        />
        <Button type="submit" loading={submitting}>
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>

      <p className="text-center text-sm text-musgo">
        ¿No tenés cuenta?{' '}
        <Link to={ROUTES.register} className="px-0.5 py-2 font-semibold">
          Creá una gratis
        </Link>
      </p>
    </AuthLayout>
  )
}
