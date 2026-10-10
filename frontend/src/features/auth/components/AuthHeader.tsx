interface AuthHeaderProps {
  title: string
  subtitle: string
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="font-display text-[32px] leading-tight font-semibold">{title}</h1>
      <p className="text-musgo">{subtitle}</p>
    </div>
  )
}
