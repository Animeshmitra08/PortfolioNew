/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional contact-form endpoint accepting a JSON POST. */
  readonly VITE_CONTACT_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
