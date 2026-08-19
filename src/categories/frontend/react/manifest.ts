import type { CategoryTechnologyManifest } from '@/common/catalog/types'
import { reactCoreModuleManifest } from './core/manifest'

export const reactTechnologyManifest: CategoryTechnologyManifest = {
  domain: 'frontend',
  id: 'react',
  title: 'React 全家桶',
  summary: '从 React Core 逐步进入路由、客户端状态与服务端数据管理。',
  modules: [reactCoreModuleManifest],
}
