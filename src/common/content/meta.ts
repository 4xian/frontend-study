export type ContentType = 'lesson' | 'reference'

export type ContentLevel = 'beginner' | 'intermediate' | 'advanced'

export type ContentDomain = 'frontend' | 'backend' | 'network'

export type ContentSourceOrigin = 'official' | 'community'

export type ContentSourceType =
  | 'specification'
  | 'api-doc'
  | 'official-reference'
  | 'release-note'
  | 'source-code'
  | 'official-test'
  | 'security-standard'
  | 'static-analysis'
  | 'engineering-reference'
  | 'project-source'

export interface ContentSource {
  id?: string
  title: string
  url: string
  sourceOrigin?: ContentSourceOrigin
  sourceType?: ContentSourceType
  appliesTo?: string
  claims?: string[]
}

export type ProjectEvidenceUsage = 'observed' | 'adapted' | 'corrected' | 'rejected'

export interface ProjectEvidence {
  file: string
  symbol: string
  usage: ProjectEvidenceUsage
}

export interface ContentMeta {
  id: string
  type: ContentType
  title: string
  summary: string
  domain: ContentDomain
  technology: string
  module: string
  level?: ContentLevel
  prerequisites?: string[]
  related?: string[]
  tags: string[]
  sources: ContentSource[]
  appliesTo: string
  verifiedAt: string
  stage?: string
  group?: string
  modernBaseline?: Record<string, string>
  legacyBaseline?: Record<string, string>
  projectEvidence?: ProjectEvidence[]
}

export interface LessonMeta extends ContentMeta {
  type: 'lesson'
  stage: string
  level: ContentLevel
  prerequisites: string[]
  estimatedMinutes?: number
}

export interface ReferenceMeta extends ContentMeta {
  type: 'reference'
  group: string
  anchors?: string[]
  headingIds: string[]
}

/** 定义课程元数据并保留调用处的窄类型。 */
export function defineLessonMeta<T extends LessonMeta>(meta: T): T {
  return meta
}

/** 定义参考条目元数据并保留调用处的窄类型。 */
export function defineReferenceMeta<T extends ReferenceMeta>(meta: T): T {
  return meta
}
