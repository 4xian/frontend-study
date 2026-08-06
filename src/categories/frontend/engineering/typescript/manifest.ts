import type { CategoryModuleManifest } from '@/common/catalog/types'
import { typeScriptDemoAssets } from './demo-manifest'
import { typeScriptContentEntries } from './entry-manifest'
import { engineeringTypeScriptTrackManifest } from './typescript-track'

export const typeScriptModuleManifest: CategoryModuleManifest = {
  id: 'typescript',
  title: 'TypeScript',
  summary: '从类型系统基础逐步进入类型操作与工程边界。',
  entries: typeScriptContentEntries,
  learningTrack: engineeringTypeScriptTrackManifest,
  demos: typeScriptDemoAssets,
}
