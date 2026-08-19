import type { CategoryModuleManifest } from '@/common/catalog/types'
import { viteDemoAssets } from './demo-manifest'
import { viteContentEntries } from './entry-manifest'
import { viteReferenceIndexManifest } from './vite-reference-index'
import { engineeringViteReferenceManifest } from './vite-reference'
import { engineeringViteTrackManifest } from './vite-track'

export const viteModuleManifest: CategoryModuleManifest = {
  id: 'vite',
  title: 'Vite',
  summary: '从开发服务器和模块图逐步进入插件、生产构建、SSR 与交付边界。',
  entries: viteContentEntries,
  learningTrack: engineeringViteTrackManifest,
  referenceTrack: engineeringViteReferenceManifest,
  referenceIndex: viteReferenceIndexManifest,
  demos: viteDemoAssets,
}
