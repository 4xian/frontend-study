import type { CategoryModuleManifest } from '@/common/catalog/types'
import { reactReduxDemoAssets } from './demo-manifest'
import { reactReduxContentEntries } from './entry-manifest'
import { reactReduxTrackManifest } from './react-redux-track'

export const reactReduxModuleManifest: CategoryModuleManifest = {
  id: 'redux',
  title: 'Redux Toolkit + React Redux',
  summary: '用 Redux Toolkit 建立 Redux 状态逻辑，并通过 React Redux 接入 React 组件。',
  entries: reactReduxContentEntries,
  learningTrack: reactReduxTrackManifest,
  demos: reactReduxDemoAssets,
}
