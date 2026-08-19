import type { ContentEntry, ContentMeta } from '@/common/content'
import type { DemoAssetManifest, PrincipleAssetManifest } from '@/common/content/demo-registry'

export type DomainId = 'frontend' | 'backend' | 'network'

export type ContentType = 'learn' | 'reference'

export type CatalogStatus = 'available' | 'planned'

export interface CategoryScope {
  domain?: DomainId
  technology?: string
  module?: string
  contentType?: ContentType
  group?: string
}

export interface ModuleScope {
  domain: DomainId
  technology: string
  module: string
}

export interface CategoryModuleManifest {
  id: string
  title: string
  summary: string
  entries: CategoryContentEntryManifest[]
  learningTrack?: LearningTrackManifest
  referenceTrack?: ReferenceTrackManifest
  referenceIndex?: ReferenceIndexManifest
  demos: DemoAssetManifest[]
  principles?: PrincipleAssetManifest[]
}

export interface CategoryContentEntryManifest {
  slug: string
  meta: ContentMeta
  load: EntryLoader
}

export interface CategoryTechnologyManifest {
  domain: DomainId
  id: string
  title: string
  summary: string
  modules: CategoryModuleManifest[]
}

export interface ReferenceGroupManifest {
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
  stages: LearningStageManifest[]
}

export interface ReferenceTrackManifest {
  groups: ReferenceGroupManifest[]
}

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

export type ReferenceCoverageDepth = 'detail' | 'merged' | 'quick'

export type ReferenceSourceTag = 'public' | 'internal' | 'alpha' | 'deprecated'

export interface ReferenceTargetManifest {
  entryId: string
  anchor?: string
}

export interface ReferenceIndexItemManifest {
  id: string
  name: string
  officialUrl: string
  aliases?: readonly string[]
  depth: ReferenceCoverageDepth
  sourceTag?: ReferenceSourceTag
  status: CatalogStatus
  target?: ReferenceTargetManifest
}

export interface ReferenceSearchItemManifest {
  id: string
  name: string
  aliases?: readonly string[]
  sourceTag?: ReferenceSourceTag
  target: ReferenceTargetManifest
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

export type ReferenceObservationStatus =
  | 'navigation'
  | 'deprecated'
  | 'unsupported'
  | 'experimental'
  | 'cli-only'
  | 'historical'
  | 'observation'
  | 'restricted'
  | 'deferred'
  | 'prerelease'

export interface ReferenceObservationItem {
  readonly id: string
  readonly name: string
  readonly officialUrl?: string
  readonly note?: string
}

export interface ReferenceObservationScope {
  readonly id: string
  readonly title: string
  readonly status: ReferenceObservationStatus
  readonly count: number
  readonly items?: readonly ReferenceObservationItem[]
}

export interface ReferenceIndexManifest {
  appliesTo: string
  verifiedAt: string
  groups: ReferenceIndexGroupManifest[]
  searchItems?: ReferenceSearchItemManifest[]
  observationScopes?: readonly ReferenceObservationScope[]
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

export interface CategoryNavigation {
  valid: boolean
  scope: CategoryScope
  domains: CatalogNode[]
  domain?: CatalogNode
  technologies: CatalogNode[]
  technology?: CatalogNode
  modules: CatalogNode[]
  module?: CatalogNode
  groups: CatalogNode[]
  group?: CatalogNode
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
  getNavigation(scope?: CategoryScope): CategoryNavigation
  getLearningTrack(scope: ModuleScope): LearningTrack | undefined
  getReferenceOverview(scope: ModuleScope): ReferenceOverview | undefined
  getDemos(scope: ModuleScope): CatalogDemo[]
  getEntry(id: string): ContentMeta | undefined
  getEntryByPath(path: string): ContentMeta | undefined
  loadEntry(id: string): Promise<ContentEntry>
  search(query: string, scope?: CategoryScope): SearchHit[]
  getNeighbors(id: string): EntryNeighbors
}

export interface CatalogDemo {
  id: string
  title: string
  kind: 'local' | 'external'
  url?: string
}

export type EntryLoader = () => Promise<ContentEntry>

export interface CatalogSource {
  technologies: CategoryTechnologyManifest[]
}
