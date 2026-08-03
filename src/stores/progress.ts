import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CatalogEntryNode, LearningTrack } from '@/content/catalog'

export const PROGRESS_STORAGE_KEY = 'vue3-study:progress'

export interface ProgressSnapshot {
  schemaVersion: 1
  completedEntryIds: string[]
  recentEntryId: string | null
  updatedAt: string | null
}

export interface TrackProgress {
  completedCount: number
  totalCount: number
  ratio: number
  hasStarted: boolean
  continueEntry?: CatalogEntryNode
}

/**
 * 创建未开始学习时的进度快照。
 */
function createEmptyProgress(): ProgressSnapshot {
  return {
    schemaVersion: 1,
    completedEntryIds: [],
    recentEntryId: null,
    updatedAt: null,
  }
}

/**
 * 判断本地数据是否符合当前进度结构。
 */
function isProgressSnapshot(value: unknown): value is ProgressSnapshot {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ProgressSnapshot>
  return (
    candidate.schemaVersion === 1 &&
    Array.isArray(candidate.completedEntryIds) &&
    candidate.completedEntryIds.every((id) => typeof id === 'string') &&
    (candidate.recentEntryId === null || typeof candidate.recentEntryId === 'string') &&
    (candidate.updatedAt === null || typeof candidate.updatedAt === 'string')
  )
}

/**
 * 读取进度；损坏或未知版本的数据直接清除。
 */
function readProgress(): ProgressSnapshot {
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEY)
  if (!stored) return createEmptyProgress()

  try {
    const parsed: unknown = JSON.parse(stored)
    if (isProgressSnapshot(parsed)) return parsed
  } catch {
    // 统一在下方清除无法使用的数据。
  }

  localStorage.removeItem(PROGRESS_STORAGE_KEY)
  return createEmptyProgress()
}

export const useProgressStore = defineStore('progress', () => {
  const initial = readProgress()
  const completedEntryIds = ref(initial.completedEntryIds)
  const recentEntryId = ref<string | null>(initial.recentEntryId)
  const updatedAt = ref<string | null>(initial.updatedAt)

  /** 当前可供目录纯计算使用的内存快照。 */
  const snapshot = computed<ProgressSnapshot>(() => ({
    schemaVersion: 1,
    completedEntryIds: [...completedEntryIds.value],
    recentEntryId: recentEntryId.value,
    updatedAt: updatedAt.value,
  }))

  /**
   * 将当前状态写入唯一的版本化本地键。
   */
  function persist(): void {
    updatedAt.value = new Date().toISOString()
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(snapshot.value))
  }

  /**
   * 判断指定课程是否已经完成。
   */
  function isCompleted(entryId: string): boolean {
    return completedEntryIds.value.includes(entryId)
  }

  /**
   * 标记或取消标记指定课程，并立即持久化。
   */
  function setCompleted(entryId: string, completed: boolean): void {
    const next = new Set(completedEntryIds.value)
    if (completed) next.add(entryId)
    else next.delete(entryId)
    completedEntryIds.value = [...next]
    persist()
  }

  /**
   * 记录最近打开的课程，并立即持久化。
   */
  function recordVisit(entryId: string): void {
    recentEntryId.value = entryId
    persist()
  }

  /**
   * 根据显式课程顺序计算完成比例与继续学习入口。
   */
  function getTrackProgress(track: LearningTrack): TrackProgress {
    const trackIds = new Set(track.entries.map((entry) => entry.entryId))
    const completed = new Set(completedEntryIds.value.filter((id) => trackIds.has(id)))
    const recentIndex = track.entries.findIndex((entry) => entry.entryId === recentEntryId.value)
    let continueEntry: CatalogEntryNode | undefined

    if (recentIndex >= 0 && !completed.has(track.entries[recentIndex]!.entryId)) {
      continueEntry = track.entries[recentIndex]
    } else if (recentIndex >= 0) {
      continueEntry = track.entries
        .slice(recentIndex + 1)
        .find((entry) => !completed.has(entry.entryId))
    }
    continueEntry ??= track.entries.find((entry) => !completed.has(entry.entryId))

    return {
      completedCount: completed.size,
      totalCount: track.total,
      ratio: track.total ? completed.size / track.total : 0,
      hasStarted: recentIndex >= 0 || completed.size > 0,
      continueEntry,
    }
  }

  return {
    snapshot,
    isCompleted,
    setCompleted,
    recordVisit,
    getTrackProgress,
  }
})
