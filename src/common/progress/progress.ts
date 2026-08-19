import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CatalogEntryNode, LearningTrack } from '@/common/catalog'

export const PROGRESS_STORAGE_KEY = 'vue3-study:progress'

export interface ProgressSnapshot {
  schemaVersion: 2
  completedEntryIds: string[]
  legacyCompletedEntryIds: string[]
  appliedEntryMigrationIds: string[]
  recentEntryId: string | null
  updatedAt: string | null
}

interface LegacyProgressSnapshot {
  schemaVersion: 1
  completedEntryIds: string[]
  recentEntryId: string | null
  updatedAt: string | null
}

export interface EntryProgressMigration {
  targetEntryId: string
  sourceEntryIds: string[]
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
    schemaVersion: 2,
    completedEntryIds: [],
    legacyCompletedEntryIds: [],
    appliedEntryMigrationIds: [],
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
    candidate.schemaVersion === 2 &&
    Array.isArray(candidate.completedEntryIds) &&
    candidate.completedEntryIds.every((id) => typeof id === 'string') &&
    Array.isArray(candidate.legacyCompletedEntryIds) &&
    candidate.legacyCompletedEntryIds.every((id) => typeof id === 'string') &&
    Array.isArray(candidate.appliedEntryMigrationIds) &&
    candidate.appliedEntryMigrationIds.every((id) => typeof id === 'string') &&
    (candidate.recentEntryId === null || typeof candidate.recentEntryId === 'string') &&
    (candidate.updatedAt === null || typeof candidate.updatedAt === 'string')
  )
}

/**
 * 判断本地数据是否为上一版进度结构。
 */
function isLegacyProgressSnapshot(value: unknown): value is LegacyProgressSnapshot {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<LegacyProgressSnapshot>
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
    if (isLegacyProgressSnapshot(parsed)) {
      return {
        schemaVersion: 2,
        completedEntryIds: parsed.completedEntryIds,
        legacyCompletedEntryIds: [],
        appliedEntryMigrationIds: [],
        recentEntryId: parsed.recentEntryId,
        updatedAt: parsed.updatedAt,
      }
    }
  } catch {
    // 统一在下方清除无法使用的数据。
  }

  localStorage.removeItem(PROGRESS_STORAGE_KEY)
  return createEmptyProgress()
}

export const useProgressStore = defineStore('progress', () => {
  const initial = readProgress()
  const completedEntryIds = ref(initial.completedEntryIds)
  const legacyCompletedEntryIds = ref(initial.legacyCompletedEntryIds)
  const appliedEntryMigrationIds = ref(initial.appliedEntryMigrationIds)
  const recentEntryId = ref<string | null>(initial.recentEntryId)
  const updatedAt = ref<string | null>(initial.updatedAt)
  let entryMigrations: EntryProgressMigration[] = []

  /** 当前可供目录纯计算使用的内存快照。 */
  const snapshot = computed<ProgressSnapshot>(() => ({
    schemaVersion: 2,
    completedEntryIds: [...completedEntryIds.value],
    legacyCompletedEntryIds: [...legacyCompletedEntryIds.value],
    appliedEntryMigrationIds: [...appliedEntryMigrationIds.value],
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
   * 按模块声明的来源关系迁移已合并课程的完成状态。
   */
  function applyEntryMigrations(migrations: EntryProgressMigration[]): void {
    entryMigrations = migrations
    const completed = new Set(completedEntryIds.value)
    const legacyCompleted = new Set(legacyCompletedEntryIds.value)
    const appliedMigrations = new Set(appliedEntryMigrationIds.value)
    let changed = false

    for (const migration of migrations) {
      if (appliedMigrations.has(migration.targetEntryId)) continue
      if (recentEntryId.value && migration.sourceEntryIds.includes(recentEntryId.value)) {
        recentEntryId.value = migration.targetEntryId
        changed = true
      }
      const completedSources = migration.sourceEntryIds.filter((entryId) => completed.has(entryId))
      if (completedSources.length < migration.sourceEntryIds.length) {
        for (const entryId of completedSources) {
          completed.delete(entryId)
          legacyCompleted.add(entryId)
        }
      } else {
        for (const entryId of migration.sourceEntryIds) {
          completed.delete(entryId)
          legacyCompleted.delete(entryId)
        }
        completed.add(migration.targetEntryId)
      }
      appliedMigrations.add(migration.targetEntryId)
      changed = true
    }

    if (!changed) return
    completedEntryIds.value = [...completed]
    legacyCompletedEntryIds.value = [...legacyCompleted]
    appliedEntryMigrationIds.value = [...appliedMigrations]
    persist()
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
    if (completed) {
      const legacyCompleted = new Set(legacyCompletedEntryIds.value)
      for (const migration of entryMigrations) {
        if (migration.targetEntryId !== entryId) continue
        for (const sourceEntryId of migration.sourceEntryIds) {
          legacyCompleted.delete(sourceEntryId)
        }
      }
      legacyCompletedEntryIds.value = [...legacyCompleted]
    }
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
    applyEntryMigrations,
    isCompleted,
    setCompleted,
    recordVisit,
    getTrackProgress,
  }
})
