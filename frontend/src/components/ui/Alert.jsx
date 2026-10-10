import { CircleAlert } from 'lucide-react'

export default function Alert({ children }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl bg-error-suave px-4 py-3.5 text-error">
      <CircleAlert className="mt-0.5 size-5 flex-none" aria-hidden="true" />
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}
