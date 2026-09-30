import type { CategoryModuleManifest } from '@/common/catalog/types'
import { reactZustandDemoAssets } from './demo-manifest'
import { reactZustandContentEntries } from './entry-manifest'
import { reactZustandTrackManifest } from './react-zustand-track'

export const reactZustandModuleManifest: CategoryModuleManifest = {
  id: 'zustand',
  title: 'Zustand',
  summary: '从客户端状态所有权开始，建立轻量、清晰且可维护的 React 状态管理能力。',
  entries: reactZustandContentEntries,
  learningTrack: reactZustandTrackManifest,
  demos: reactZustandDemoAssets,
}
