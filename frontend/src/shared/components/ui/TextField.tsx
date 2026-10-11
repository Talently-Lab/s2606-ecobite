import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { FieldMessage } from './FieldMessage'
import { fieldBox } from './fieldStyles'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: ReactNode
  hint?: ReactNode
}

export function TextField({ label, error, hint, className = '', ...inputProps }: TextFieldProps) {
  const id = useId()
  const messageId = `${id}-msg`

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={`${fieldBox(Boolean(error))} px-4 py-3 outline-none placeholder:text-musgo/70`}
        {...inputProps}
      />
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  )
}
