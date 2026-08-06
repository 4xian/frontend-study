import type { CategoryTechnologyManifest } from '@/common/catalog/types'
import { typeScriptModuleManifest } from './typescript/manifest'

export const engineeringTechnologyManifest: CategoryTechnologyManifest = {
  domain: 'frontend',
  id: 'engineering',
  title: '工程化',
  summary: '学习 TypeScript 等前端工程基础与工具链。',
  modules: [typeScriptModuleManifest],
}
