import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import PasswordMeter from '../components/auth/PasswordMeter'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import PasswordField from '../components/ui/PasswordField'
import TextField from '../components/ui/TextField'
import { useAuth } from '../context/useAuth'
import { MIN_PASSWORD, passwordStrength, validateEmail } from '../utils/validation'

const BENEFITS = [
  'Historial de pedidos con su impacto',
  'Tus datos de entrega listos para el próximo pedido',
  'Tu total de CO₂ ahorrado',
]

const STRENGTH_HINT = [
  `Mínimo ${MIN_PASSWORD} caracteres.`,
  `Muy corta: usá al menos ${MIN_PASSWORD} caracteres.`,
  'Aceptable. Sumá mayúsculas, números o símbolos para hacerla más segura.',
  `Buena contraseña. Mínimo ${MIN_PASSWORD} caracteres.`,
]

const EMAIL_TAKEN = 'Ya existe una cuenta con este correo.'

function validate(form) {
  return {
    nombre: form.nombre.trim() ? null : 'Ingresá tu nombre.',
    email: validateEmail(form.email),
    password:
      form.password.length >= MIN_PASSWORD ? null : `Muy corta: usá al menos ${MIN_PASSWORD} caracteres.`,
    password2: form.password2 === form.password ? null : 'Las contraseñas no coinciden.',
    terms: form.terms ? null : 'Necesitás aceptar los términos para crear tu cuenta.',
  }
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', email: '', password: '', password2: '', terms: false })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const strength = passwordStrength(form.password)

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((errs) => ({ ...errs, [field]: null }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const next = validate(form)
    setErrors(next)
    setFormError(null)
    if (Object.values(next).some(Boolean)) {
      setFormError('Revisá los campos marcados para crear tu cuenta.')
      return
    }

    setSubmitting(true)
    try {
      await register({ nombre: form.nombre.trim(), email: form.email.trim(), password: form.password })
      navigate('/', { replace: true })
    } catch (err) {
      if (err.fields && Object.keys(err.fields).length) {
        setErrors((errs) => ({ ...errs, ...err.fields }))
        setFormError('Revisá los campos marcados para crear tu cuenta.')
      } else {
        setFormError(err.message)
      }
      setSubmitting(false)
    }
  }

  const emailError =
    errors.email === EMAIL_TAKEN ? (
      <>
        {EMAIL_TAKEN}{' '}
        <Link to="/login" className="font-semibold">
          Ingresá
        </Link>{' '}
        o usá otro.
      </>
    ) : (
      errors.email
    )

  return (
    <AuthLayout
      intro="Con tu cuenta guardamos el CO₂ que ahorrás en cada pedido y lo vas viendo crecer en Mi impacto."
      extra={
        <ul className="flex flex-col gap-3 pt-2 text-[15px]">
          {BENEFITS.map((text) => (
            <li key={text} className="flex items-center gap-2.5">
              <span className="flex size-8 flex-none items-center justify-center rounded-full bg-brote text-noche">
                <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      }
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[32px] leading-tight font-semibold">Creá tu cuenta</h1>
        <p className="text-musgo">Es gratis y te lleva menos de un minuto.</p>
      </div>

      {formError && <Alert>{formError}</Alert>}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4.5">
        <TextField
          label="Nombre y apellido"
          autoComplete="name"
          value={form.nombre}
          onChange={update('nombre')}
          error={errors.nombre}
        />
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
          error={emailError}
        />
        <PasswordField
          label="Contraseña"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          hint={STRENGTH_HINT[strength]}
        >
          <PasswordMeter strength={strength} />
        </PasswordField>
        <PasswordField
          label="Repetí la contraseña"
          autoComplete="new-password"
          value={form.password2}
          onChange={update('password2')}
          error={errors.password2}
        />

        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-musgo">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={update('terms')}
              aria-invalid={errors.terms ? true : undefined}
              className="m-0 size-5 flex-none accent-bosque"
            />
            <span>
              Acepto los <a href="#">términos y condiciones</a> y la <a href="#">política de privacidad</a>.
            </span>
          </label>
          {errors.terms && <span className="text-sm text-error">{errors.terms}</span>}
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
        <Link to="/login" className="px-0.5 py-2 font-semibold">
          Ingresá
        </Link>
      </p>
    </AuthLayout>
  )
}
