import type { ReactNode } from 'react'

interface FieldMessageProps {
  id: string
  error?: ReactNode
  hint?: ReactNode
}

/** Error o ayuda debajo de un campo. El error tiene prioridad. */
export function FieldMessage({ id, error, hint }: FieldMessageProps) {
  const message = error || hint
  if (!message) return null
  return (
    <span id={id} className={`text-sm ${error ? 'text-error' : 'text-musgo'}`}>
      {message}
    </span>
  )
}
