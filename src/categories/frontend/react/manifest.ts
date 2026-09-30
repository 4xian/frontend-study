import type { CategoryTechnologyManifest } from '@/common/catalog/types'
import { reactCoreModuleManifest } from './core/manifest'
import { reactDataModuleManifest } from './data/manifest'
import { reactReduxModuleManifest } from './redux/manifest'
import { reactRouterModuleManifest } from './router/manifest'
import { reactZustandModuleManifest } from './zustand/manifest'

export const reactTechnologyManifest: CategoryTechnologyManifest = {
  domain: 'frontend',
  id: 'react',
  title: 'React 全家桶',
  summary: '从 React Core 逐步进入路由、客户端状态与服务端数据管理。',
  modules: [
    reactCoreModuleManifest,
    reactRouterModuleManifest,
    reactReduxModuleManifest,
    reactZustandModuleManifest,
    reactDataModuleManifest,
  ],
}
