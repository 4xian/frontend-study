import type { CategoryModuleManifest } from '@/common/catalog/types'
import { vuePiniaDemoAssets } from './demo-manifest'
import { vuePiniaContentEntries } from './entry-manifest'
import { vuePiniaReferenceIndexManifest } from './vue-pinia-reference-index'
import { vuePiniaReferenceManifest } from './vue-pinia-reference'
import { vuePiniaTrackManifest } from './vue-pinia-track'

export const vuePiniaModuleManifest: CategoryModuleManifest = {
  id: 'pinia',
  title: 'Pinia',
  summary: '学习 Vue 官方状态管理库的 Store 建模、运行时与工程边界。',
  entries: vuePiniaContentEntries,
  learningTrack: vuePiniaTrackManifest,
  referenceTrack: vuePiniaReferenceManifest,
  referenceIndex: vuePiniaReferenceIndexManifest,
  demos: vuePiniaDemoAssets,
}
