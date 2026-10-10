import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import PasswordField from '../components/ui/PasswordField'
import TextField from '../components/ui/TextField'
import { useAuth } from '../context/useAuth'
import { validateEmail } from '../utils/validation'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((errs) => ({ ...errs, [field]: null }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const next = {
      email: validateEmail(form.email),
      password: form.password ? null : 'Ingresá tu contraseña.',
    }
    setErrors(next)
    setFormError(null)
    if (next.email || next.password) return

    setSubmitting(true)
    try {
      await login({ email: form.email.trim(), password: form.password })
      navigate(location.state?.from ?? '/', { replace: true })
    } catch (err) {
      setFormError(
        err.status === 401
          ? 'El correo o la contraseña no son correctos. Revisalos e intentá de nuevo.'
          : err.message,
      )
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout intro="Ingresá para ver tu historial y seguir sumando CO₂ ahorrado en Mi impacto.">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[32px] leading-tight font-semibold">Hola de nuevo</h1>
        <p className="text-musgo">Ingresá para pedir y seguir sumando impacto.</p>
      </div>

      {formError && <Alert>{formError}</Alert>}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4.5">
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
        />
        <PasswordField
          label="Contraseña"
          autoComplete="current-password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
        />
        <Button type="submit" loading={submitting}>
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>

      <p className="text-center text-sm text-musgo">
        ¿No tenés cuenta?{' '}
        <Link to="/registro" className="px-0.5 py-2 font-semibold">
          Creá una gratis
        </Link>
      </p>
    </AuthLayout>
  )
}
