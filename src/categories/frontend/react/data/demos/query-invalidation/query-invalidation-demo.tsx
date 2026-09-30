import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactElement,
} from 'react'

import './query-invalidation-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskStore = {
  tasks: TaskItem[]
  reminders: TaskItem[]
}

const taskKeys = {
  all: ['tasks'] as const,
  byOwner: (owner: string) => ['tasks', { owner }] as const,
}

const reminderKeys = {
  all: ['reminders'] as const,
}

/** 生成 Demo 初始任务和提醒。 */
function createInitialStore(): TaskStore {
  return {
    tasks: [{ id: 't-1', title: '现有任务', owner: '林晓' }],
    reminders: [{ id: 'r-1', title: '站会提醒', owner: '林晓' }],
  }
}

/** 等待固定时长，让作废后的重新获取能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 把当前列表读成 JSON，失败时抛出带状态码的 Error。 */
async function readItems(items: TaskItem[]): Promise<TaskItem[]> {
  await waitForQuery(1400)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(items))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem[]
}

/** 观察作废后哪些查询会重新获取，以及 mutation 成功后如何作废任务树。 */
function QueryInvalidationPanel(): ReactElement {
  const queryClient = useQueryClient()
  const storeRef = useRef<TaskStore>(createInitialStore())
  const [tasksCount, setTasksCount] = useState(0)
  const [ownerCount, setOwnerCount] = useState(0)
  const [remindersCount, setRemindersCount] = useState(0)

  /** 读取全部任务，并统计这次真实请求。 */
  const loadAllTasks = useCallback(async () => {
    queueMicrotask(() => {
      setTasksCount((count) => count + 1)
    })
    return readItems(storeRef.current.tasks)
  }, [])

  /** 读取林晓的任务，并统计这次真实请求。 */
  const loadOwnerTasks = useCallback(async () => {
    queueMicrotask(() => {
      setOwnerCount((count) => count + 1)
    })
    return readItems(storeRef.current.tasks.filter((task) => task.owner === '林晓'))
  }, [])

  /** 读取提醒，并统计这次真实请求。 */
  const loadReminders = useCallback(async () => {
    queueMicrotask(() => {
      setRemindersCount((count) => count + 1)
    })
    return readItems(storeRef.current.reminders)
  }, [])

  const tasksQuery = useQuery({
    queryKey: taskKeys.all,
    queryFn: loadAllTasks,
    staleTime: Infinity,
    retry: false,
  })

  const ownerQuery = useQuery({
    queryKey: taskKeys.byOwner('林晓'),
    queryFn: loadOwnerTasks,
    staleTime: Infinity,
    retry: false,
  })

  const remindersQuery = useQuery({
    queryKey: reminderKeys.all,
    queryFn: loadReminders,
    staleTime: Infinity,
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      await waitForQuery(1400)
      const created: TaskItem = {
        id: `t-${900 + storeRef.current.tasks.length}`,
        title: '核对创建任务',
        owner: '林晓',
      }
      storeRef.current.tasks = [...storeRef.current.tasks, created]
      return created
    },
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })

  const busy =
    createMutation.isPending ||
    tasksQuery.isFetching ||
    ownerQuery.isFetching ||
    remindersQuery.isFetching

  /** 用 mutate 创建任务；成功后作废 tasks 前缀。 */
  function runCreate(): void {
    createMutation.mutate()
  }

  /** 作废所有以 tasks 开头的查询，并重新获取正在显示的那些。 */
  function invalidateTaskPrefix(): void {
    void queryClient.invalidateQueries({ queryKey: taskKeys.all })
  }

  /** 只作废 queryKey 正好是 ['tasks'] 的那一条。 */
  function invalidateExactTasks(): void {
    void queryClient.invalidateQueries({ queryKey: taskKeys.all, exact: true })
  }

  /** 把匹配到的查询标成 stale，但不立刻重新获取。 */
  function invalidateWithoutRefetch(): void {
    void queryClient.invalidateQueries({ queryKey: taskKeys.all, refetchType: 'none' })
  }

  /** 作废缓存里的全部查询。 */
  function invalidateEverything(): void {
    void queryClient.invalidateQueries()
  }

  /** 恢复初始数据并重新读取，清掉计数。 */
  function resetDemo(): void {
    storeRef.current = createInitialStore()
    setTasksCount(0)
    setOwnerCount(0)
    setRemindersCount(0)
    createMutation.reset()
    void queryClient.invalidateQueries()
  }

  return (
    <section className="query-invalidation-demo" data-testid="query-invalidation-demo">
      <header className="query-invalidation-header">
        <span>TanStack Query</span>
        <h2>查询失效</h2>
        <p>
          三份查询都把 staleTime 设成 Infinity。创建任务成功后作废 tasks 前缀；精确作废只打
          ['tasks']；提醒走另一棵树。
        </p>
      </header>

      <div className="query-invalidation-metrics" aria-live="polite">
        <div>
          <span>全部任务次数</span>
          <strong data-testid="query-invalidation-tasks-count">{tasksCount}</strong>
        </div>
        <div>
          <span>林晓任务次数</span>
          <strong data-testid="query-invalidation-owner-count">{ownerCount}</strong>
        </div>
        <div>
          <span>提醒次数</span>
          <strong data-testid="query-invalidation-reminders-count">{remindersCount}</strong>
        </div>
        <div>
          <span>全部 isStale</span>
          <strong data-testid="query-invalidation-tasks-stale">{String(tasksQuery.isStale)}</strong>
        </div>
        <div>
          <span>林晓 isStale</span>
          <strong data-testid="query-invalidation-owner-stale">{String(ownerQuery.isStale)}</strong>
        </div>
        <div>
          <span>提醒 isStale</span>
          <strong data-testid="query-invalidation-reminders-stale">
            {String(remindersQuery.isStale)}
          </strong>
        </div>
        <div>
          <span>mutation</span>
          <strong data-testid="query-invalidation-mutation-status">{createMutation.status}</strong>
        </div>
      </div>

      <div className="query-invalidation-actions">
        <button type="button" data-kind="primary" disabled={busy} onClick={runCreate}>
          创建任务
        </button>
        <button type="button" disabled={busy} onClick={invalidateTaskPrefix}>
          作废任务前缀
        </button>
        <button type="button" disabled={busy} onClick={invalidateExactTasks}>
          精确作废全部任务
        </button>
        <button type="button" disabled={busy} onClick={invalidateWithoutRefetch}>
          作废但不重新获取
        </button>
        <button type="button" disabled={busy} onClick={invalidateEverything}>
          作废全部查询
        </button>
        <button type="button" disabled={busy} onClick={resetDemo}>
          重置
        </button>
      </div>

      <div className="query-invalidation-columns">
        <section className="query-invalidation-card">
          <h3>全部任务</h3>
          {tasksQuery.isPending ? (
            <p className="query-invalidation-message" role="status">
              正在读取全部任务。
            </p>
          ) : null}
          {tasksQuery.isSuccess ? (
            <ul data-testid="query-invalidation-tasks-list">
              {tasksQuery.data.map((task) => (
                <li key={task.id}>
                  {task.title} / {task.owner}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
        <section className="query-invalidation-card">
          <h3>林晓的任务</h3>
          {ownerQuery.isPending ? (
            <p className="query-invalidation-message" role="status">
              正在读取林晓的任务。
            </p>
          ) : null}
          {ownerQuery.isSuccess ? (
            <ul data-testid="query-invalidation-owner-list">
              {ownerQuery.data.map((task) => (
                <li key={task.id}>
                  {task.title} / {task.owner}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
        <section className="query-invalidation-card">
          <h3>提醒</h3>
          {remindersQuery.isPending ? (
            <p className="query-invalidation-message" role="status">
              正在读取提醒。
            </p>
          ) : null}
          {remindersQuery.isSuccess ? (
            <ul data-testid="query-invalidation-reminders-list">
              {remindersQuery.data.map((item) => (
                <li key={item.id}>
                  {item.title} / {item.owner}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function QueryInvalidationDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <QueryInvalidationPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册查询失效 Demo。 */
export function createQueryInvalidationDemo(): ComponentType {
  return QueryInvalidationDemoRoot
}
