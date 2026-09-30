import { useEffect, useSyncExternalStore, type ComponentType } from 'react'
import {
  createMemoryRouter,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigation,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './navigation-concurrency-and-cancellation-demo.css'

type Report = {
  id: string
  title: string
  summary: string
  delay: number
}

type LoaderEvent = {
  id: number
  reportId: string
  state: 'started' | 'aborted' | 'completed'
  detail: string
}

const reports: readonly Report[] = [
  {
    id: 'overview',
    title: '概览报告',
    summary: '这是已经提交的页面。点击慢报告后，它会在新目标准备好前继续显示。',
    delay: 120,
  },
  {
    id: 'slow',
    title: '慢速报告',
    summary: '这个目标故意等待较长时间，方便观察新导航如何中断旧 loader。',
    delay: 2200,
  },
  {
    id: 'fast',
    title: '快速报告',
    summary: '这个目标很快完成。先点击慢报告，再点击它，可以看到最新目标优先提交。',
    delay: 420,
  },
]

/** 创建每次 Demo 挂载独立的事件快照，避免污染学习站其他内容。 */
function createEventStore() {
  let nextId = 1
  let events: readonly LoaderEvent[] = []
  const listeners = new Set<() => void>()

  return {
    /** 追加一次 loader 生命周期事件，并通知订阅者读取最新快照。 */
    add(reportId: string, state: LoaderEvent['state'], detail: string): void {
      events = [...events, { id: nextId, reportId, state, detail }]
      nextId += 1
      listeners.forEach((listener) => listener())
    },
    /** 清除事件记录并重置事件编号，方便重复演示取消流程。 */
    clear(): void {
      events = []
      nextId = 1
      listeners.forEach((listener) => listener())
    },
    /** 返回当前不可变事件快照，供 useSyncExternalStore 读取。 */
    getSnapshot(): readonly LoaderEvent[] {
      return events
    },
    /** 注册快照变化监听器，并返回卸载时的取消订阅函数。 */
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

/** 等待一个能响应 AbortSignal 的模拟数据任务，并在取消时释放计时器。 */
function waitForReport(signal: AbortSignal, milliseconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Navigation aborted', 'AbortError'))
      return
    }

    let finished = false
    const timer = window.setTimeout(() => {
      finished = true
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, milliseconds)

    /** 让自定义延时任务与 Router 的导航取消保持同步。 */
    function handleAbort(): void {
      if (finished) return
      window.clearTimeout(timer)
      signal.removeEventListener('abort', handleAbort)
      reject(new DOMException('Navigation aborted', 'AbortError'))
    }

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}

/** 为每次目标导航执行可取消的 loader，并记录真实生命周期。 */
function createReportLoader(eventStore: ReturnType<typeof createEventStore>) {
  return async function reportLoader({ request, params }: LoaderFunctionArgs): Promise<Report> {
    const report = reports.find((item) => item.id === params.reportId)
    if (!report) throw new Response('Not Found', { status: 404 })

    eventStore.add(report.id, 'started', `开始等待 ${report.delay}ms`)
    try {
      await waitForReport(request.signal, report.delay)
      eventStore.add(report.id, 'completed', 'loader 完成，结果可以提交')
      return report
    } catch (error) {
      if (request.signal.aborted) {
        eventStore.add(report.id, 'aborted', 'request.signal 已触发 abort，延时任务已清理')
      }
      throw error
    }
  }
}

/** 展示共享导航状态、当前地址和可以触发取消的目标入口。 */
function ReportWorkspace({ eventStore }: { eventStore: ReturnType<typeof createEventStore> }) {
  const location = useLocation()
  const navigation = useNavigation()
  const events = useSyncExternalStore(eventStore.subscribe, eventStore.getSnapshot)
  const target = navigation.state === 'loading' ? navigation.location.pathname : '无'

  return (
    <section className="navigation-concurrency-demo" data-testid="navigation-concurrency-demo">
      <header className="navigation-concurrency-header">
        <div>
          <p className="navigation-concurrency-eyebrow">React Router Data Mode</p>
          <h2>导航取消观察台</h2>
          <p>用一个慢目标制造等待，再用新导航观察 AbortSignal 如何结束旧 loader。</p>
        </div>
        <button type="button" onClick={eventStore.clear}>
          清空事件
        </button>
      </header>

      <section className="navigation-concurrency-observer" aria-live="polite">
        <div>
          <span>已提交位置</span>
          <strong data-testid="navigation-concurrency-current">{location.pathname}</strong>
        </div>
        <div>
          <span>正在前往</span>
          <strong data-testid="navigation-concurrency-target">{target}</strong>
        </div>
        <div>
          <span>navigation.state</span>
          <strong data-testid="navigation-concurrency-state">{navigation.state}</strong>
        </div>
      </section>

      <nav className="navigation-concurrency-links" aria-label="报告导航">
        <Link to="/reports/overview">概览报告</Link>
        <Link to="/reports/slow">慢报告（2200ms）</Link>
        <Link to="/reports/fast">快速报告（420ms）</Link>
      </nav>

      <main className="navigation-concurrency-content">
        <Outlet />
      </main>

      <section className="navigation-concurrency-events" aria-labelledby="navigation-events-title">
        <div className="navigation-concurrency-events-heading">
          <div>
            <p className="navigation-concurrency-eyebrow">Loader lifecycle</p>
            <h3 id="navigation-events-title">事件日志</h3>
          </div>
          <span>{events.length} 条</span>
        </div>
        {events.length === 0 ? (
          <p className="navigation-concurrency-empty">点击一个报告开始观察。</p>
        ) : (
          <ol>
            {events.map((event) => (
              <li key={event.id} className={`event-${event.state}`}>
                <strong>{event.reportId}</strong>
                <span>{event.state}</span>
                <small>{event.detail}</small>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className="navigation-concurrency-note">
        abort 释放的是浏览器端工作；请求若已到达服务端，仍可能继续处理。
      </p>
    </section>
  )
}

/** 展示已经提交的 loader data，避免用目标 Location 提前替换页面内容。 */
function ReportPage() {
  const report = useLoaderData() as Report

  return (
    <article className="navigation-concurrency-report" data-testid="navigation-concurrency-report">
      <p className="navigation-concurrency-eyebrow">Committed loader data</p>
      <h3>{report.title}</h3>
      <p>{report.summary}</p>
      <span>本页数据在 loader 完成后才提交。</span>
    </article>
  )
}

/** 为每次宿主挂载创建独立的内存 Router 和可取消导航 Demo。 */
export function createNavigationConcurrencyAndCancellationDemo(): ComponentType {
  const eventStore = createEventStore()
  const routes: RouteObject[] = [
    {
      path: '/',
      Component: () => <ReportWorkspace eventStore={eventStore} />,
      children: [
        {
          path: 'reports/:reportId',
          loader: createReportLoader(eventStore),
          Component: ReportPage,
        },
      ],
    },
  ]
  const router = createMemoryRouter(routes, { initialEntries: ['/reports/overview'] })

  return function NavigationConcurrencyAndCancellationDemo() {
    useEffect(() => () => router.dispose(), [router])
    return <RouterProvider router={router} />
  }
}
