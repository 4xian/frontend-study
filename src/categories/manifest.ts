import type { CategoryTechnologyManifest } from '@/common/catalog/types'
import { javaTechnologyManifest } from './backend/java/manifest'
import { engineeringTechnologyManifest } from './frontend/engineering/manifest'
import { vueTechnologyManifest } from './frontend/vue/manifest'

export const categoryTechnologyManifests: CategoryTechnologyManifest[] = [
  vueTechnologyManifest,
  engineeringTechnologyManifest,
  javaTechnologyManifest,
]
