/// <reference types="vite/client" />

declare module '*.md?content-entry' {
  import type { ContentEntry, ContentMeta } from '@/common/content'

  export const meta: ContentMeta
  const entry: ContentEntry
  export default entry
}

declare module '*.md?catalog-meta' {
  import type { CatalogContentMeta } from '@/common/catalog'

  export const meta: CatalogContentMeta
}

declare module 'virtual:content-catalog-meta' {
  import type { CatalogContentMeta } from '@/common/catalog'

  export function getContentMeta(path: string): CatalogContentMeta
}

declare module 'virtual:content-search-index' {
  import type { CatalogSearchRecord } from '@/common/catalog'

  export const contentSearchIndex: Record<string, CatalogSearchRecord>
}
