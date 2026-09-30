import { useEffect, useSyncExternalStore, type ComponentType } from 'react'
import {
  createMemoryRouter,
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './race-conditions-demo.css'

type SubmitLabel = 'A' | 'B'

type RaceData = {
  value: string
  revision: number
}

type ActionResult = {
  label: SubmitLabel
  revision: number
}

type SearchResult = {
  query: string
  results: string[]
}

type EventRecord = {
  id: number
  text: string
  kind: 'action' | 'revalidation' | 'search'
}

type Gate = {
  promise: Promise<void>
  resolve: () => void
  started: boolean
  resolved: boolean
}

/** 创建一个由界面手动完成的异步门，保证竞态顺序可重复。 */
function createGate(): Gate {
  let finish!: () => void
  const gate: Gate = {
    promise: new Promise<void>((resolve) => {
      finish = resolve
    }),
    resolve: () => {
      if (gate.resolved) return
      gate.resolved = true
      finish()
    },
    started: false,
    resolved: false,
  }
  return gate
}

/** 记录事件并提供 React 可订阅的不可变快照。 */
function createEventStore() {
  let nextId = 1
  let events: readonly EventRecord[] = []
  const listeners = new Set<() => void>()

  return {
    /** 追加一个可观察事件，驱动界面刷新生命周期日志。 */
    add(text: string, kind: EventRecord['kind']): void {
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
    /** 返回当前事件快照，供 useSyncExternalStore 读取。 */
    getSnapshot(): readonly EventRecord[] {
      return events
    },
    /** 注册事件快照监听器，并返回卸载时的取消订阅函数。 */
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

/** 等待实验门，并让 Router 的 AbortSignal 能结束已经过时的工作。 */
function waitForGate(gate: Gate, signal: AbortSignal, onAbort: () => void): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      onAbort()
      reject(new DOMException('Request aborted', 'AbortError'))
      return
    }

    /** 在请求取消时移除监听并结束当前门。 */
    function handleAbort(): void {
      signal.removeEventListener('abort', handleAbort)
      onAbort()
      reject(new DOMException('Request aborted', 'AbortError'))
    }

    signal.addEventListener('abort', handleAbort, { once: true })
    gate.promise.then(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    })
  })
}

/** 为每次 Demo 挂载创建独立的竞态模型和 Data Router。 */
export function createRaceConditionsDemo(): ComponentType {
  const eventStore = createEventStore()
  let serverValue = '初始事实 v0'
  let serverRevision = 0
  let loaderCalls = 0
  let actionGates: Record<SubmitLabel, Gate> = { A: createGate(), B: createGate() }
  let revalidationGates: Gate[] = []
  let searchGates = new Map<string, Gate>()

  /** 取得指定序号的页面 loader 门，并记录它确实已经开始。 */
  function getRevalidationGate(index: number): Gate {
    while (revalidationGates.length < index) revalidationGates.push(createGate())
    const gate = revalidationGates[index - 1]!
    gate.started = true
    return gate
  }

  /** 取得指定搜索词的 Fetcher 门，用于观察同一实例的自取消。 */
  function getSearchGate(query: string): Gate {
    const existing = searchGates.get(query)
    if (existing) return existing
    const gate = createGate()
    searchGates.set(query, gate)
    return gate
  }

  /** 读取当前服务端事实，并为并发 revalidation 保存启动时快照。 */
  async function raceLoader({ request }: LoaderFunctionArgs): Promise<RaceData> {
    loaderCalls += 1
    const snapshot = { value: serverValue, revision: serverRevision }
    if (loaderCalls === 1) return snapshot

    const revalidationIndex = loaderCalls - 1
    const gate = getRevalidationGate(revalidationIndex)
    eventStore.add(
      `R${revalidationIndex} 开始，快照为 ${snapshot.value}，等待手动完成`,
      'revalidation',
    )

    await waitForGate(gate, request.signal, () => {
      eventStore.add(`R${revalidationIndex} 被 Router 标记为 stale，未提交旧快照`, 'revalidation')
    })
    eventStore.add(`R${revalidationIndex} 返回 ${snapshot.value}`, 'revalidation')
    return snapshot
  }

  /** 模拟两个独立 Fetcher action，并在 action 结束后触发页面 revalidation。 */
  async function raceAction({ request }: ActionFunctionArgs): Promise<ActionResult> {
    const formData = await request.formData()
    const label = formData.get('label') === 'B' ? 'B' : 'A'
    const gate = actionGates[label]
    gate.started = true
    eventStore.add(`${label} action 开始`, 'action')

    await waitForGate(gate, request.signal, () => {
      eventStore.add(`${label} action 被取消`, 'action')
    })

    serverRevision += 1
    serverValue = `版本 ${label}（v${serverRevision}）`
    eventStore.add(`${label} action 完成，服务端事实变为 ${serverValue}`, 'action')
    return { label, revision: serverRevision }
  }

  /** 模拟可搜索 loader，展示同一 Fetcher 的新请求如何取消旧请求。 */
  async function searchLoader({ request }: LoaderFunctionArgs): Promise<SearchResult> {
    const query = new URL(request.url).searchParams.get('q') ?? ''
    const gate = getSearchGate(query)
    gate.started = true
    eventStore.add(`搜索 ${query} 开始`, 'search')

    await waitForGate(gate, request.signal, () => {
      eventStore.add(`搜索 ${query} 被同一 Fetcher 取消`, 'search')
    })

    eventStore.add(`搜索 ${query} 返回`, 'search')
    return { query, results: [`${query} 结果 1`, `${query} 结果 2`] }
  }

  /** 完成指定门并追加一条明确的人工控制事件。 */
  function resolveGate(gate: Gate, text: string, kind: EventRecord['kind']): void {
    if (!gate.started || gate.resolved) return
    gate.resolve()
    eventStore.add(text, kind)
  }

  /** 呈现两个并发 action、stale revalidation 与同 Fetcher 自取消的观察台。 */
  function RaceWorkspace() {
    const data = useLoaderData<typeof raceLoader>()
    const fetcherA = useFetcher<typeof raceAction>()
    const fetcherB = useFetcher<typeof raceAction>()
    const searchFetcher = useFetcher<typeof searchLoader>()
    const events = useSyncExternalStore(eventStore.subscribe, eventStore.getSnapshot)
    const revalidationOne = revalidationGates[0]
    const revalidationTwo = revalidationGates[1]
    const slowSearch = searchGates.get('慢')
    const fastSearch = searchGates.get('快')

    /** 让指定 Fetcher 提交一次带标签的 action。 */
    function submitAction(fetcher: typeof fetcherA, label: SubmitLabel): void {
      fetcher.submit({ label }, { method: 'post', action: '/race' })
    }

    /** 让同一个 Fetcher 读取一个由手动门控制的搜索结果。 */
    function submitSearch(query: string): void {
      searchFetcher.load(`/search?q=${encodeURIComponent(query)}`)
    }

    /** 先让 Router 完成旧请求的取消，再重置 Fetcher、事实和实验日志。 */
    function resetExperiment(): void {
      serverValue = '初始事实 v0'
      serverRevision = 0
      loaderCalls = 0
      actionGates = { A: createGate(), B: createGate() }
      revalidationGates = []
      searchGates = new Map()
      void router.navigate('/race', { replace: true }).then(() => {
        fetcherA.reset()
        fetcherB.reset()
        searchFetcher.reset()
        eventStore.clear()
      })
    }

    return (
      <section className="race-conditions-demo" data-testid="race-conditions-demo">
        <header className="race-conditions-header">
          <div>
            <p className="race-conditions-eyebrow">React Router Data Mode</p>
            <h2>竞态条件观察台</h2>
            <p>手动控制 action 与 revalidation 的返回顺序，观察 fresh 结果提交、stale 结果丢弃。</p>
          </div>
          <button type="button" className="race-conditions-reset" onClick={resetExperiment}>
            重新开始
          </button>
        </header>

        <section className="race-conditions-fact" aria-live="polite">
          <span>当前页面 loader 事实</span>
          <strong data-testid="race-conditions-value">{data.value}</strong>
          <span>revision {data.revision}</span>
        </section>

        <section className="race-conditions-columns">
          <article className="race-conditions-panel">
            <div className="race-conditions-panel-heading">
              <div>
                <p className="race-conditions-eyebrow">Independent Fetchers</p>
                <h3>并发 action 与 revalidation</h3>
              </div>
              <span>先完成 B 的 revalidation</span>
            </div>
            <p className="race-conditions-help">
              先点击 A、B，再分别完成两个 action。R1 和 R2 出现后，先完成 R2，最后完成 R1。
            </p>
            <div className="race-conditions-actions">
              <button
                type="button"
                onClick={() => submitAction(fetcherA, 'A')}
                disabled={fetcherA.state !== 'idle'}
              >
                提交 A
              </button>
              <span>A：{fetcherA.state}</span>
              <button
                type="button"
                onClick={() => submitAction(fetcherB, 'B')}
                disabled={fetcherB.state !== 'idle'}
              >
                提交 B
              </button>
              <span>B：{fetcherB.state}</span>
            </div>
            <div className="race-conditions-actions">
              <button
                type="button"
                onClick={() => resolveGate(actionGates.A, '完成 A action', 'action')}
                disabled={!actionGates.A.started || actionGates.A.resolved}
              >
                完成 A action
              </button>
              <button
                type="button"
                onClick={() => resolveGate(actionGates.B, '完成 B action', 'action')}
                disabled={!actionGates.B.started || actionGates.B.resolved}
              >
                完成 B action
              </button>
            </div>
            <div className="race-conditions-actions">
              <button
                type="button"
                onClick={() =>
                  revalidationOne && resolveGate(revalidationOne, '手动完成 R1', 'revalidation')
                }
                disabled={!revalidationOne?.started || revalidationOne.resolved}
              >
                完成 R1（旧）
              </button>
              <button
                type="button"
                onClick={() =>
                  revalidationTwo && resolveGate(revalidationTwo, '手动完成 R2', 'revalidation')
                }
                disabled={!revalidationTwo?.started || revalidationTwo.resolved}
              >
                完成 R2（新）
              </button>
            </div>
          </article>

          <article className="race-conditions-panel">
            <div className="race-conditions-panel-heading">
              <div>
                <p className="race-conditions-eyebrow">Same Fetcher</p>
                <h3>连续搜索的自取消</h3>
              </div>
              <span>慢结果不应覆盖快结果</span>
            </div>
            <p className="race-conditions-help">先启动“慢”，再启动“快”，然后先完成快搜索。</p>
            <div className="race-conditions-actions">
              <button type="button" onClick={() => submitSearch('慢')}>
                搜索慢
              </button>
              <button type="button" onClick={() => submitSearch('快')}>
                搜索快
              </button>
              <span>{searchFetcher.state}</span>
            </div>
            <div className="race-conditions-actions">
              <button
                type="button"
                onClick={() => fastSearch && resolveGate(fastSearch, '完成快搜索', 'search')}
                disabled={!fastSearch?.started || fastSearch.resolved}
              >
                完成快搜索
              </button>
              <button
                type="button"
                onClick={() => slowSearch && resolveGate(slowSearch, '完成慢搜索', 'search')}
                disabled={!slowSearch?.started || slowSearch.resolved}
              >
                完成慢搜索
              </button>
            </div>
            <p className="race-conditions-result">
              当前搜索结果：{searchFetcher.data?.query ?? '尚未返回'}
            </p>
          </article>
        </section>

        <section className="race-conditions-events" aria-labelledby="race-events-title">
          <div className="race-conditions-panel-heading">
            <div>
              <p className="race-conditions-eyebrow">Observable trace</p>
              <h3 id="race-events-title">事件顺序</h3>
            </div>
            <button type="button" onClick={eventStore.clear}>
              清空日志
            </button>
          </div>
          {events.length === 0 ? (
            <p className="race-conditions-empty">开始一组实验后，事件会按真实生命周期出现。</p>
          ) : (
            <ol>
              {events.map((event) => (
                <li key={event.id} className={`race-event-${event.kind}`}>
                  <span>{event.text}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <p className="race-conditions-note">
          本地 deferred 只模拟客户端返回顺序。Router 能避免 stale
          UI，但不能保证已经到达服务端的旧写入被撤销。
        </p>
      </section>
    )
  }

  /** 搜索资源不参与页面 action 的 revalidation，只响应自己的 Fetcher 请求。 */
  function skipSearchRevalidation(): boolean {
    return false
  }

  const routes: RouteObject[] = [
    {
      path: '/race',
      loader: raceLoader,
      action: raceAction,
      Component: RaceWorkspace,
    },
    {
      path: '/search',
      loader: searchLoader,
      shouldRevalidate: skipSearchRevalidation,
    },
  ]
  const router = createMemoryRouter(routes, { initialEntries: ['/race'] })

  /** 为宿主提供 Router，并在 Demo 卸载时清理所有路由资源。 */
  function RaceConditionsDemo() {
    useEffect(() => () => router.dispose(), [router])
    return <RouterProvider router={router} />
  }

  return RaceConditionsDemo
}
