import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { clearMenuCache } from '../features/catalog/menuCache'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
  clearMenuCache()
  localStorage.clear()
  sessionStorage.clear()
})
