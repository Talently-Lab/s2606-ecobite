const COLORS = ['bg-borde', 'bg-error', 'bg-bosque', 'bg-bosque']

export default function PasswordMeter({ strength }) {
  return (
    <div className="flex gap-1 pt-0.5" aria-hidden="true">
      {[1, 2, 3].map((level) => (
        <span
          key={level}
          className={`h-1 flex-1 rounded-full ${level <= strength ? COLORS[strength] : 'bg-borde'}`}
        />
      ))}
    </div>
  )
}
