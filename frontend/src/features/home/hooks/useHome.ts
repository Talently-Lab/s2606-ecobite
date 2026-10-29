import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth'
import { homeService } from '../services/homeService'
import type { HomeData } from '../types'

export function useHome() {
  const { usuario, loading: authLoading } = useAuth()
  const userId = usuario?.id_usuario ?? null
  const [result, setResult] = useState<{
    userId: number | null
    data: HomeData | null
    error: string | null
  } | null>(null)

  useEffect(() => {
    if (authLoading) return
    let active = true
    homeService.getHome().then(
      ({ data }) => {
        if (active) setResult({ userId, data, error: null })
      },
      (error: unknown) => {
        if (active)
          setResult({
            userId,
            data: null,
            error: error instanceof Error ? error.message : 'No pudimos cargar Home.',
          })
      },
    )
    return () => {
      active = false
    }
  }, [authLoading, userId])

  const current = !authLoading && result?.userId === userId ? result : null
  return { data: current?.data ?? null, error: current?.error ?? null, loading: current === null }
}
