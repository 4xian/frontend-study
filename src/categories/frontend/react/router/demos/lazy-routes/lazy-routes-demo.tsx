import { useEffect, useSyncExternalStore } from 'react'
import {
  createMemoryRouter,
  Link,
  Outlet,
  useLocation,
  useNavigation,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import type { SettingsData } from './lazy-settings-route'
import './lazy-routes-demo.css'

type LazyEvent = {
  route: string
  status:
    | 'lazy-start'
    | 'lazy-loaded'
    | 'component-start'
    | 'component-loaded'
    | 'error-boundary-start'
    | 'error-boundary-loaded'
    | 'loader-start'
    | 'loader-loaded'
    | 'loader-error'
}

type LazyEventStore = {
  getSnapshot: () => readonly LazyEvent[]
  record: (event: LazyEvent) => void
  subscribe: (listener: () => void) => () => void
}

type DemoShellProps = {
  eventStore: LazyEventStore
}

/** 创建本次 Demo 独享的 lazy 与 loader 事件记录器。 */
function createLazyEventStore(): LazyEventStore {
  let events: readonly LazyEvent[] = []
  const listeners = new Set<() => void>()

  return {
    getSnapshot: () => events,
    record: (event) => {
      events = [...events, event]
      listeners.forEach((listener) => listener())
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

/** 把事件状态转换为观察台中的中文说明。 */
function getEventLabel(status: LazyEvent['status']): string {
  const labels = {
    'lazy-start': '开始解析 route.lazy',
    'lazy-loaded': 'route.lazy 已解析',
    'component-start': 'Component 工厂开始',
    'component-loaded': 'Component 工厂完成',
    'error-boundary-start': 'ErrorBoundary 工厂开始',
    'error-boundary-loaded': 'ErrorBoundary 工厂完成',
    'loader-start': 'loader 开始',
    'loader-loaded': 'loader 返回（提交前）',
    'loader-error': 'loader 抛出错误',
  } satisfies Record<LazyEvent['status'], string>
  return labels[status]
}

/** 展示当前已提交位置与 lazy route 的导航状态。 */
function DemoShell({ eventStore }: DemoShellProps) {
  const location = useLocation()
  const navigation = useNavigation()
  const events = useSyncExternalStore(eventStore.subscribe, eventStore.getSnapshot)

  return (
    <section className="lazy-routes-demo" data-testid="lazy-routes-demo">
      <header className="lazy-routes-header">
        <div>
          <p>React Router Data Mode</p>
          <h2>Lazy 路由观察台</h2>
          <span>只把当前需要的 route 定义加载进来。</span>
        </div>
        <strong data-testid="lazy-routes-navigation-state">{navigation.state}</strong>
      </header>

      <nav className="lazy-routes-nav" aria-label="Lazy 路由页面">
        <Link to="/">工作台</Link>
        <Link to="/reports">质量报告</Link>
        <Link to="/settings">设置中心</Link>
        <Link to="/settings?fail=1">设置错误</Link>
      </nav>

      <div className="lazy-routes-status" role="status" aria-live="polite">
        <span>当前已提交</span>
        <code data-testid="lazy-routes-current-location">{location.pathname}</code>
        <span>加载状态</span>
        <code data-testid="lazy-routes-state">{navigation.state}</code>
      </div>

      <div className="lazy-routes-content" aria-busy={navigation.state !== 'idle'}>
        <Outlet />
      </div>

      <section className="lazy-routes-events" aria-labelledby="lazy-routes-events-title">
        <div className="lazy-routes-section-heading">
          <div>
            <p>Route module timeline</p>
            <h3 id="lazy-routes-events-title">导航观察</h3>
          </div>
          <strong data-testid="lazy-routes-event-count">{events.length}</strong>
        </div>
        <p>事件发生在 location 提交前；提交结果以“当前已提交”路径为准。</p>
        {events.length > 0 ? (
          <ol>
            {events.map((event, index) => (
              <li key={`${event.route}-${index}`}>
                <code>{event.route}</code>
                <span>{getEventLabel(event.status)}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p data-testid="lazy-routes-no-events">还没有触发惰性路由。</p>
        )}
      </section>
    </section>
  )
}

/** 展示不需要额外 route module 的初始页面。 */
function HomePage() {
  return (
    <article className="lazy-routes-card" data-testid="lazy-routes-home">
      <p>Static route</p>
      <h3>交付工作台</h3>
      <span>首页组件已经在初始 route tree 中，打开它不会触发新的 lazy module。</span>
    </article>
  )
}

/** 暂停静态 settings loader，保留 lazy 属性工厂的并行解析窗口。 */
function waitForSettings(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    /** 在导航取消时释放 settings 计时器。 */
    function handleAbort() {
      window.clearTimeout(timer)
      reject(new DOMException('Navigation aborted', 'AbortError'))
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, 800)

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}

/** 返回静态 settings loader 的数据，并提供可观察的错误路径。 */
async function settingsLoader({ request }: LoaderFunctionArgs): Promise<SettingsData> {
  await waitForSettings(request.signal)
  const url = new URL(request.url)

  if (url.searchParams.has('fail')) {
    throw new Response('设置服务暂时不可用', {
      status: 503,
      statusText: 'Settings unavailable',
    })
  }

  return {
    owner: url.searchParams.get('owner') ?? '交付工程组',
    loadedAt: new Date().toISOString(),
  }
}

/** 创建独立内存 Router，确保每次宿主挂载拥有自己的 lazy route 缓存。 */
export function createLazyRoutesDemo() {
  const eventStore = createLazyEventStore()

  /** 把本次记录器注入根 route shell。 */
  function LazyRoutesShell() {
    return <DemoShell eventStore={eventStore} />
  }

  const routes: RouteObject[] = [
    {
      id: 'lazy-routes-root',
      path: '/',
      Component: LazyRoutesShell,
      children: [
        { id: 'lazy-routes-home', index: true, Component: HomePage },
        {
          id: 'lazy-routes-reports',
          path: 'reports',
          lazy: async () => {
            eventStore.record({ route: 'reports', status: 'lazy-start' })
            const module = await import('./lazy-reports-route')
            eventStore.record({ route: 'reports', status: 'lazy-loaded' })
            return {
              Component: module.Component,
              loader: async (args) => {
                eventStore.record({ route: 'reports', status: 'loader-start' })
                const result = await module.loader(args)
                eventStore.record({ route: 'reports', status: 'loader-loaded' })
                return result
              },
            }
          },
        },
        {
          id: 'lazy-routes-settings',
          path: 'settings',
          loader: async (args) => {
            eventStore.record({ route: 'settings', status: 'loader-start' })
            try {
              const result = await settingsLoader(args)
              eventStore.record({ route: 'settings', status: 'loader-loaded' })
              return result
            } catch (error) {
              eventStore.record({ route: 'settings', status: 'loader-error' })
              throw error
            }
          },
          lazy: {
            Component: async () => {
              eventStore.record({ route: 'settings', status: 'component-start' })
              const module = await import('./lazy-settings-route')
              eventStore.record({ route: 'settings', status: 'component-loaded' })
              return module.Component
            },
            ErrorBoundary: async () => {
              eventStore.record({ route: 'settings', status: 'error-boundary-start' })
              const module = await import('./lazy-settings-route')
              eventStore.record({ route: 'settings', status: 'error-boundary-loaded' })
              return module.ErrorBoundary
            },
          },
        },
      ],
    },
  ]

  const router = createMemoryRouter(routes, { initialEntries: ['/'] })

  return function LazyRoutesDemo() {
    useEffect(() => () => router.dispose(), [router])
    return <RouterProvider router={router} />
  }
}
