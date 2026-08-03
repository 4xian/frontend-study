import type { ContentEntry, ContentMeta } from '@/content/schema'

export type ContentPurpose = 'learn' | 'reference' | 'projects'

export type CatalogStatus = 'available' | 'planned'

export interface CatalogScope {
  purpose: ContentPurpose
  ecosystem?: string
  module?: string
  collection?: string
}

export interface ModuleManifest {
  id: string
  title: string
  status: CatalogStatus
}

export interface EcosystemManifest {
  id: string
  title: string
  summary: string
  status: CatalogStatus
  modules: ModuleManifest[]
}

export interface FlatCollectionManifest {
  id: string
  title: string
  summary?: string
  entryIds: string[]
}

export interface AvailableLearningEntryManifest {
  id: string
  status: 'available'
}

export interface PlannedLearningEntryManifest {
  id: string
  title: string
  summary: string
  status: 'planned'
}

export type LearningEntryManifest = AvailableLearningEntryManifest | PlannedLearningEntryManifest

export interface LearningCategoryManifest {
  id: string
  title: string
  summary: string
  topics: string[]
  entries: LearningEntryManifest[]
}

export interface LearningStageManifest {
  id: string
  title: string
  summary?: string
  categories: LearningCategoryManifest[]
}

export interface LearningTrackManifest {
  purpose: 'learn'
  ecosystem: string
  module: string
  collections: LearningStageManifest[]
}

export interface FlatTrackManifest {
  purpose: Exclude<ContentPurpose, 'learn'>
  ecosystem: string
  module: string
  collections: FlatCollectionManifest[]
}

export type TrackManifest = LearningTrackManifest | FlatTrackManifest

export interface CatalogNode {
  id: string
  title: string
  summary?: string
  status: CatalogStatus
  path: string
}

export interface CatalogEntryNode extends CatalogNode {
  entryId: string
  status: 'available'
}

export interface LearningTrackScope {
  ecosystem: string
  module: string
}

export type ReferenceCoverageDepth = 'detail' | 'merged' | 'quick'

export interface ReferenceTargetManifest {
  entryId: string
  anchor?: string
}

export interface ReferenceIndexItemManifest {
  id: string
  name: string
  officialUrl: string
  aliases?: string[]
  depth: ReferenceCoverageDepth
  status: CatalogStatus
  target?: ReferenceTargetManifest
}

export interface ReferenceIndexSectionManifest {
  id: string
  title: string
  items: ReferenceIndexItemManifest[]
}

export interface ReferenceIndexGroupManifest {
  id: string
  title: string
  sections: ReferenceIndexSectionManifest[]
}

export interface ReferenceIndexManifest {
  ecosystem: string
  module: string
  appliesTo: string
  verifiedAt: string
  groups: ReferenceIndexGroupManifest[]
}

export interface ReferenceOverviewItem extends ReferenceIndexItemManifest {
  path?: string
}

export interface ReferenceOverviewSection {
  id: string
  title: string
  items: ReferenceOverviewItem[]
}

export interface ReferenceOverviewGroup {
  id: string
  title: string
  sections: ReferenceOverviewSection[]
}

export interface ReferenceOverview {
  ecosystem: string
  module: string
  appliesTo: string
  verifiedAt: string
  groups: ReferenceOverviewGroup[]
  availableCount: number
  total: number
}

export interface LearningTrackStage {
  id: string
  title: string
  summary?: string
  entries: CatalogEntryNode[]
  categories: LearningCategory[]
}

export interface LearningRoadmapEntry {
  id: string
  entryId: string
  title: string
  summary: string
  status: CatalogStatus
  path?: string
}

export interface LearningCategory {
  id: string
  title: string
  summary: string
  topics: string[]
  entries: LearningRoadmapEntry[]
  availableCount: number
  total: number
}

export interface LearningTrack {
  stages: LearningTrackStage[]
  entries: CatalogEntryNode[]
  total: number
  roadmapTotal: number
}

export interface CatalogNavigation {
  valid: boolean
  scope: CatalogScope
  ecosystems: CatalogNode[]
  ecosystem?: CatalogNode
  modules: CatalogNode[]
  module?: CatalogNode
  collections: CatalogNode[]
  collection?: CatalogNode
  entries: CatalogEntryNode[]
}

export interface SearchHit {
  id: string
  title: string
  summary: string
  path: string
  group: string
  groupLabel: string
}

export type SearchProvider = (query: string) => SearchHit[]

export interface EntryNeighbor {
  id: string
  title: string
  path: string
}

export interface EntryNeighbors {
  previous?: EntryNeighbor
  next?: EntryNeighbor
}

export interface LearningCatalog {
  getNavigation(scope: CatalogScope): CatalogNavigation
  getLearningTrack(scope: LearningTrackScope): LearningTrack | undefined
  getReferenceOverview(scope: LearningTrackScope): ReferenceOverview | undefined
  getEntry(id: string): ContentMeta | undefined
  loadEntry(id: string): Promise<ContentEntry>
  search(query: string, scope?: CatalogScope): SearchHit[]
  getNeighbors(id: string): EntryNeighbors
}

export type EntryLoader = () => Promise<ContentEntry>

export interface CatalogSource {
  ecosystems: EcosystemManifest[]
  tracks: TrackManifest[]
  referenceIndexes?: ReferenceIndexManifest[]
  metas: ContentMeta[]
  loaders: Record<string, EntryLoader>
}
