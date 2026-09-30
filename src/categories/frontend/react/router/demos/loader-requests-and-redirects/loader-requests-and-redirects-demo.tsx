import { type ComponentType } from 'react'
import {
  createMemoryRouter,
  Link,
  Outlet,
  redirect,
  replace,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigationType,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './loader-requests-and-redirects-demo.css'

type ReportView = 'summary' | 'detail' | 'slow'

const reportViews = new Set<ReportView>(['summary', 'detail', 'slow'])
const reportContent: Record<ReportView, { title: string; summary: string }> = {
  summary: {
    title: '发布摘要',
    summary: '汇总本周交付数量、通过率和仍需处理的风险。',
  },
  detail: {
    title: '发布明细',
    summary: '按项目列出版本、负责人和当前发布阶段。',
  },
  slow: {
    title: '归档报告',
    summary: '模拟需要较长时间准备、但可以被新导航取消的读取任务。',
  },
}

let loaderExecutionCount = 0
let interruptedRequestCount = 0

/** 判断 URL 输入是否属于 Demo 支持的报告视图。 */
function isReportView(value: string | null): value is ReportView {
  return value !== null && reportViews.has(value as ReportView)
}

/** 用确定性本地任务演示把导航 signal 传给可取消的数据工作。 */
function readReport(view: ReportView, signal: AbortSignal) {
  if (view !== 'slow') return Promise.resolve(reportContent[view])

  return new Promise<(typeof reportContent)[ReportView]>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve(reportContent[view])
    }, 600)

    /** 记录导航中断，并让本地任务呈现与 fetch 相同的取消结果。 */
    function handleAbort() {
      window.clearTimeout(timeoutId)
      interruptedRequestCount += 1
      reject(new DOMException('Navigation aborted', 'AbortError'))
    }

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}

/** 读取 loader Request，并把非法 view 规范化到唯一地址。 */
async function reportsLoader({ request }: LoaderFunctionArgs) {
  loaderExecutionCount += 1
  const requestUrl = new URL(request.url)
  const requestedView = requestUrl.searchParams.get('view')

  if (!isReportView(requestedView)) {
    return replace('/reports?view=summary')
  }

  const report = await readReport(requestedView, request.signal)

  return {
    report,
    view: requestedView,
    requestSnapshot: {
      method: request.method,
      url: request.url,
      search: requestUrl.search || '(empty)',
      headerCount: Array.from(request.headers).length,
      signalAborted: request.signal.aborted,
    },
    loaderExecutionCount,
    interruptedRequestCount,
  }
}

/** 把旧报告入口重定向到当前 canonical 地址。 */
function legacyReportsLoader() {
  return redirect('/reports?view=summary')
}

/** 提供观察导航结果和触发取消探针的固定 Demo 外壳。 */
function DemoShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const navigationType = useNavigationType()

  /** 先启动慢读取，再用新导航取消它并提交详细报告。 */
  function runAbortProbe() {
    void navigate('/reports?view=slow')
    window.setTimeout(() => void navigate('/reports?view=detail'), 40)
  }

  /** 返回内存 history 中的上一条已提交记录。 */
  function goBack() {
    void navigate(-1)
  }

  return (
    <section
      className="loader-requests-and-redirects-demo"
      data-testid="loader-requests-and-redirects-demo"
    >
      <header className="loader-request-demo-heading">
        <div>
          <p>request to navigation</p>
          <h2>Loader 请求与导航观察台</h2>
        </div>
        <span>读取 URL 输入，观察 signal 取消，并区分 PUSH 与 REPLACE。</span>
      </header>

      <div className="loader-request-demo-toolbar">
        <Link to="/start">回到起点</Link>
        <button type="button" onClick={runAbortProbe}>
          慢速后立即详细
        </button>
        <button type="button" onClick={goBack}>
          返回上一条
        </button>
      </div>

      <section className="loader-request-demo-location" aria-label="当前内存路由状态">
        <div>
          <span>当前 location</span>
          <code data-testid="loader-request-location">
            {location.pathname}
            {location.search}
            {location.hash}
          </code>
        </div>
        <div>
          <span>navigation type</span>
          <strong data-testid="loader-request-navigation-type">{navigationType}</strong>
        </div>
      </section>

      <Outlet />
    </section>
  )
}

/** 展示三个具有不同导航结果的入口。 */
function StartPage() {
  return (
    <main className="loader-request-demo-start">
      <div>
        <p>选择一条 loader 路径</p>
        <h3>从同一个起点比较请求与重定向</h3>
      </div>
      <nav aria-label="Loader 请求场景">
        <Link to="/reports?view=detail">
          <strong>合法请求</strong>
          <span>读取 view=detail 并返回数据</span>
        </Link>
        <Link to="/reports?view=invalid">
          <strong>非法 view</strong>
          <span>replace 到 canonical summary</span>
        </Link>
        <Link to="/legacy-reports">
          <strong>旧入口</strong>
          <span>redirect 到当前报告地址</span>
        </Link>
      </nav>
    </main>
  )
}

/** 呈现已提交 loader 的 Request 快照和报告结果。 */
function ReportsPage() {
  const data = useLoaderData<typeof reportsLoader>()
  const location = useLocation()

  return (
    <main className="loader-request-demo-report">
      <section className="loader-request-demo-request" id="request">
        <div className="loader-request-demo-section-heading">
          <div>
            <p>Loader Request</p>
            <h3>本次请求快照</h3>
          </div>
          <strong>{data.view}</strong>
        </div>

        <dl>
          <div>
            <dt>method</dt>
            <dd data-testid="loader-request-method">{data.requestSnapshot.method}</dd>
          </div>
          <div>
            <dt>search</dt>
            <dd data-testid="loader-request-search">{data.requestSnapshot.search}</dd>
          </div>
          <div>
            <dt>headers</dt>
            <dd data-testid="loader-request-header-count">
              {data.requestSnapshot.headerCount} entries
            </dd>
          </div>
          <div>
            <dt>signal at commit</dt>
            <dd>{data.requestSnapshot.signalAborted ? 'aborted' : 'active'}</dd>
          </div>
        </dl>
        <code className="loader-request-demo-url" data-testid="loader-request-url">
          {data.requestSnapshot.url}
        </code>
      </section>

      <section className="loader-request-demo-result" aria-live="polite">
        <div>
          <p>Committed report</p>
          <h3 data-testid="loader-request-report-title">{data.report.title}</h3>
          <span>{data.report.summary}</span>
        </div>
        <dl>
          <div>
            <dt>loader runs</dt>
            <dd data-testid="loader-request-run-count">{data.loaderExecutionCount}</dd>
          </div>
          <div>
            <dt>aborted work</dt>
            <dd data-testid="loader-request-abort-count">{data.interruptedRequestCount}</dd>
          </div>
        </dl>
      </section>

      <nav className="loader-request-demo-report-links" aria-label="切换报告请求">
        <Link to="/reports?view=summary">摘要</Link>
        <Link to="/reports?view=detail">详细</Link>
        <Link to="/reports?view=slow">慢速</Link>
        <Link
          to={{
            pathname: location.pathname,
            search: location.search,
            hash: '#request',
          }}
        >
          只改 hash
        </Link>
      </nav>
    </main>
  )
}

const routes = [
  {
    path: '/',
    Component: DemoShell,
    children: [
      { index: true, Component: StartPage },
      { path: 'start', Component: StartPage },
      { path: 'reports', loader: reportsLoader, Component: ReportsPage },
      { path: 'legacy-reports', loader: legacyReportsLoader, Component: StartPage },
    ],
  },
] satisfies RouteObject[]

/** 为每次宿主挂载创建拥有独立 history 与 loader request 的 Demo。 */
export function createLoaderRequestsAndRedirectsDemo(): ComponentType {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/start'],
  })

  /** 挂载本课独立的 Data Router。 */
  function LoaderRequestsAndRedirectsDemo() {
    return <RouterProvider router={router} />
  }

  return LoaderRequestsAndRedirectsDemo
}
