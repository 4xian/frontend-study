import { useEffect, useSyncExternalStore, type ComponentType, type ReactElement } from 'react'
import {
  createMemoryRouter,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigation,
  type LoaderFunctionArgs,
  type PatchRoutesOnNavigationFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './dynamic-route-discovery-demo.css'

type DiscoveryEvent = {
  id: number
  kind: 'callback' | 'patch' | 'loader' | 'cancel'
  text: string
}

type DiscoveryEventStore = {
  add: (kind: DiscoveryEvent['kind'], text: string) => void
  clear: () => void
  getSnapshot: () => readonly DiscoveryEvent[]
  subscribe: (listener: () => void) => () => void
}

type WorkspacePageDefinition = {
  key: string
  label: string
  description: string
  discoveryDelay: number
}

type WorkspacePageData = {
  label: string
  description: string
  loadedAt: string
}

/** 创建可订阅的发现事件记录器，供观察台展示 Router 生命周期。 */
function createDiscoveryEventStore(): DiscoveryEventStore {
  let nextId = 1
  let events: readonly DiscoveryEvent[] = []
  const listeners = new Set<() => void>()

  return {
    /** 添加一条发现、补丁、loader 或缓存事件。 */
    add(kind, text) {
      events = [...events, { id: nextId, kind, text }]
      nextId += 1
      listeners.forEach((listener) => listener())
    },
    /** 清空事件并从 1 重新编号。 */
    clear() {
      events = []
      nextId = 1
      listeners.forEach((listener) => listener())
    },
    /** 返回不可变事件快照。 */
    getSnapshot() {
      return events
    },
    /** 注册快照监听器，并返回卸载时的取消订阅函数。 */
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

/** 等待一段可取消的发现工作，让导航取消行为可以被观察。 */
function waitForDiscovery(signal: AbortSignal, milliseconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, milliseconds)

    /** 取消等待并释放计时器。 */
    function abort(): void {
      window.clearTimeout(timer)
      signal.removeEventListener('abort', abort)
      reject(new DOMException('Discovery aborted', 'AbortError'))
    }

    if (signal.aborted) {
      abort()
      return
    }
    signal.addEventListener('abort', abort, { once: true })
  })
}

/** 根据目标路径选择要动态加入的工作区页面。 */
function getWorkspacePage(path: string): WorkspacePageDefinition | undefined {
  const key = path.split('/').filter(Boolean).at(-1)
  return [
    {
      key: 'analytics',
      label: '分析面板',
      description: '展示租户级指标与趋势。',
      discoveryDelay: 240,
    },
    {
      key: 'reports',
      label: '报告中心',
      description: '展示可下载的运营报告。',
      discoveryDelay: 320,
    },
    {
      key: 'slow',
      label: '慢速插件页',
      description: '模拟一个需要更长时间才能返回的插件路由。',
      discoveryDelay: 900,
    },
  ].find((page) => page.key === key)
}

/** 创建动态页面的 loader，并记录它确实在路由补丁后执行。 */
function createWorkspaceLoader(
  eventStore: DiscoveryEventStore,
  page: WorkspacePageDefinition,
): (args: LoaderFunctionArgs) => Promise<WorkspacePageData> {
  return async function workspaceLoader({ request }): Promise<WorkspacePageData> {
    eventStore.add('loader', `${page.label} loader 开始`)
    await waitForDiscovery(request.signal, 140)
    eventStore.add('loader', `${page.label} loader 返回`)
    return {
      label: page.label,
      description: page.description,
      loadedAt: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
    }
  }
}

/** 渲染动态页面，并读取由 Data Router loader 返回的数据。 */
function WorkspacePage(): ReactElement {
  const data = useLoaderData() as WorkspacePageData

  return (
    <article className="discovery-page" data-testid="discovered-page">
      <p className="discovery-eyebrow">已发现并提交</p>
      <h3>{data.label}</h3>
      <p>{data.description}</p>
      <dl className="discovery-page-data">
        <div>
          <dt>loader</dt>
          <dd>已完成</dd>
        </div>
        <div>
          <dt>读取时间</dt>
          <dd>{data.loadedAt}</dd>
        </div>
      </dl>
    </article>
  )
}

/** 渲染已发现工作区的布局，并保留子路由出口。 */
function WorkspaceLayout(): ReactElement {
  return (
    <section className="discovery-workspace">
      <div className="discovery-workspace-heading">
        <div>
          <p className="discovery-eyebrow">第二层 route</p>
          <h3>工作区路由已发现</h3>
        </div>
        <Link className="discovery-secondary-link" data-testid="discovery-home-link" to="/">
          返回首页
        </Link>
      </div>
      <Outlet />
    </section>
  )
}

/** 渲染初始静态首页，链接目标由 patchRoutesOnNavigation 动态补充。 */
function DiscoveryHome(): ReactElement {
  return (
    <section className="discovery-home">
      <p className="discovery-eyebrow">初始 route tree</p>
      <h3>应用首页</h3>
      <p>此时 Router 只知道应用壳和首页，工作区页面尚未加入路由树。</p>
      <nav className="discovery-links" aria-label="动态工作区页面">
        <Link data-testid="discovery-link-analytics" to="/workspace/analytics">
          打开分析面板
        </Link>
        <Link data-testid="discovery-link-reports" to="/workspace/reports">
          打开报告中心
        </Link>
        <Link data-testid="discovery-link-slow" to="/workspace/slow">
          打开慢速插件页
        </Link>
      </nav>
    </section>
  )
}

/** 渲染导航状态、当前位置和发现事件，帮助对照 Router 的提交时机。 */
function DiscoveryShell({ eventStore }: { eventStore: DiscoveryEventStore }): ReactElement {
  const location = useLocation()
  const navigation = useNavigation()
  const events = useSyncExternalStore(eventStore.subscribe, eventStore.getSnapshot)

  return (
    <section className="dynamic-route-discovery-demo" data-testid="dynamic-route-discovery-demo">
      <header className="discovery-header">
        <div>
          <p className="discovery-eyebrow">React Router Data Mode</p>
          <h2>动态路由发现观察台</h2>
          <p>观察 patchRoutesOnNavigation 如何把未知页面分层加入当前 route tree。</p>
        </div>
        <div className="discovery-header-actions">
          <span className="discovery-status" data-testid="discovery-navigation-state">
            navigation：{navigation.state}
          </span>
          <Link className="discovery-header-home" data-testid="discovery-abort-home-link" to="/">
            首页
          </Link>
        </div>
      </header>

      <section className="discovery-contract" aria-label="动态发现状态">
        <article>
          <span>已提交 location</span>
          <strong data-testid="discovery-location">{location.pathname}</strong>
          <small>loading 时仍保留旧页面</small>
        </article>
        <article>
          <span>发现事件</span>
          <strong data-testid="discovery-event-count">{events.length}</strong>
          <small>回调、补丁与 loader 都来自同一 Router</small>
        </article>
        <article>
          <span>当前策略</span>
          <strong>部分匹配 + 分层 patch</strong>
          <small>完成后才提交目标页面</small>
        </article>
      </section>

      <div className="discovery-content">
        <main className="discovery-main-panel">
          <Outlet />
        </main>
        <aside className="discovery-events" aria-label="动态发现事件">
          <div className="discovery-events-heading">
            <h3>事件记录</h3>
            <button type="button" onClick={eventStore.clear}>
              清空
            </button>
          </div>
          {events.length > 0 ? (
            <ol data-testid="discovery-log">
              {events.map((event) => (
                <li key={event.id} data-kind={event.kind}>
                  <span>#{event.id}</span>
                  <p>{event.text}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="discovery-empty">点击一个工作区链接开始发现。</p>
          )}
        </aside>
      </div>
    </section>
  )
}

/** 提供给根 route 的稳定布局组件，绑定本次 Demo 独享的事件记录器。 */
function createDiscoveryRootLayout(eventStore: DiscoveryEventStore): () => ReactElement {
  return function DiscoveryRootLayout(): ReactElement {
    return <DiscoveryShell eventStore={eventStore} />
  }
}

/** 创建本次 Demo 独享的事件记录器、动态发现回调和内存 Router。 */
export function createDynamicRouteDiscoveryDemo(): ComponentType {
  const eventStore = createDiscoveryEventStore()
  const discoveredPages = new Set<string>()
  let workspaceDiscovered = false
  let callbackCount = 0

  /** 在导航期间按部分匹配增量补充工作区与页面 route objects。 */
  const patchRoutesOnNavigation = async ({
    path,
    matches,
    patch,
    signal,
  }: PatchRoutesOnNavigationFunctionArgs): Promise<void> => {
    callbackCount += 1
    const leafId = matches.at(-1)?.route.id ?? 'none'
    eventStore.add('callback', `发现回调 #${callbackCount}：path=${path}，leaf=${leafId}`)

    if (!workspaceDiscovered && path.startsWith('/workspace/')) {
      try {
        await waitForDiscovery(signal, 220)
        if (signal.aborted) return
        patch('app-root', [
          {
            id: 'workspace',
            path: 'workspace',
            Component: WorkspaceLayout,
          },
        ])
        workspaceDiscovered = true
        eventStore.add('patch', 'patch("app-root")：加入 workspace 父级')
      } catch (error) {
        if (signal.aborted) {
          eventStore.add('cancel', 'workspace 发现已被后续导航取消')
          return
        }
        throw error
      }
    }

    const page = getWorkspacePage(path)
    const currentLeafId = matches.at(-1)?.route.id
    if (!page || currentLeafId !== 'workspace' || discoveredPages.has(page.key)) {
      return
    }

    try {
      await waitForDiscovery(signal, page.discoveryDelay)
      if (signal.aborted) return
      const pageRoute: RouteObject = {
        id: `workspace-${page.key}`,
        path: page.key,
        loader: createWorkspaceLoader(eventStore, page),
        Component: WorkspacePage,
      }
      patch('workspace', [pageRoute])
      discoveredPages.add(page.key)
      eventStore.add('patch', `patch("workspace")：加入 ${page.label}`)
    } catch (error) {
      if (signal.aborted) {
        eventStore.add('cancel', `${page.label} 发现已取消，未提交 patch`)
        return
      }
      throw error
    }
  }

  const routes: RouteObject[] = [
    {
      id: 'app-root',
      path: '/',
      Component: createDiscoveryRootLayout(eventStore),
      children: [{ id: 'app-home', index: true, Component: DiscoveryHome }],
    },
  ]

  const router = createMemoryRouter(routes, {
    initialEntries: ['/'],
    patchRoutesOnNavigation,
  })

  return function DynamicRouteDiscoveryDemo(): ReactElement {
    useEffect(() => {
      return () => {
        router.dispose()
        eventStore.clear()
      }
    }, [])

    return <RouterProvider router={router} />
  }
}
