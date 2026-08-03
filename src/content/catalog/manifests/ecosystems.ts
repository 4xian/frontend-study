import type { EcosystemManifest } from '../types'

export const ecosystemManifests: EcosystemManifest[] = [
  {
    id: 'vue',
    title: 'Vue',
    summary: '从 Vue 核心逐步进入路由与状态管理。',
    status: 'available',
    modules: [
      { id: 'core', title: 'Vue 核心', status: 'available' },
      { id: 'router', title: 'Vue Router', status: 'available' },
      { id: 'pinia', title: 'Pinia', status: 'available' },
    ],
  },
  {
    id: 'react',
    title: 'React',
    summary: 'React 核心与客户端生态路线。',
    status: 'planned',
    modules: [
      { id: 'core', title: 'React 核心 SPA', status: 'planned' },
      { id: 'router', title: 'React Router', status: 'planned' },
      { id: 'state', title: '状态管理', status: 'planned' },
      { id: 'data', title: '数据管理', status: 'planned' },
    ],
  },
  {
    id: 'engineering',
    title: '通用工程化',
    summary: '跨框架复用的类型、构建、测试与质量能力。',
    status: 'planned',
    modules: [
      { id: 'typescript', title: 'TypeScript', status: 'planned' },
      { id: 'vite', title: 'Vite', status: 'planned' },
      { id: 'testing', title: '测试', status: 'planned' },
      { id: 'delivery', title: '构建部署', status: 'planned' },
      { id: 'quality', title: '性能与质量', status: 'planned' },
    ],
  },
]
