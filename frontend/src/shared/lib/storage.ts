// localStorage puede no estar disponible (modo privado, cookies bloqueadas):
// en ese caso los datos duran lo que la pestaña y la app sigue funcionando.

export function readItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeItem(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Sin storage: se ignora.
  }
}

export function readJson<T>(key: string): T | null {
  const raw = readItem(key)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  writeItem(key, JSON.stringify(value))
}
