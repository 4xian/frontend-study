import type { CategoryTechnologyManifest } from '@/common/catalog/types'
import { javaCoreModuleManifest } from './core/manifest'

export const javaTechnologyManifest: CategoryTechnologyManifest = {
  domain: 'backend',
  id: 'java',
  title: 'Java 全家桶',
  summary: '学习 Java 语言、运行时、标准库与后端工程基础。',
  modules: [javaCoreModuleManifest],
}
