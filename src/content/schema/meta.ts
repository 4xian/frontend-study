export type ContentType = 'lesson' | 'reference' | 'project'

export type ContentLevel = 'beginner' | 'intermediate' | 'advanced'

export interface ContentSource {
  title: string
  url: string
}

export interface ContentMeta {
  id: string
  type: ContentType
  title: string
  summary: string
  ecosystem: string
  module: string
  collection: string
  level?: ContentLevel
  prerequisites?: string[]
  related?: string[]
  tags: string[]
  sources: ContentSource[]
  appliesTo: string
  verifiedAt: string
}

export interface LessonMeta extends ContentMeta {
  type: 'lesson'
  estimatedMinutes?: number
}

export interface ReferenceMeta extends ContentMeta {
  type: 'reference'
  anchors?: string[]
}

export interface ProjectMeta extends ContentMeta {
  type: 'project'
}

/**
 * 定义课程元数据并保留调用处的窄类型。
 */
export function defineLessonMeta<T extends LessonMeta>(meta: T): T {
  return meta
}

/**
 * 定义参考条目元数据并保留调用处的窄类型。
 */
export function defineReferenceMeta<T extends ReferenceMeta>(meta: T): T {
  return meta
}

/**
 * 定义项目条目元数据并保留调用处的窄类型。
 */
export function defineProjectMeta<T extends ProjectMeta>(meta: T): T {
  return meta
}
