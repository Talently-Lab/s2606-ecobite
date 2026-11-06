/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_EMAIL?: string
  readonly VITE_API_URL?: string
  readonly VITE_IMAGES_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
