import { type ComponentType, type MouseEvent, useEffect } from 'react'
import {
  Form,
  NavLink,
  Outlet,
  createMemoryRouter,
  data,
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
  useRevalidator,
  useRouteError,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './route-error-boundary-demo.css'

type ReportData = {
  id: string
  title: string
  owner: string
  status: string
  loaderCalls: number
}

type ErrorPayload = {
  source: 'loader' | 'action'
  message: string
}

type ErrorDetails = {
  kind: 'RouteErrorResponse' | 'Error' | 'Unknown'
  source: string
  message: string
  status?: number
  statusText?: string
}

type RouteErrorPanelProps = {
  scope: '报告局部边界' | '工作区根边界'
  recoveryPath: string
  recoveryLabel: string
  fallbackSource: 'loader' | 'render'
}

const reportNavigation = [
  { to: '/workspace', label: '安全首页', end: true },
  { to: '/workspace/reports/weekly', label: '正常报告' },
  { to: '/workspace/reports/missing', label: '缺失报告' },
  { to: '/workspace/reports/unstable', label: '不稳定报告' },
  { to: '/workspace/settings', label: '根级错误' },
] as const

/** 提供可取消的观察延时，并在请求中止时释放计时器。 */
function waitForRequest(signal: AbortSignal, delay: number): Promise<void> {
  return new Promise((resolve, reject) => {
    /** 结束已经取消的延时任务。 */
    function handleAbort() {
      window.clearTimeout(timer)
      reject(new DOMException('Request aborted', 'AbortError'))
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, delay)

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}

/** 判断 route response data 是否符合本 Demo 的最小错误数据合同。 */
function isErrorPayload(value: unknown): value is ErrorPayload {
  if (!value || typeof value !== 'object') return false
  const payload = value as Partial<ErrorPayload>
  return (
    (payload.source === 'loader' || payload.source === 'action') &&
    typeof payload.message === 'string'
  )
}

/** 把 unknown route error 收窄为界面可以稳定展示的三类结果。 */
function describeRouteError(error: unknown, fallbackSource: string): ErrorDetails {
  if (isRouteErrorResponse(error)) {
    const payload = isErrorPayload(error.data) ? error.data : undefined
    return {
      kind: 'RouteErrorResponse',
      source: payload?.source ?? fallbackSource,
      message: payload?.message ?? '请求无法完成。',
      status: error.status,
      statusText: error.statusText,
    }
  }

  if (error instanceof Error) {
    return {
      kind: 'Error',
      source: fallbackSource,
      message: error.message,
    }
  }

  return {
    kind: 'Unknown',
    source: fallbackSource,
    message: '发生了无法识别的 route 错误。',
  }
}

/** 为每次宿主挂载创建独立的 route 错误模型与内存路由。 */
export function createRouteErrorBoundaryDemo(): ComponentType {
  let reportLoaderCalls = 0
  let reportActionCalls = 0
  let unstableLoaderAttempts = 0

  /** 恢复 loader、action 与不稳定请求计数。 */
  function resetModel() {
    reportLoaderCalls = 0
    reportActionCalls = 0
    unstableLoaderAttempts = 0
  }

  /** 返回报告数据，或为缺失和短暂故障抛出不同类型的 route error。 */
  async function reportLoader({ params, request }: LoaderFunctionArgs): Promise<ReportData> {
    reportLoaderCalls += 1
    const reportId = params.reportId ?? 'weekly'

    if (reportId === 'missing') {
      throw data<ErrorPayload>(
        { source: 'loader', message: '报告不存在，无法继续渲染详情。' },
        { status: 404, statusText: 'Not Found' },
      )
    }

    if (reportId === 'unstable') {
      unstableLoaderAttempts += 1
      await waitForRequest(request.signal, 520)
      if (unstableLoaderAttempts === 1) throw new Error('报告服务暂不可用')
    }

    return {
      id: reportId,
      title: reportId === 'unstable' ? '恢复后的月度报告' : '团队周报',
      owner: '内容平台组',
      status: reportId === 'unstable' ? '重试成功' : '已发布',
      loaderCalls: reportLoaderCalls,
    }
  }

  /** 模拟无法继续当前页面流程的报告归档冲突。 */
  async function reportAction({ request }: ActionFunctionArgs) {
    reportActionCalls += 1
    const formData = await request.formData()

    if (formData.get('intent') === 'archive') {
      throw data<ErrorPayload>(
        { source: 'action', message: '报告已归档，当前保存请求不能继续。' },
        { status: 409, statusText: 'Conflict' },
      )
    }

    return { ok: true }
  }

  /** 模拟没有局部边界的设置 route loader 故障。 */
  function settingsLoader() {
    throw new Error('设置服务暂不可用')
  }

  /** 返回安全首页并清空本 Demo 的所有可变计数。 */
  function handleResetDemo() {
    resetModel()
    void router.navigate('/workspace', { replace: true })
  }

  /** 呈现 route error 类型、归属边界与可执行恢复动作。 */
  function RouteErrorPanel({
    scope,
    recoveryPath,
    recoveryLabel,
    fallbackSource,
  }: RouteErrorPanelProps) {
    const error = useRouteError()
    const location = useLocation()
    const navigate = useNavigate()
    const revalidator = useRevalidator()
    const details = describeRouteError(error, fallbackSource)
    const isRetrying = revalidator.state === 'loading'
    const canRetryLoader =
      scope === '报告局部边界' &&
      location.pathname.endsWith('/unstable') &&
      details.kind === 'Error'

    /** 重新执行当前 location 的 loader，不重放失败 action。 */
    function handleRetryLoader() {
      void revalidator.revalidate()
    }

    /** 离开错误 location，返回已知可以成功渲染的 route。 */
    function handleRecoveryNavigation() {
      void navigate(recoveryPath)
    }

    return (
      <section className="route-error-boundary-panel" role="alert" aria-busy={isRetrying}>
        <div className="route-error-boundary-panel-heading">
          <div>
            <p>Nearest route boundary</p>
            <h3>当前分支已由错误界面接管</h3>
          </div>
          <strong data-testid="route-error-boundary-scope">{scope}</strong>
        </div>

        <dl className="route-error-boundary-error-details">
          <div>
            <dt>error kind</dt>
            <dd data-testid="route-error-boundary-kind">{details.kind}</dd>
          </div>
          <div>
            <dt>source</dt>
            <dd data-testid="route-error-boundary-source">{details.source}</dd>
          </div>
          <div>
            <dt>status</dt>
            <dd data-testid="route-error-boundary-status">
              {details.status ? `${details.status} ${details.statusText}` : '不适用'}
            </dd>
          </div>
          <div>
            <dt>location</dt>
            <dd data-testid="route-error-boundary-error-location">{location.pathname}</dd>
          </div>
        </dl>

        <p className="route-error-boundary-message" data-testid="route-error-boundary-message">
          {details.message}
        </p>
        <p className="route-error-boundary-retry-state">
          revalidator:{' '}
          <strong data-testid="route-error-boundary-revalidator-state">{revalidator.state}</strong>
        </p>

        <div className="route-error-boundary-actions">
          {canRetryLoader ? (
            <button type="button" onClick={handleRetryLoader} disabled={isRetrying}>
              {isRetrying ? '重试加载中' : '重试当前 loader'}
            </button>
          ) : null}
          <button type="button" onClick={handleRecoveryNavigation} disabled={isRetrying}>
            {recoveryLabel}
          </button>
        </div>
      </section>
    )
  }

  /** 处理报告 route 自身及其后代冒泡来的错误。 */
  function ReportRouteErrorBoundary() {
    return (
      <RouteErrorPanel
        scope="报告局部边界"
        recoveryPath="/workspace/reports/weekly"
        recoveryLabel="返回正常报告"
        fallbackSource="loader"
      />
    )
  }

  /** 处理没有更近自定义边界时冒泡到根 route 的错误。 */
  function RootRouteErrorBoundary() {
    return (
      <div className="route-error-boundary-root-fallback">
        <RouteErrorPanel
          scope="工作区根边界"
          recoveryPath="/workspace"
          recoveryLabel="返回安全首页"
          fallbackSource="loader"
        />
      </div>
    )
  }

  /** 呈现始终安全的工作区首页。 */
  function WorkspaceHome() {
    return (
      <section className="route-error-boundary-home" data-testid="route-error-boundary-home">
        <p>Safe route</p>
        <h3>报告工作区已就绪</h3>
        <span>从上方入口触发局部错误或根级冒泡，再比较哪些祖先界面仍然保留。</span>
      </section>
    )
  }

  /** 呈现 loader 成功后的报告内容与 action 冲突入口。 */
  function ReportPage() {
    const report = useLoaderData<typeof reportLoader>()
    const navigation = useNavigation()
    const isSubmitting = navigation.state !== 'idle'

    return (
      <section className="route-error-boundary-report" data-testid="route-error-boundary-report">
        <div className="route-error-boundary-report-heading">
          <div>
            <p>Report route</p>
            <h3>{report.title}</h3>
          </div>
          <strong>{report.status}</strong>
        </div>

        <dl>
          <div>
            <dt>report id</dt>
            <dd>{report.id}</dd>
          </div>
          <div>
            <dt>owner</dt>
            <dd>{report.owner}</dd>
          </div>
          <div>
            <dt>loader calls</dt>
            <dd data-testid="route-error-boundary-loader-count">{report.loaderCalls}</dd>
          </div>
          <div>
            <dt>action calls</dt>
            <dd data-testid="route-error-boundary-action-count">{reportActionCalls}</dd>
          </div>
        </dl>

        <Form method="post">
          <input type="hidden" name="intent" value="archive" />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '提交中' : '模拟保存归档报告'}
          </button>
        </Form>
      </section>
    )
  }

  /** 提供共享导航、状态观察与子 route Outlet。 */
  function WorkspaceLayout() {
    const location = useLocation()
    const navigation = useNavigation()
    const revalidator = useRevalidator()
    const isBusy = navigation.state !== 'idle' || revalidator.state === 'loading'

    /** 在 loader 或 navigation 活动时阻止新的并发导航。 */
    function handleBusyNavigation(event: MouseEvent<HTMLAnchorElement>) {
      if (isBusy) event.preventDefault()
    }

    return (
      <section className="route-error-boundary-shell" data-testid="route-error-boundary-shell">
        <header className="route-error-boundary-heading">
          <div>
            <p>Data Router Error Boundary</p>
            <h2>报告故障恢复台</h2>
            <span>比较错误类型、最近边界、冒泡位置与显式恢复路径。</span>
          </div>
          <button
            type="button"
            className="route-error-boundary-reset"
            data-testid="route-error-boundary-reset"
            onClick={handleResetDemo}
            disabled={isBusy}
          >
            重置演示
          </button>
        </header>

        <dl className="route-error-boundary-observer" aria-label="路由错误观察结果">
          <div>
            <dt>current location</dt>
            <dd data-testid="route-error-boundary-location">{location.pathname}</dd>
          </div>
          <div>
            <dt>navigation</dt>
            <dd data-testid="route-error-boundary-navigation-state">{navigation.state}</dd>
          </div>
          <div>
            <dt>revalidator</dt>
            <dd>{revalidator.state}</dd>
          </div>
          <div>
            <dt>loader / action calls</dt>
            <dd data-testid="route-error-boundary-call-summary">
              {reportLoaderCalls} / {reportActionCalls}
            </dd>
          </div>
        </dl>

        <nav className="route-error-boundary-nav" aria-label="故障情景">
          {reportNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              aria-disabled={isBusy}
              tabIndex={isBusy ? -1 : undefined}
              onClick={handleBusyNavigation}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="route-error-boundary-outlet">
          <Outlet />
        </div>
      </section>
    )
  }

  /** 提供只会在 loader 成功后渲染的设置占位内容。 */
  function SettingsPage() {
    return <p>设置数据已加载。</p>
  }

  const routes: RouteObject[] = [
    {
      id: 'route-error-boundary-root',
      path: '/workspace',
      Component: WorkspaceLayout,
      ErrorBoundary: RootRouteErrorBoundary,
      children: [
        {
          id: 'route-error-boundary-home',
          index: true,
          Component: WorkspaceHome,
        },
        {
          id: 'route-error-boundary-report',
          path: 'reports/:reportId',
          loader: reportLoader,
          action: reportAction,
          Component: ReportPage,
          ErrorBoundary: ReportRouteErrorBoundary,
        },
        {
          id: 'route-error-boundary-settings',
          path: 'settings',
          loader: settingsLoader,
          Component: SettingsPage,
        },
      ],
    },
  ]
  const router = createMemoryRouter(routes, { initialEntries: ['/workspace'] })

  /** 把独立 Router 交给 Provider，并在宿主卸载后释放订阅。 */
  function RouteErrorBoundaryDemo() {
    useEffect(() => {
      return () => router.dispose()
    }, [])

    return (
      <section className="route-error-boundary-demo" data-testid="route-error-boundary-demo">
        <RouterProvider router={router} />
      </section>
    )
  }

  return RouteErrorBoundaryDemo
}
