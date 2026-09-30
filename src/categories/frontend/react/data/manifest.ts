import type { CategoryModuleManifest } from '@/common/catalog/types'
import { reactDataDemoAssets } from './demo-manifest'
import { reactDataContentEntries } from './entry-manifest'
import { reactDataTrackManifest } from './react-data-track'

export const reactDataModuleManifest: CategoryModuleManifest = {
  id: 'data',
  title: 'TanStack Query',
  summary: '从服务端状态模型开始，建立 React 应用的查询、缓存与数据同步能力。',
  entries: reactDataContentEntries,
  learningTrack: reactDataTrackManifest,
  demos: reactDataDemoAssets,
}
