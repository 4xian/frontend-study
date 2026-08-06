import type { CategoryModuleManifest } from '@/common/catalog/types'
import { backendJavaTrackManifest } from './backend-java-track'
import { javaCoreContentEntries } from './entry-manifest'

export const javaCoreModuleManifest: CategoryModuleManifest = {
  id: 'core',
  title: 'Java 核心',
  summary: '从 Java 运行基础逐步进入 Web、数据、工程与安全边界。',
  entries: javaCoreContentEntries,
  learningTrack: backendJavaTrackManifest,
  demos: [],
}
