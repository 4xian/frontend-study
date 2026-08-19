import type { CategoryModuleManifest } from '@/common/catalog/types'
import { backendJavaTrackManifest } from './backend-java-track'
import { javaCoreContentEntries } from './entry-manifest'

export const javaCoreModuleManifest: CategoryModuleManifest = {
  id: 'core',
  title: 'Spring Boot Web',
  summary: '从 Java 常用基础逐步掌握 Spring Boot Web 项目的开发、测试与交付。',
  entries: javaCoreContentEntries,
  learningTrack: backendJavaTrackManifest,
  demos: [],
}
