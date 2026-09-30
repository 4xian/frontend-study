import { useEffect, useRef, useState, type ComponentType } from 'react'
import {
  createMemoryRouter,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './route-state-ownership-demo.css'

type StatusFilter = 'all' | 'open' | 'done'

type Task = {
  id: string
  title: string
  status: Exclude<StatusFilter, 'all'>
  owner: string
}

type WorkspaceData = {
  filter: StatusFilter
  tasks: Task[]
}

type PreviewData = {
  taskId: string
  summary: string
}

const filters: readonly { id: StatusFilter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'open', label: '进行中' },
  { id: 'done', label: '已完成' },
]

const tasks: readonly Task[] = [
  { id: 'plan', title: '确认路由状态边界', status: 'open', owner: '林然' },
  { id: 'demo', title: '制作可观察 Demo', status: 'open', owner: '周明' },
  { id: 'review', title: '复核学习目标', status: 'done', owner: '方宁' },
]

/** 从 URLSearchParams 读取受支持的筛选值，并为无效输入提供确定默认值。 */
function readStatusFilter(searchParams: URLSearchParams): StatusFilter {
  const status = searchParams.get('status')
  return status === 'open' || status === 'done' ? status : 'all'
}

/** 从当前请求地址读取 URL 所有者保存的筛选条件。 */
function readRequestFilter(request: Request): StatusFilter {
  return readStatusFilter(new URL(request.url).searchParams)
}

/** 等待可取消的短暂 loader 工作，让导航与 Fetcher 的作用范围可以观察。 */
function waitForRequest(signal: AbortSignal, milliseconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, milliseconds)

    /** 在 Router 取消请求时释放 Demo 计时器。 */
    function abort(): void {
      window.clearTimeout(timer)
      signal.removeEventListener('abort', abort)
      reject(new DOMException('Request aborted', 'AbortError'))
    }

    if (signal.aborted) {
      abort()
      return
    }
    signal.addEventListener('abort', abort, { once: true })
  })
}

/** 根据 URL 筛选返回当前页面已确认的任务快照。 */
async function workspaceLoader({ request }: LoaderFunctionArgs): Promise<WorkspaceData> {
  const filter = readRequestFilter(request)
  await waitForRequest(request.signal, 260)
  return {
    filter,
    tasks: tasks.filter((task) => filter === 'all' || task.status === filter),
  }
}

/** 返回局部预览 Fetcher 的结果，不改变页面 URL 或任务列表快照。 */
async function previewLoader({ request }: LoaderFunctionArgs): Promise<PreviewData> {
  const taskId = new URL(request.url).searchParams.get('taskId')
  const task = tasks.find((item) => item.id === taskId)
  if (!task) throw new Response('Not Found', { status: 404 })

  await waitForRequest(request.signal, 420)
  return {
    taskId: task.id,
    summary: `${task.title}由${task.owner}负责，当前状态为${task.status === 'open' ? '进行中' : '已完成'}。`,
  }
}

/** 返回指定筛选值的可读名称。 */
function getFilterLabel(filter: StatusFilter): string {
  return filters.find((item) => item.id === filter)?.label ?? '全部'
}

/** 展示每类状态的真实所有者，并提供可重复操作入口。 */
function OwnershipWorkspace() {
  const data = useLoaderData<typeof workspaceLoader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const preview = useFetcher<typeof previewLoader>()
  const [isInspectorOpen, setInspectorOpen] = useState(false)
  const urlFilter = readStatusFilter(searchParams)
  const pendingFilter = navigation.location
    ? readStatusFilter(new URLSearchParams(navigation.location.search))
    : null

  /** 只更新 URL 状态，让 Router 导航并重新读取本页 loader 数据。 */
  function selectFilter(filter: StatusFilter): void {
    const nextSearchParams = new URLSearchParams(searchParams)
    if (filter === 'all') {
      nextSearchParams.delete('status')
    } else {
      nextSearchParams.set('status', filter)
    }
    setSearchParams(nextSearchParams)
  }

  /** 通过局部 Fetcher 读取任务预览，避免改变当前路由地址。 */
  function loadPreview(taskId: string): void {
    preview.load(`/ownership-preview?taskId=${encodeURIComponent(taskId)}`)
  }

  /** 切换只在当前组件生命周期内存在的检查器 UI。 */
  function toggleInspector(): void {
    setInspectorOpen((open) => !open)
  }

  return (
    <section className="route-state-ownership-demo" data-testid="route-state-ownership-demo">
      <header className="ownership-header">
        <div>
          <p className="ownership-eyebrow">React Router Data Mode</p>
          <h2>状态所有权工作台</h2>
          <p>让 URL、页面 loader、导航、Fetcher 和局部 UI 各自保存自己负责的状态。</p>
        </div>
        <button type="button" className="ownership-inspector-toggle" onClick={toggleInspector}>
          {isInspectorOpen ? '关闭检查器' : '打开检查器'}
        </button>
      </header>

      <section className="ownership-cards" aria-label="当前状态所有者">
        <article>
          <span>URL 状态</span>
          <strong data-testid="ownership-url">?status={searchParams.get('status') ?? 'all'}</strong>
          <small>可复制、刷新和前进后退</small>
        </article>
        <article>
          <span>Loader data</span>
          <strong data-testid="ownership-loader">{data.tasks.length} 项任务</strong>
          <small>当前路由已确认的事实</small>
        </article>
        <article>
          <span>Navigation</span>
          <strong data-testid="ownership-navigation">{navigation.state}</strong>
          <small>
            {pendingFilter ? `正在前往 ${getFilterLabel(pendingFilter)}` : '没有页面导航'}
          </small>
        </article>
        <article>
          <span>Preview Fetcher</span>
          <strong data-testid="ownership-fetcher">{preview.state}</strong>
          <small>不改变 URL 的局部读取</small>
        </article>
        <article>
          <span>Local UI state</span>
          <strong data-testid="ownership-local">
            {isInspectorOpen ? '检查器已打开' : '检查器已关闭'}
          </strong>
          <small>只在当前组件存活</small>
        </article>
      </section>

      <section className="ownership-workspace">
        <div className="ownership-main">
          <div className="ownership-section-heading">
            <div>
              <p className="ownership-eyebrow">URL drives loader</p>
              <h3>任务筛选</h3>
            </div>
            <span>loader 当前读取：{getFilterLabel(data.filter)}</span>
          </div>
          <div className="ownership-filter-buttons" aria-label="任务筛选">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={urlFilter === filter.id}
                onClick={() => selectFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <ul className="ownership-task-list">
            {data.tasks.map((task) => (
              <li key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.owner}</span>
                </div>
                <div>
                  <span className={`ownership-status ownership-status-${task.status}`}>
                    {task.status === 'open' ? '进行中' : '已完成'}
                  </span>
                  <button type="button" onClick={() => loadPreview(task.id)}>
                    读取局部预览
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="ownership-preview" aria-live="polite">
          <p className="ownership-eyebrow">Fetcher-owned result</p>
          <h3>局部预览</h3>
          {preview.state !== 'idle' ? <p>Fetcher 正在读取预览，页面地址和任务列表不变。</p> : null}
          {preview.data ? <p>{preview.data.summary}</p> : <p>选择一项任务读取预览。</p>}
        </aside>
      </section>

      {isInspectorOpen ? (
        <section className="ownership-inspector" aria-live="polite">
          <p className="ownership-eyebrow">Local component state</p>
          <h3>检查器没有进入 URL</h3>
          <p>切换筛选时它仍是当前组件的状态；刷新或离开此组件后，它会回到初始值。</p>
        </section>
      ) : null}

      <p className="ownership-note">
        任务列表只由 loader data 渲染，预览 Fetcher
        的数据只显示在预览区域，不会成为页面列表的新副本。
      </p>
    </section>
  )
}

/** 把内存 Router 的查询状态写入当前浏览器地址，并保留宿主的页面路径。 */
function syncBrowserSearch(search: string): void {
  if (window.location.search === search) return
  const url = new URL(window.location.href)
  url.search = search
  window.history.pushState(window.history.state, '', url)
}

/** 为一个状态所有权工作台创建独立的内存 Router，并与浏览器历史同步 URL 状态。 */
function createOwnershipRouter() {
  const routes: RouteObject[] = [
    {
      path: '/ownership',
      loader: workspaceLoader,
      Component: OwnershipWorkspace,
    },
    {
      path: '/ownership-preview',
      loader: previewLoader,
    },
  ]
  const router = createMemoryRouter(routes, {
    initialEntries: [`/ownership${window.location.search}`],
  })

  /** 在浏览器前进或后退时，让内存 Router 按当前查询状态重新读取 loader。 */
  function restoreBrowserSearch(): void {
    if (router.state.location.search === window.location.search) return
    void router.navigate({ pathname: '/ownership', search: window.location.search })
  }

  const unsubscribe = router.subscribe((state) => {
    syncBrowserSearch(state.navigation.location?.search ?? state.location.search)
  })
  window.addEventListener('popstate', restoreBrowserSearch)

  return {
    router,
    /** 释放当前 Demo 对 Router 与浏览器历史的订阅。 */
    dispose(): void {
      unsubscribe()
      window.removeEventListener('popstate', restoreBrowserSearch)
      router.dispose()
    },
  }
}

/** 为每次 Demo 挂载创建独立的内存 Router，隔离 URL 与请求状态。 */
export function createRouteStateOwnershipDemo(): ComponentType {
  /** 将 Router 绑定到当前 React 组件实例，避免跨挂载复用已释放的资源。 */
  function RouteStateOwnershipDemo() {
    const routerRef = useRef<ReturnType<typeof createOwnershipRouter> | null>(null)
    const disposeTimerRef = useRef<number | null>(null)
    if (!routerRef.current) routerRef.current = createOwnershipRouter()
    const ownershipRouter = routerRef.current

    /** 在真实卸载后释放 Router，同时兼容 Strict Mode 对 effect 的重复执行。 */
    useEffect(() => {
      if (disposeTimerRef.current !== null) {
        window.clearTimeout(disposeTimerRef.current)
        disposeTimerRef.current = null
      }
      return () => {
        disposeTimerRef.current = window.setTimeout(() => ownershipRouter.dispose(), 0)
      }
    }, [ownershipRouter])

    return <RouterProvider router={ownershipRouter.router} />
  }

  return RouteStateOwnershipDemo
}
