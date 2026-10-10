import type { PasswordStrength } from '../validation'

const FILL: Record<PasswordStrength, string> = {
  0: 'bg-borde',
  1: 'bg-error',
  2: 'bg-bosque',
  3: 'bg-bosque',
}

/** Tres barras que se llenan según la fuerza de la contraseña. */
export function PasswordMeter({ strength }: { strength: PasswordStrength }) {
  return (
    <div className="flex gap-1 pt-0.5" aria-hidden="true">
      {[1, 2, 3].map((level) => (
        <span
          key={level}
          className={`h-1 flex-1 rounded-full ${level <= strength ? FILL[strength] : 'bg-borde'}`}
        />
      ))}
    </div>
  )
}
