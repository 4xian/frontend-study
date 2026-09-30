import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactElement,
} from 'react'
import {
  createMemoryRouter,
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './react-router-query-integration-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskStore = {
  sessionId: number
  fetchCount: number
  onFetchCountChange?: (count: number) => void
}

const taskStore: TaskStore = {
  sessionId: 0,
  fetchCount: 0,
}

const taskList: TaskItem[] = [{ id: 't-1', title: '现有任务', owner: '林晓' }]

const taskDetail: TaskItem = { id: 't-1', title: '现有任务', owner: '林晓' }

/** 等待固定时长，让 Loader 挡住详情渲染能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 只给当前 Demo 会话累加真实请求。 */
function bumpFetchCount(sessionId: number): void {
  if (taskStore.sessionId !== sessionId) {
    return
  }
  taskStore.fetchCount += 1
  taskStore.onFetchCountChange?.(taskStore.fetchCount)
}

/** 读取任务列表，并统计真实请求。 */
async function loadTaskList(): Promise<TaskItem[]> {
  const sessionId = taskStore.sessionId
  queueMicrotask(() => {
    bumpFetchCount(sessionId)
  })
  await waitForQuery(1400)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(taskList))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem[]
}

/** 读取任务详情，并统计真实请求。 */
async function loadTaskDetail(taskId: string): Promise<TaskItem> {
  const sessionId = taskStore.sessionId
  queueMicrotask(() => {
    bumpFetchCount(sessionId)
  })
  await waitForQuery(1400)
  const payload = taskId === taskDetail.id ? taskDetail : { id: taskId, title: '无', owner: '无' }
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const taskListOptions = queryOptions({
  queryKey: ['tasks'],
  queryFn: loadTaskList,
  staleTime: Infinity,
  retry: false,
})

const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: () => loadTaskDetail('t-1'),
  staleTime: Infinity,
  retry: false,
})

const DemoResetContext = createContext<() => void>(() => {})

/** 在列表页提示详情还没进入路由。 */
function TaskDetailIdlePane(): ReactElement {
  return <p className="router-query-message">尚未打开详情。</p>
}

/** 用与 Loader 同一份 queryOptions 读取已经写入的详情缓存。 */
function TaskDetailPane(): ReactElement {
  const detailQuery = useQuery(taskDetailOptions)

  if (detailQuery.isPending) {
    return (
      <p className="router-query-message" role="status">
        正在读取详情。
      </p>
    )
  }

  if (!detailQuery.isSuccess) {
    return null
  }

  return (
    <p data-testid="router-query-detail">
      {detailQuery.data.title} / {detailQuery.data.owner}
    </p>
  )
}

/** 观察路由 Loader 写入缓存后，详情页直接读同一份 queryOptions。 */
function RouterQueryShell(): ReactElement {
  const resetDemoSession = useContext(DemoResetContext)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const navigation = useNavigation()
  const [fetchCount, setFetchCount] = useState(taskStore.fetchCount)
  const [hasCache, setHasCache] = useState(false)
  const [cachedTitle, setCachedTitle] = useState('无')
  const [detailFetching, setDetailFetching] = useState(false)
  const listQuery = useQuery(taskListOptions)
  const tasks = listQuery.data ?? []
  const firstTask = tasks[0]
  const navigating = navigation.state !== 'idle'
  const busy = listQuery.isFetching || navigating || detailFetching

  useEffect(() => {
    taskStore.onFetchCountChange = setFetchCount
    return () => {
      taskStore.onFetchCountChange = undefined
    }
  }, [])

  useEffect(() => {
    /** 把详情缓存和这次拉取状态同步到观察区。 */
    function syncDetailCache(): void {
      const cached = queryClient.getQueryData(taskDetailOptions.queryKey)
      const state = queryClient.getQueryState(taskDetailOptions.queryKey)
      setHasCache(cached !== undefined)
      setCachedTitle(cached?.title ?? '无')
      setDetailFetching(state?.fetchStatus === 'fetching')
    }

    syncDetailCache()
    return queryClient.getQueryCache().subscribe(syncDetailCache)
  }, [queryClient])

  /** 进入详情路由，让 Loader 先 await query。 */
  function openDetail(): void {
    void navigate('/tasks/t-1')
  }

  /** 返回列表，保留已经写入的详情缓存。 */
  function backToList(): void {
    void navigate('/')
  }

  /** 重建本次 QueryClient 和内存路由，回到列表入口。 */
  function resetDemo(): void {
    resetDemoSession()
  }

  return (
    <section className="router-query-demo" data-testid="router-query-demo">
      <header className="router-query-header">
        <span>TanStack Query</span>
        <h2>React Router 数据集成</h2>
        <p>打开详情时由 Loader 写入缓存。详情页用同一份 queryOptions 直接读结果。</p>
      </header>

      <div className="router-query-metrics" aria-live="polite">
        <div>
          <span>请求次数</span>
          <strong data-testid="router-query-fetch-count">{fetchCount}</strong>
        </div>
        <div>
          <span>当前路径</span>
          <strong data-testid="router-query-pathname">{location.pathname}</strong>
        </div>
        <div>
          <span>详情已缓存</span>
          <strong data-testid="router-query-has-cache">{hasCache ? '是' : '否'}</strong>
        </div>
        <div>
          <span>缓存标题</span>
          <strong data-testid="router-query-cached-title">{cachedTitle}</strong>
        </div>
        <div>
          <span>导航等待中</span>
          <strong data-testid="router-query-navigating">{navigating ? '是' : '否'}</strong>
        </div>
        <div>
          <span>详情等待中</span>
          <strong data-testid="router-query-pending">{detailFetching ? '是' : '否'}</strong>
        </div>
        <div>
          <span>列表标题</span>
          <strong data-testid="router-query-list-title">
            {firstTask ? firstTask.title : '无'}
          </strong>
        </div>
        <div>
          <span>负责人</span>
          <strong data-testid="router-query-owner">{firstTask ? firstTask.owner : '无'}</strong>
        </div>
      </div>

      <div className="router-query-actions">
        <button type="button" data-kind="primary" disabled={busy} onClick={openDetail}>
          打开详情
        </button>
        <button type="button" disabled={busy} onClick={backToList}>
          返回列表
        </button>
        <button type="button" disabled={busy} onClick={resetDemo}>
          重置
        </button>
      </div>

      <div className="router-query-columns">
        <section className="router-query-card">
          <h3>任务列表</h3>
          {listQuery.isPending ? (
            <p className="router-query-message" role="status">
              正在读取任务。
            </p>
          ) : null}
          {listQuery.isSuccess ? (
            <ul data-testid="router-query-list">
              {tasks.map((task) => (
                <li key={task.id}>
                  {task.title} / {task.owner}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
        <section className="router-query-card">
          <h3>任务详情</h3>
          <Outlet />
        </section>
      </div>
    </section>
  )
}

/** 为一次观察创建独立的 QueryClient 和内存路由。 */
function RouterQuerySession({ onReset }: { onReset: () => void }): ReactElement {
  const [sessionId] = useState(() => {
    const nextSessionId = taskStore.sessionId + 1
    taskStore.sessionId = nextSessionId
    taskStore.fetchCount = 0
    taskStore.onFetchCountChange = undefined
    return nextSessionId
  })
  const [queryClient] = useState(() => new QueryClient())
  const [router] = useState(() => {
    /** 在渲染详情前写入缓存；已有数据时不再挡住导航。 */
    async function taskDetailLoader(): Promise<null> {
      await queryClient.query({
        ...taskDetailOptions,
        staleTime: 'static',
      })
      return null
    }

    const routes = [
      {
        id: 'router-query-root',
        path: '/',
        Component: RouterQueryShell,
        children: [
          { id: 'router-query-list', index: true, Component: TaskDetailIdlePane },
          {
            id: 'router-query-detail',
            path: 'tasks/t-1',
            loader: taskDetailLoader,
            Component: TaskDetailPane,
          },
        ],
      },
    ] satisfies RouteObject[]

    return createMemoryRouter(routes, { initialEntries: ['/'] })
  })
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      queueMicrotask(() => {
        if (!isMounted.current) {
          router.dispose()
          queryClient.clear()
          if (taskStore.sessionId === sessionId) {
            taskStore.fetchCount = 0
            taskStore.onFetchCountChange = undefined
          }
        }
      })
    }
  }, [queryClient, router, sessionId])

  return (
    <DemoResetContext.Provider value={onReset}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </DemoResetContext.Provider>
  )
}

/** 为课程页面注册 React Router 数据集成 Demo。 */
export function createReactRouterQueryIntegrationDemo(): ComponentType {
  /** 把本次 QueryClient 和内存路由交给宿主，重置时整段重挂。 */
  function ReactRouterQueryIntegrationDemoRoot(): ReactElement {
    const [session, setSession] = useState(0)

    /** 丢弃当前会话，重新进入列表入口。 */
    function resetDemoSession(): void {
      setSession((current) => current + 1)
    }

    return <RouterQuerySession key={session} onReset={resetDemoSession} />
  }

  return ReactRouterQueryIntegrationDemoRoot
}
