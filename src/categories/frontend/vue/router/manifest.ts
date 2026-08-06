import type { CategoryModuleManifest } from '@/common/catalog/types'
import { vueRouterDemoAssets } from './demo-manifest'
import { vueRouterContentEntries } from './entry-manifest'
import { vueRouterReferenceIndexManifest } from './vue-router-reference-index'
import { vueRouterReferenceManifest } from './vue-router-reference'
import { vueRouterTrackManifest } from './vue-router-track'

export const vueRouterModuleManifest: CategoryModuleManifest = {
  id: 'router',
  title: 'Vue Router',
  summary: '学习 Vue 官方路由器的匹配、导航、视图与工程边界。',
  entries: vueRouterContentEntries,
  learningTrack: vueRouterTrackManifest,
  referenceTrack: vueRouterReferenceManifest,
  referenceIndex: vueRouterReferenceIndexManifest,
  demos: vueRouterDemoAssets,
}
