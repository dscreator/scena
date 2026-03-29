/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_CHATKIT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
