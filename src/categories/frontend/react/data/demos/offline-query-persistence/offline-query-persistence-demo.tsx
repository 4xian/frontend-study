import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient, queryOptions, useIsRestoring, useQuery } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './offline-query-persistence-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type MemoryAsyncStorage = {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

type TaskStore = {
  fetchCount: number
  onFetchCountChange?: (count: number) => void
}

const persistKey = 'REACT_QUERY_OFFLINE_CACHE'

const taskStore: TaskStore = {
  fetchCount: 0,
}

const taskDetail: TaskItem = { id: 't-1', title: '现有任务', owner: '林晓' }

/** 等待固定时长，让首次请求和恢复过程都能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 用内存 Map 实现 AsyncStorage，避免写进页面真实 localStorage。 */
function createMemoryAsyncStorage(): MemoryAsyncStorage {
  const records = new Map<string, string>()
  return {
    async getItem(key) {
      await waitForQuery(600)
      return records.get(key) ?? null
    },
    async setItem(key, value) {
      records.set(key, value)
    },
    async removeItem(key) {
      records.delete(key)
    },
  }
}

/** 读取任务详情，并统计真实请求。 */
async function loadTaskDetail(): Promise<TaskItem> {
  queueMicrotask(() => {
    taskStore.fetchCount += 1
    taskStore.onFetchCountChange?.(taskStore.fetchCount)
  })
  await waitForQuery(1400)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(taskDetail))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'] as const,
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  gcTime: Infinity,
  retry: false,
})

/** 对照恢复中、缓存标题和真实请求次数。 */
function OfflineQueryPersistencePanel({
  fetchCount,
  onReload,
  onReset,
}: {
  fetchCount: number
  onReload: () => void
  onReset: () => void
}): ReactElement {
  const isRestoring = useIsRestoring()
  const taskQuery = useQuery(taskDetailOptions)
  const taskText = taskQuery.data ? `${taskQuery.data.title} / ${taskQuery.data.owner}` : '无'

  return (
    <section className="offline-query-demo" data-testid="offline-query-demo">
      <header className="offline-query-header">
        <span>TanStack Query</span>
        <h2>离线查询与缓存持久化</h2>
        <p>恢复完成前查询不会发请求。缓存写进持久化存储后，模拟重载会直接读出现有任务 / 林晓。</p>
      </header>

      <div className="offline-query-metrics" aria-live="polite">
        <div>
          <span>正在恢复</span>
          <strong data-testid="offline-query-restoring">{isRestoring ? '是' : '否'}</strong>
        </div>
        <div>
          <span>请求次数</span>
          <strong data-testid="offline-query-fetch-count">{fetchCount}</strong>
        </div>
        <div>
          <span>任务详情</span>
          <strong data-testid="offline-query-task">{taskText}</strong>
        </div>
      </div>

      <div className="offline-query-actions">
        <button type="button" data-kind="primary" onClick={onReload}>
          模拟重载
        </button>
        <button type="button" onClick={onReset}>
          重置
        </button>
      </div>

      <div className="offline-query-columns">
        <section className="offline-query-card">
          <h3>当前观察</h3>
          {isRestoring && (
            <p className="offline-query-message" role="status">
              正在从持久化存储恢复缓存，查询先保持 idle，不会同时去请求。
            </p>
          )}
          {!isRestoring && !taskQuery.data && (
            <p className="offline-query-message" role="status">
              存储里还没有这份详情，正在读取任务。
            </p>
          )}
          {!isRestoring && Boolean(taskQuery.data) && (
            <p className="offline-query-message" role="status">
              缓存可用。模拟重载会新建 QueryClient，再从同一份存储 hydrate。
            </p>
          )}
        </section>
      </div>
    </section>
  )
}

/** 用 PersistQueryClientProvider 先恢复再订阅后续写入。 */
function OfflineQueryPersistenceSession({
  storage,
  fetchCount,
  onReload,
  onReset,
}: {
  storage: MemoryAsyncStorage
  fetchCount: number
  onReload: () => void
  onReset: () => void
}): ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: Infinity,
            staleTime: Infinity,
            retry: false,
          },
        },
      }),
  )
  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage,
      key: persistKey,
      throttleTime: 0,
    }),
  )

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: Infinity }}
    >
      <OfflineQueryPersistencePanel fetchCount={fetchCount} onReload={onReload} onReset={onReset} />
    </PersistQueryClientProvider>
  )
}

/** 为课程页面注册离线查询与缓存持久化 Demo。 */
export function createOfflineQueryPersistenceDemo(): ComponentType {
  /** 存储跨模拟重载复用，重置时换成新的内存存储。 */
  function OfflineQueryPersistenceDemoRoot(): ReactElement {
    const [storage, setStorage] = useState(createMemoryAsyncStorage)
    const [clientSession, setClientSession] = useState(0)
    const [fetchCount, setFetchCount] = useState(0)

    useEffect(() => {
      taskStore.onFetchCountChange = setFetchCount
      return () => {
        taskStore.onFetchCountChange = undefined
      }
    }, [])

    /** 丢掉当前 QueryClient，从同一份存储再 hydrate。 */
    function reloadDemo(): void {
      setClientSession((current) => current + 1)
    }

    /** 清空计数和存储，重新走一次没有缓存的恢复。 */
    function resetDemo(): void {
      taskStore.fetchCount = 0
      setFetchCount(0)
      setStorage(createMemoryAsyncStorage())
      setClientSession((current) => current + 1)
    }

    return (
      <OfflineQueryPersistenceSession
        key={clientSession}
        storage={storage}
        fetchCount={fetchCount}
        onReload={reloadDemo}
        onReset={resetDemo}
      />
    )
  }

  return OfflineQueryPersistenceDemoRoot
}
