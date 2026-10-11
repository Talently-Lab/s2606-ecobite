import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { FieldMessage } from './FieldMessage'
import { fieldBox } from './fieldStyles'
import type { TextFieldProps } from './TextField'

type PasswordFieldProps = Omit<TextFieldProps, 'type'>

/** Campo de contraseña con botón para mostrarla. `children` se ubica entre el campo y el mensaje. */
export function PasswordField({ label, error, hint, children, ...inputProps }: PasswordFieldProps) {
  const id = useId()
  const messageId = `${id}-msg`
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className={`${fieldBox(Boolean(error))} flex items-center gap-1 pr-1 pl-4`}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className="min-w-0 flex-1 bg-transparent py-3 outline-none"
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="flex size-11 flex-none items-center justify-center rounded-lg text-musgo hover:text-tinta"
        >
          <Icon className="size-5" aria-hidden="true" />
        </button>
      </div>
      {children}
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  )
}
