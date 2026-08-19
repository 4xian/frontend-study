import type { CategoryModuleManifest } from '@/common/catalog/types'
import { reactCoreDemoAssets } from './demo-manifest'
import { reactCoreContentEntries } from './entry-manifest'
import { reactCoreTrackManifest } from './react-core-track'

export const reactCoreModuleManifest: CategoryModuleManifest = {
  id: 'core',
  title: 'React 核心',
  summary: '从项目搭建、TSX、组件和 State 开始，逐步建立 React 客户端应用的核心模型。',
  entries: reactCoreContentEntries,
  learningTrack: reactCoreTrackManifest,
  demos: reactCoreDemoAssets,
}
