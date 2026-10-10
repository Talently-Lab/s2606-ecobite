import { useId } from 'react'
import { fieldBox } from './fieldStyles'

export default function TextField({ label, error, hint, className = '', ...inputProps }) {
  const id = useId()
  const messageId = `${id}-msg`
  const message = error || hint

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={`${fieldBox(error)} px-4 py-3 outline-none placeholder:text-musgo/70`}
        {...inputProps}
      />
      {message && (
        <span id={messageId} className={`text-sm ${error ? 'text-error' : 'text-musgo'}`}>
          {message}
        </span>
      )}
    </div>
  )
}
