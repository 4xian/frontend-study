import type { ContentBlock } from './blocks'
import type { LessonMeta, ReferenceMeta } from './meta'

export interface LessonEntry {
  meta: LessonMeta
  objectives: string[]
  blocks: ContentBlock[]
  exercises?: string[]
  recap?: string[]
}

export interface ReferenceEntry {
  meta: ReferenceMeta
  signature: string
  blocks: ContentBlock[]
  notes?: string[]
}

export type ContentEntry = LessonEntry | ReferenceEntry

/** 定义课程正文并保留调用处的窄类型。 */
export function defineLesson<T extends LessonEntry>(entry: T): T {
  return entry
}

/** 定义参考正文并保留调用处的窄类型。 */
export function defineReference<T extends ReferenceEntry>(entry: T): T {
  return entry
}
