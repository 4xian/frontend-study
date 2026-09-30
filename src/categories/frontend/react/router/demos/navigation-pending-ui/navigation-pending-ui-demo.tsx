import { type ComponentType, useEffect, useRef } from 'react'
import {
  createMemoryRouter,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigation,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './navigation-pending-ui-demo.css'

const navigationItems = [
  { to: '/', label: '工作台', description: '即时进入' },
  { to: '/reports', label: '质量报告', description: '等待 loader' },
  { to: '/releases', label: '发布记录', description: '等待 loader' },
] as const

/** 提供可取消的短暂延时，为 Demo 留出可观察的 loading 窗口。 */
function waitForLoader(signal: AbortSignal, delay: number): Promise<void> {
  return new Promise((resolve, reject) => {
    /** 在路由请求被取消时释放计时器。 */
    function handleAbort() {
      window.clearTimeout(timer)
      reject(new DOMException('Navigation aborted', 'AbortError'))
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, delay)

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}

/** 返回质量报告数据。 */
async function reportsLoader({ request }: LoaderFunctionArgs) {
  await waitForLoader(request.signal, 950)
  return {
    score: 94,
    passedChecks: 18,
    attentionItems: 2,
  }
}

/** 返回发布记录数据。 */
async function releasesLoader({ request }: LoaderFunctionArgs) {
  await waitForLoader(request.signal, 1150)
  return {
    version: '2026.08.20',
    environment: '预发布',
    owner: '交付工程组',
  }
}

/** 根据内存路由目标返回可读名称。 */
function getTargetLabel(pathname: string | undefined): string {
  return navigationItems.find((item) => item.to === pathname)?.label ?? pathname ?? '无'
}

/** 同时呈现全局导航状态、局部目标反馈与已提交页面。 */
function PendingNavigationShell() {
  const location = useLocation()
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'
  const pendingPathname = navigation.location?.pathname

  return (
    <section className="pending-navigation-demo" data-testid="pending-navigation-demo">
      <header className="pending-navigation-heading">
        <div>
          <p>useNavigation observer</p>
          <h2>导航等待观察台</h2>
          <span>当目标 loader 运行时，已提交页面保持可见。</span>
        </div>
        <strong data-testid="pending-navigation-state">{navigation.state}</strong>
      </header>

      <nav className="pending-navigation-links" aria-label="Pending UI Demo 导航">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive, isPending }) =>
              isPending ? 'is-pending' : isActive ? 'is-current' : undefined
            }
            data-testid={`pending-navigation-link-${item.to === '/' ? 'home' : item.to.slice(1)}`}
            end={item.to === '/'}
            to={item.to}
          >
            {({ isActive, isPending }) => (
              <>
                <span>{item.label}</span>
                <small
                  data-testid={`pending-navigation-link-status-${item.to === '/' ? 'home' : item.to.slice(1)}`}
                >
                  {isPending ? '正在前往' : isActive ? '当前页面' : item.description}
                </small>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        className={isLoading ? 'pending-navigation-status is-loading' : 'pending-navigation-status'}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="pending-navigation-status-bar" aria-hidden="true">
          <span />
        </span>
        <div>
          <strong data-testid="pending-navigation-message">
            {isLoading ? `正在加载${getTargetLabel(pendingPathname)}` : '导航空闲'}
          </strong>
          <small>{isLoading ? '保留当前内容，等待目标数据' : '可以选择另一个页面'}</small>
        </div>
      </div>

      <dl className="pending-navigation-observer" aria-label="导航位置对照">
        <div>
          <dt>当前已提交 location</dt>
          <dd>
            <code data-testid="pending-navigation-current-location">{location.pathname}</code>
          </dd>
        </div>
        <div>
          <dt>正在前往 location</dt>
          <dd>
            <code data-testid="pending-navigation-target-location">{pendingPathname ?? '无'}</code>
          </dd>
        </div>
      </dl>

      <div
        className="pending-navigation-outlet"
        data-testid="pending-navigation-outlet"
        aria-busy={isLoading}
      >
        <Outlet />
      </div>
    </section>
  )
}

/** 展示无需等待 loader 的已提交首页。 */
function WorkspacePage() {
  return (
    <article className="pending-navigation-page" data-testid="pending-navigation-page-workspace">
      <p>Committed page</p>
      <h3>交付工作台</h3>
      <span>当其他 route 还在加载时，这个已提交页面不会立即消失。</span>
      <dl>
        <div>
          <dt>进行中发布</dt>
          <dd>3</dd>
        </div>
        <div>
          <dt>待处理检查</dt>
          <dd>2</dd>
        </div>
      </dl>
    </article>
  )
}

/** 读取已完成的质量报告 loader data。 */
function ReportsPage() {
  const report = useLoaderData<typeof reportsLoader>()

  return (
    <article className="pending-navigation-page" data-testid="pending-navigation-page-reports">
      <p>Loader committed</p>
      <h3>质量报告</h3>
      <span>只有 loader 完成后，Router 才提交这个新页面。</span>
      <dl>
        <div>
          <dt>质量分</dt>
          <dd>{report.score}</dd>
        </div>
        <div>
          <dt>通过检查</dt>
          <dd>{report.passedChecks}</dd>
        </div>
        <div>
          <dt>需要关注</dt>
          <dd>{report.attentionItems}</dd>
        </div>
      </dl>
    </article>
  )
}

/** 读取已完成的发布记录 loader data。 */
function ReleasesPage() {
  const release = useLoaderData<typeof releasesLoader>()

  return (
    <article className="pending-navigation-page" data-testid="pending-navigation-page-releases">
      <p>Loader committed</p>
      <h3>发布记录</h3>
      <span>加载期间的目标来自 navigation.location，不是当前 location。</span>
      <dl>
        <div>
          <dt>版本</dt>
          <dd>{release.version}</dd>
        </div>
        <div>
          <dt>环境</dt>
          <dd>{release.environment}</dd>
        </div>
        <div>
          <dt>负责人</dt>
          <dd>{release.owner}</dd>
        </div>
      </dl>
    </article>
  )
}

/** 为每次宿主挂载创建独立的 Pending UI 内存路由 Demo。 */
export function createNavigationPendingUiDemo(): ComponentType {
  const routes: RouteObject[] = [
    {
      id: 'pending-navigation-root',
      path: '/',
      Component: PendingNavigationShell,
      children: [
        { id: 'pending-navigation-workspace', index: true, Component: WorkspacePage },
        {
          id: 'pending-navigation-reports',
          path: 'reports',
          loader: reportsLoader,
          Component: ReportsPage,
        },
        {
          id: 'pending-navigation-releases',
          path: 'releases',
          loader: releasesLoader,
          Component: ReleasesPage,
        },
      ],
    },
  ]
  const router = createMemoryRouter(routes, { initialEntries: ['/'] })

  /** 把本次创建的 Router 交给 Provider，并在宿主卸载后释放。 */
  function NavigationPendingUiDemo() {
    const isMounted = useRef(false)

    useEffect(() => {
      isMounted.current = true

      return () => {
        isMounted.current = false

        // StrictMode 会立即重跑 effect；真实卸载后才释放本次 Router。
        queueMicrotask(() => {
          if (!isMounted.current) router.dispose()
        })
      }
    }, [])

    return <RouterProvider router={router} />
  }

  return NavigationPendingUiDemo
}
