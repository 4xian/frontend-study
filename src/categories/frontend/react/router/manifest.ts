import type { CategoryModuleManifest } from '@/common/catalog/types'
import { reactRouterDemoAssets } from './demo-manifest'
import { reactRouterContentEntries } from './entry-manifest'
import { reactRouterTrackManifest } from './react-router-track'

export const reactRouterModuleManifest: CategoryModuleManifest = {
  id: 'router',
  title: 'React Router',
  summary: '以 Data Mode 为主线，学习客户端路由、导航、数据交互与错误恢复。',
  entries: reactRouterContentEntries,
  learningTrack: reactRouterTrackManifest,
  demos: reactRouterDemoAssets,
}
