import { request } from '@/shared/lib/http'
import type { HomeResponse } from '../types'

export const homeService = {
  getHome: () => request<HomeResponse>('/home'),
}
