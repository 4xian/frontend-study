import type { CategoryModuleManifest } from '@/common/catalog/types'
import { vueCoreDemoAssets } from './demo-manifest'
import { vueCoreContentEntries } from './entry-manifest'
import { vueCorePrincipleAssets } from './principle-manifest'
import { vueCoreReferenceIndexManifest } from './vue-core-reference-index'
import { vueCoreReferenceManifest } from './vue-core-reference'
import { vueCoreTrackManifest } from './vue-core-track'

export const vueCoreModuleManifest: CategoryModuleManifest = {
  id: 'core',
  title: 'Vue 核心',
  summary: '学习 Vue 核心响应式、组件、内置能力与进阶工程边界。',
  entries: vueCoreContentEntries,
  learningTrack: vueCoreTrackManifest,
  referenceTrack: vueCoreReferenceManifest,
  referenceIndex: vueCoreReferenceIndexManifest,
  demos: vueCoreDemoAssets,
  principles: vueCorePrincipleAssets,
}
