import { ROUTES } from '@/shared/config/routes'
export function returnTo(state: unknown): string {
  const from = (state as { from?: unknown } | null)?.from
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//') || from.includes('\\'))
    return ROUTES.home
  const path = from.split(/[?#]/)[0]
  return path === ROUTES.login || path === ROUTES.register ? ROUTES.home : from
}
