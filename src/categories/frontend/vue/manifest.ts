import type { CategoryTechnologyManifest } from '@/common/catalog/types'
import { vueCoreModuleManifest } from './core/manifest'
import { vuePiniaModuleManifest } from './pinia/manifest'
import { vueRouterModuleManifest } from './router/manifest'

export const vueTechnologyManifest: CategoryTechnologyManifest = {
  domain: 'frontend',
  id: 'vue',
  title: 'Vue 全家桶',
  summary: '从 Vue 核心逐步进入路由与状态管理。',
  modules: [vueCoreModuleManifest, vueRouterModuleManifest, vuePiniaModuleManifest],
}
