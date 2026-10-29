import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, PasswordField, TextField } from '@/shared/components/ui'
import { ROUTES } from '@/shared/config/routes'
import { useForm } from '@/shared/hooks/useForm'
import { AuthHeader } from '../components/AuthHeader'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordMeter } from '../components/PasswordMeter'
import { RegisterBenefits } from '../components/RegisterBenefits'
import { useAuth } from '../hooks/useAuth'
import { AUTH_MESSAGES, STRENGTH_HINTS } from '../messages'
import { passwordStrength, validateRegister, type RegisterValues } from '../validation'

import { returnTo } from '../routes/returnTo'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const from = returnTo(useLocation().state)

  const { values, errors, formError, submitting, field, handleSubmit } = useForm<RegisterValues>({
    initialValues: { nombre: '', email: '', password: '', password2: '', terms: false },
    validate: validateRegister,
    onSubmit: async ({ nombre, email, password }) => {
      await register({ nombre: nombre.trim(), email: email.trim(), password })
      navigate(from, { replace: true })
    },
    invalidMessage: AUTH_MESSAGES.registerInvalid,
  })

  const strength = passwordStrength(values.password)
  const termsField = field('terms')

  return (
    <AuthLayout
      intro="Con tu cuenta guardamos el CO₂ que ahorrás en cada pedido y lo vas viendo crecer en Mi impacto."
      extra={<RegisterBenefits />}
    >
      <AuthHeader title="Creá tu cuenta" subtitle="Es gratis y te lleva menos de un minuto." />

      {formError && <Alert>{formError}</Alert>}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4.5">
        <TextField label="Nombre y apellido" autoComplete="name" value={values.nombre} {...field('nombre')} />
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={values.email}
          {...field('email')}
          error={errors.email === AUTH_MESSAGES.emailTaken ? <EmailTakenMessage from={from} /> : errors.email}
        />
        <PasswordField
          label="Contraseña"
          autoComplete="new-password"
          value={values.password}
          {...field('password')}
          hint={STRENGTH_HINTS[strength]}
        >
          <PasswordMeter strength={strength} />
        </PasswordField>
        <PasswordField
          label="Repetí la contraseña"
          autoComplete="new-password"
          value={values.password2}
          {...field('password2')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-musgo">
            <input
              type="checkbox"
              checked={values.terms}
              onChange={termsField.onChange}
              aria-invalid={termsField.error ? true : undefined}
              className="m-0 size-5 flex-none accent-bosque"
            />
            <span>
              Acepto los <a href="#">términos y condiciones</a> y la <a href="#">política de privacidad</a>.
            </span>
          </label>
          {termsField.error && <span className="text-sm text-error">{termsField.error}</span>}
        </div>

        <Button type="submit" loading={submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
        <span className="text-center text-xs text-musgo">
          Guardamos tu contraseña cifrada. Nunca la vemos ni la compartimos.
        </span>
      </form>

      <p className="text-center text-sm text-musgo">
        ¿Ya tenés cuenta?{' '}
        <Link to={ROUTES.login} state={{ from }} className="px-0.5 py-2 font-semibold">
          Ingresá
        </Link>
      </p>
    </AuthLayout>
  )
}

function EmailTakenMessage({ from }: { from: string }) {
  return (
    <>
      {AUTH_MESSAGES.emailTaken}{' '}
      <Link to={ROUTES.login} state={{ from }} className="font-semibold">
        Ingresá
      </Link>{' '}
      o usá otro.
    </>
  )
}
