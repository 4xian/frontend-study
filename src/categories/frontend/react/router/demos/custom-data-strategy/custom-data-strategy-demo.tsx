import { useEffect, useRef, useState, useSyncExternalStore, type ComponentType } from 'react'
import {
  createMemoryRouter,
  Outlet,
  useFetcher,
  useLoaderData,
  useRevalidator,
  type DataStrategyFunction,
  type DataStrategyResult,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './custom-data-strategy-demo.css'

type ExecutionMode = 'parallel' | 'serial'

type LoaderSnapshot = {
  route: string
  revision: number
  message: string
}

type PreviewData = {
  message: string
  fetcherKey: string
}

type EventKind = 'strategy' | 'loader' | 'fetcher'

type EventRecord = {
  id: number
  text: string
  kind: EventKind
}

/** 创建可订阅的事件快照，供观察台显示策略执行顺序。 */
function createEventStore() {
  let nextId = 1
  let events: readonly EventRecord[] = []
  const listeners = new Set<() => void>()

  return {
    /** 添加一条策略或 handler 生命周期事件。 */
    add(text: string, kind: EventKind): void {
      events = [...events, { id: nextId, text, kind }]
      nextId += 1
      listeners.forEach((listener) => listener())
    },
    /** 清空当前实验日志并重新开始编号。 */
    clear(): void {
      events = []
      nextId = 1
      listeners.forEach((listener) => listener())
    },
    /** 返回不可变事件快照。 */
    getSnapshot(): readonly EventRecord[] {
      return events
    },
    /** 注册快照订阅，并返回卸载时的取消订阅函数。 */
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

/** 等待一段可取消的 loader 工作，让并行与串行差异可以被观察。 */
function waitForLoader(signal: AbortSignal, milliseconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, milliseconds)

    /** 在 Router 取消 loader 时清理计时器。 */
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

/** 为每次 Demo 挂载创建独立的数据策略模型和内存 Router。 */
export function createCustomDataStrategyDemo(): ComponentType {
  const eventStore = createEventStore()
  let executionMode: ExecutionMode = 'parallel'
  let rootRevision = 0
  let overviewRevision = 0

  /** 返回根布局 loader 的最新事实，并记录它确实被调用。 */
  async function rootLoader({ request }: LoaderFunctionArgs): Promise<LoaderSnapshot> {
    rootRevision += 1
    const revision = rootRevision
    eventStore.add(`root loader #${revision} 开始`, 'loader')
    await waitForLoader(request.signal, 180)
    eventStore.add(`root loader #${revision} 返回`, 'loader')
    return { route: 'root', revision, message: `根布局数据 v${revision}` }
  }

  /** 返回页面 loader 的最新事实，并记录它确实被调用。 */
  async function overviewLoader({ request }: LoaderFunctionArgs): Promise<LoaderSnapshot> {
    overviewRevision += 1
    const revision = overviewRevision
    eventStore.add(`overview loader #${revision} 开始`, 'loader')
    await waitForLoader(request.signal, 260)
    eventStore.add(`overview loader #${revision} 返回`, 'loader')
    return { route: 'overview', revision, message: `页面数据 v${revision}` }
  }

  /** 返回局部 Fetcher 数据，展示策略收到的 fetcherKey。 */
  async function previewLoader({ request }: LoaderFunctionArgs): Promise<PreviewData> {
    const fetcherKey = new URL(request.url).searchParams.get('fetcherKey') ?? 'unknown'
    eventStore.add(`preview loader 开始，fetcherKey=${fetcherKey}`, 'fetcher')
    await waitForLoader(request.signal, 220)
    eventStore.add(`preview loader 返回，fetcherKey=${fetcherKey}`, 'fetcher')
    return { message: '局部 Fetcher 数据已返回', fetcherKey }
  }

  /** 让 Data Router 把匹配路由的 handler 交给自定义执行策略。 */
  const dataStrategy: DataStrategyFunction = async ({ matches, fetcherKey }) => {
    const matchesToLoad = matches.filter((match) => match.shouldCallHandler())
    const scope = fetcherKey ? `Fetcher ${fetcherKey}` : '页面导航'
    eventStore.add(
      `${scope}：策略收到 ${matchesToLoad.map((match) => match.route.id).join('、') || '无 handler'}`,
      'strategy',
    )

    /** 解析一个匹配项并把结果按 route id 返回给 Router。 */
    async function resolveMatch(match: (typeof matchesToLoad)[number]) {
      eventStore.add(`${match.route.id} 开始 resolve`, fetcherKey ? 'fetcher' : 'strategy')
      const result = await match.resolve()
      eventStore.add(
        `${match.route.id} 完成 resolve（${result.type}）`,
        fetcherKey ? 'fetcher' : 'strategy',
      )
      return [match.route.id, result] as const
    }

    const resolvedEntries: Array<readonly [string, DataStrategyResult]> = []
    if (executionMode === 'parallel') {
      resolvedEntries.push(
        ...(await Promise.all(matchesToLoad.map((match) => resolveMatch(match)))),
      )
    } else {
      for (const match of matchesToLoad) {
        resolvedEntries.push(await resolveMatch(match))
      }
    }

    return Object.fromEntries(resolvedEntries)
  }

  const routes: RouteObject[] = [
    {
      id: 'strategy-root',
      path: '/strategy',
      loader: rootLoader,
      Component: StrategyLayout,
      children: [
        {
          id: 'strategy-overview',
          index: true,
          loader: overviewLoader,
          Component: StrategyOverview,
        },
        {
          id: 'strategy-preview',
          path: 'preview',
          loader: previewLoader,
        },
      ],
    },
  ]
  const router = createMemoryRouter(routes, {
    initialEntries: ['/strategy'],
    dataStrategy,
  })

  /** 释放 Router 和事件订阅，避免 Demo 离开后继续执行异步工作。 */
  function dispose(): void {
    router.dispose()
    eventStore.clear()
  }

  /** 展示自定义策略的执行范围、模式和日志。 */
  function StrategyLayout() {
    const rootData = useLoaderData<typeof rootLoader>()
    const revalidator = useRevalidator()
    const previewFetcher = useFetcher<typeof previewLoader>()
    const events = useSyncExternalStore(eventStore.subscribe, eventStore.getSnapshot)
    const [selectedMode, setSelectedMode] = useState<ExecutionMode>('parallel')
    const isBusy = revalidator.state !== 'idle' || previewFetcher.state !== 'idle'

    /** 切换策略模式并重新运行当前匹配路由的 loader。 */
    function selectMode(mode: ExecutionMode): void {
      if (isBusy || mode === executionMode) return
      executionMode = mode
      setSelectedMode(mode)
      revalidator.revalidate()
    }

    /** 通过 Fetcher 读取局部路由数据，不触发页面导航。 */
    function loadPreview(): void {
      if (isBusy) return
      previewFetcher.load('/strategy/preview?fetcherKey=preview-panel')
    }

    /** 只在没有请求进行时清空生命周期日志。 */
    function clearEvents(): void {
      if (!isBusy) eventStore.clear()
    }

    return (
      <section className="custom-data-strategy-demo" data-testid="custom-data-strategy-demo">
        <header className="strategy-header">
          <div>
            <p className="strategy-eyebrow">React Router Data Mode</p>
            <h2>自定义 Data Strategy 观察台</h2>
            <p>让同一组 route matches 由默认并行改为可观察的串行执行。</p>
          </div>
          <span className="strategy-status">revalidation：{revalidator.state}</span>
        </header>

        <section className="strategy-contract" aria-label="Data Strategy 合同">
          <article>
            <span>当前模式</span>
            <strong data-testid="strategy-mode">
              {selectedMode === 'parallel' ? '并行' : '串行'}
            </strong>
            <small>由 dataStrategy 决定 resolve 调度</small>
          </article>
          <article>
            <span>根 loader</span>
            <strong data-testid="strategy-root-data">{rootData.message}</strong>
            <small>由 strategy-root 返回</small>
          </article>
          <article>
            <span>匹配范围</span>
            <strong>strategy-root + strategy-overview</strong>
            <small>每次重验证都会重新判断 shouldCallHandler</small>
          </article>
        </section>

        <section className="strategy-controls" aria-label="策略控制">
          <div className="strategy-mode-buttons">
            <button
              type="button"
              aria-pressed={selectedMode === 'parallel'}
              disabled={isBusy}
              onClick={() => selectMode('parallel')}
            >
              使用并行策略
            </button>
            <button
              type="button"
              aria-pressed={selectedMode === 'serial'}
              disabled={isBusy}
              onClick={() => selectMode('serial')}
            >
              使用串行策略
            </button>
          </div>
          <button
            type="button"
            className="strategy-secondary-button"
            disabled={isBusy}
            onClick={loadPreview}
          >
            读取局部 Fetcher
          </button>
          <button
            type="button"
            className="strategy-secondary-button"
            disabled={isBusy}
            onClick={clearEvents}
          >
            清空日志
          </button>
        </section>

        <section className="strategy-content">
          <div className="strategy-main-panel">
            <Outlet />
          </div>
          <aside className="strategy-preview-panel" aria-live="polite">
            <p className="strategy-eyebrow">Fetcher scope</p>
            <h3>局部请求</h3>
            <strong data-testid="strategy-fetcher-state">{previewFetcher.state}</strong>
            {previewFetcher.data ? (
              <p>
                {previewFetcher.data.message}（{previewFetcher.data.fetcherKey}）
              </p>
            ) : (
              <p>点击按钮后，策略会收到一个 fetcherKey，而页面地址保持不变。</p>
            )}
          </aside>
        </section>

        <section className="strategy-events" aria-live="polite">
          <div className="strategy-events-heading">
            <div>
              <p className="strategy-eyebrow">Execution trace</p>
              <h3>策略事件</h3>
            </div>
            <span>{events.length} 条事件</span>
          </div>
          {events.length > 0 ? (
            <ol>
              {events.map((event) => (
                <li key={event.id} className={`strategy-event-${event.kind}`}>
                  <span>#{event.id}</span>
                  <p>{event.text}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="strategy-empty">暂无事件，先选择一种策略或读取局部 Fetcher。</p>
          )}
        </section>

        <p className="strategy-note">
          自定义策略必须为每个实际执行的 handler 返回对应 route id 的 DataStrategyResult；没有调用
          match.resolve() 的路由不会自动产生 loader 数据。
        </p>
      </section>
    )
  }

  /** 展示子路由 loader 数据，确认策略返回的结果进入对应 route。 */
  function StrategyOverview() {
    const data = useLoaderData<typeof overviewLoader>()
    return (
      <div>
        <p className="strategy-eyebrow">Route handler result</p>
        <h3>页面 loader</h3>
        <p className="strategy-result" data-testid="strategy-overview-data">
          {data.message}，当前结果来自 strategy-overview 的 loader。
        </p>
        <p className="strategy-help">
          切换到串行后重新验证，日志会显示 root loader 完成后才开始 overview
          loader；并行模式会同时开始 两个 resolve。
        </p>
      </div>
    )
  }

  /** 为每次 Demo 挂载创建 RouterProvider，并在真实卸载时释放资源。 */
  function CustomDataStrategyDemo() {
    const routerRef = useRef(router)
    const disposeTimerRef = useRef<number | null>(null)

    /** 兼容 Strict Mode 的 effect 重复执行，并延迟到真实卸载后释放 Router。 */
    useEffect(() => {
      if (disposeTimerRef.current !== null) {
        window.clearTimeout(disposeTimerRef.current)
        disposeTimerRef.current = null
      }
      return () => {
        disposeTimerRef.current = window.setTimeout(() => dispose(), 0)
      }
    }, [])

    return <RouterProvider router={routerRef.current} />
  }

  return CustomDataStrategyDemo
}
