/// <reference types="vite/client" />

declare module '*.md?content-entry' {
  import type { ContentEntry, ContentMeta } from '@/common/content'

  export const meta: ContentMeta
  const entry: ContentEntry
  export default entry
}

declare module '*.md?catalog-meta' {
  import type { ContentMeta } from '@/common/content'

  export const meta: ContentMeta
}
