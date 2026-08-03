import type { ContentEntry, ContentMeta } from '@/content/schema'
import { createLearningCatalog } from './LearningCatalog'
import { ecosystemManifests } from './manifests/ecosystems'
import { trackManifests } from './manifests/tracks'
import { vueCoreReferenceIndexManifest } from './manifests/vue-core-reference-index'
import type { EntryLoader } from './types'

const metaModules = import.meta.glob<ContentMeta>('../entries/*/*/*/*/*.ts', {
  eager: true,
  import: 'meta',
  query: '?catalog-meta',
})
const entryModules = import.meta.glob<{ default: ContentEntry }>('../entries/*/*/*/*/*.ts')

const entryMetas = Object.values(metaModules)
const entryLoaders = Object.fromEntries(
  Object.entries(metaModules).map(([path, meta]) => [
    meta.id,
    async () => (await entryModules[path]!()).default,
  ]),
) satisfies Record<string, EntryLoader>

export const learningCatalog = createLearningCatalog({
  ecosystems: ecosystemManifests,
  tracks: trackManifests,
  referenceIndexes: [vueCoreReferenceIndexManifest],
  metas: entryMetas,
  loaders: entryLoaders,
})

export type {
  CatalogNavigation,
  CatalogNode,
  CatalogScope,
  CatalogEntryNode,
  ContentPurpose,
  EntryNeighbor,
  EntryNeighbors,
  LearningCatalog,
  LearningCategory,
  LearningRoadmapEntry,
  LearningTrack,
  LearningTrackScope,
  LearningTrackStage,
  ReferenceCoverageDepth,
  ReferenceOverview,
  ReferenceOverviewGroup,
  ReferenceOverviewItem,
  ReferenceOverviewSection,
  SearchHit,
  SearchProvider,
} from './types'
