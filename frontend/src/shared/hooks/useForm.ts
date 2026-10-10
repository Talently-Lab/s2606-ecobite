import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ApiError } from '@/shared/lib/http'

export type FormErrors<T> = Partial<Record<keyof T, string>>

interface UseFormOptions<T> {
  initialValues: T
  validate: (values: T) => FormErrors<T>
  onSubmit: (values: T) => Promise<void>
  /** Mensaje general cuando hay errores por campo. */
  invalidMessage?: string
  /** Traduce un error del servidor al mensaje general. */
  mapError?: (error: ApiError) => string
}

const hasErrors = (errors: object) => Object.values(errors).some(Boolean)

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
  invalidMessage,
  mapError = (error) => error.message,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors<T>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const field = (name: keyof T) => ({
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setValues((prev) => ({ ...prev, [name]: value }))
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    },
    error: errors[name],
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setFormError(null)
    if (hasErrors(nextErrors)) {
      setFormError(invalidMessage ?? null)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      const error = err instanceof ApiError ? err : new ApiError(0, 'Algo salió mal. Intentá de nuevo.')
      if (hasErrors(error.fields)) {
        setErrors((prev) => ({ ...prev, ...error.fields }))
        setFormError(invalidMessage ?? error.message)
      } else {
        setFormError(mapError(error))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return { values, errors, formError, submitting, field, handleSubmit }
}
