import { type ComponentType, useEffect, useRef, useState } from 'react'
import {
  createMemoryRouter,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './fetcher-demo.css'

type Task = {
  id: number
  title: string
}

type TasksData = {
  tasks: Task[]
  loaderCalls: number
  actionCalls: number
}

type Suggestion = {
  id: string
  title: string
}

type SuggestionsData = {
  query: string
  suggestions: Suggestion[]
  loaderCalls: number
}

type ActionResult = {
  ok: true
  message: string
  taskTitle: string
  actionCalls: number
}

const initialTasks: readonly Task[] = [
  { id: 1, title: '核对 Fetcher 状态' },
  { id: 2, title: '区分 loader data 与 action data' },
]

const suggestionCatalog: readonly Suggestion[] = [
  { id: 'state', title: '记录 idle、loading 与 submitting' },
  { id: 'url', title: '确认局部请求不会改变 URL' },
  { id: 'data', title: '观察 Fetcher data 的保留与覆盖' },
  { id: 'revalidation', title: '验证 action 后的 loader 重新读取' },
]

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

/** 只在状态变化时追加记录，并限制观察序列长度。 */
function appendState(trace: string[], state: string): string[] {
  if (trace.at(-1) === state) return trace
  return [...trace.slice(-6), state]
}

/** 把 Fetcher 状态转换为读取推荐时的反馈文案。 */
function getLoadMessage(state: 'idle' | 'loading' | 'submitting'): string {
  if (state === 'loading') return '推荐 loader 正在返回结果'
  return '推荐 Fetcher 空闲'
}

/** 把 Fetcher 状态转换为任务提交时的反馈文案。 */
function getMutationMessage(state: 'idle' | 'loading' | 'submitting'): string {
  if (state === 'submitting') return '任务正在提交到 action'
  if (state === 'loading') return 'action 已完成，页面 loader 正在重新验证'
  return '任务 Fetcher 空闲'
}

/** 为每次宿主挂载创建独立的数据、计数与内存路由。 */
export function createFetcherDemo(): ComponentType {
  let tasks = initialTasks.map((task) => ({ ...task }))
  let nextTaskId = tasks.length + 1
  let tasksLoaderCalls = 0
  let actionCalls = 0
  let suggestionsLoaderCalls = 0

  /** 恢复 Demo 的内存模型与计数，供观察者重复验证同一条状态序列。 */
  function resetDemoState() {
    tasks = initialTasks.map((task) => ({ ...task }))
    nextTaskId = tasks.length + 1
    tasksLoaderCalls = 0
    actionCalls = 0
    suggestionsLoaderCalls = 0
  }

  /** 返回任务列表快照，并为 action 后的重新验证保留观察窗口。 */
  async function tasksLoader({ request }: LoaderFunctionArgs): Promise<TasksData> {
    tasksLoaderCalls += 1
    if (tasksLoaderCalls > 1) await waitForRequest(request.signal, 520)

    return {
      tasks: tasks.map((task) => ({ ...task })),
      loaderCalls: tasksLoaderCalls,
      actionCalls,
    }
  }

  /** 根据查询词返回一个目标 route loader 的推荐结果。 */
  async function suggestionsLoader({ request }: LoaderFunctionArgs): Promise<SuggestionsData> {
    suggestionsLoaderCalls += 1
    await waitForRequest(request.signal, 560)

    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.trim().toLowerCase() ?? ''
    const suggestions = query
      ? suggestionCatalog.filter((item) => item.title.toLowerCase().includes(query))
      : suggestionCatalog.slice(0, 3)

    return {
      query,
      suggestions: suggestions.map((item) => ({ ...item })),
      loaderCalls: suggestionsLoaderCalls,
    }
  }

  /** 读取 Fetcher Form 字段，写入任务模型并返回局部 action data。 */
  async function tasksAction({ request }: ActionFunctionArgs): Promise<ActionResult> {
    actionCalls += 1
    const formData = await request.formData()
    const titleValue = formData.get('title')
    const title = typeof titleValue === 'string' ? titleValue.trim() : ''

    await waitForRequest(request.signal, 680)
    tasks = [...tasks, { id: nextTaskId, title }]
    nextTaskId += 1

    return {
      ok: true,
      message: `任务“${title}”已写入，页面列表来自重新验证后的 loader data。`,
      taskTitle: title,
      actionCalls,
    }
  }

  /** 呈现两个独立 Fetcher 与保持空闲的全局导航观察台。 */
  function TaskWorkspace() {
    const data = useLoaderData<typeof tasksLoader>()
    const loadFetcher = useFetcher<typeof suggestionsLoader>()
    const mutationFetcher = useFetcher<typeof tasksAction>()
    const navigation = useNavigation()
    const location = useLocation()
    const [suggestionQuery, setSuggestionQuery] = useState('状态')
    const [loadTrace, setLoadTrace] = useState<string[]>(['idle'])
    const [mutationTrace, setMutationTrace] = useState<string[]>(['idle'])
    const pendingTitleValue = mutationFetcher.formData?.get('title')
    const pendingTitle = typeof pendingTitleValue === 'string' ? pendingTitleValue : '-'
    const isLoadingSuggestions = loadFetcher.state === 'loading'
    const isMutating = mutationFetcher.state !== 'idle'

    useEffect(() => {
      setLoadTrace((currentTrace) => appendState(currentTrace, loadFetcher.state))
    }, [loadFetcher.state])

    useEffect(() => {
      setMutationTrace((currentTrace) => appendState(currentTrace, mutationFetcher.state))
    }, [mutationFetcher.state])

    /** 更新推荐查询输入值。 */
    function handleSuggestionQueryChange(event: React.ChangeEvent<HTMLInputElement>) {
      setSuggestionQuery(event.currentTarget.value)
    }

    /** 在不导航的情况下调用推荐 route loader。 */
    function handleLoadSuggestions() {
      loadFetcher.load('/suggestions?q=' + encodeURIComponent(suggestionQuery))
    }

    /** 清除两个 Fetcher，并重新读取初始任务 loader。 */
    function handleResetDemo() {
      resetDemoState()
      loadFetcher.reset()
      mutationFetcher.reset()
      void router.navigate('/tasks', { replace: true })
    }

    return (
      <section className="fetcher-demo" data-testid="fetcher-demo">
        <header className="fetcher-heading">
          <div>
            <p>Data Router Fetcher</p>
            <h2>任务局部数据工作台</h2>
            <span>局部读取和提交各自跟踪状态，页面地址与全局导航保持稳定。</span>
          </div>
          <div className="fetcher-heading-actions">
            <strong data-testid="fetcher-navigation-state">navigation: {navigation.state}</strong>
            <button type="button" className="fetcher-reset" onClick={handleResetDemo}>
              重置演示
            </button>
          </div>
        </header>

        <dl className="fetcher-global-observer" aria-label="页面状态观察结果">
          <div>
            <dt>current location</dt>
            <dd data-testid="fetcher-location">{location.pathname}</dd>
          </div>
          <div>
            <dt>location key</dt>
            <dd data-testid="fetcher-location-key">{location.key}</dd>
          </div>
          <div>
            <dt>page loader calls</dt>
            <dd data-testid="fetcher-page-loader-count">{data.loaderCalls}</dd>
          </div>
          <div>
            <dt>action calls</dt>
            <dd data-testid="fetcher-action-count">{data.actionCalls}</dd>
          </div>
        </dl>

        <div className="fetcher-workspace">
          <section className="fetcher-panel" aria-busy={isLoadingSuggestions}>
            <div className="fetcher-panel-heading">
              <div>
                <p>fetcher.load</p>
                <h3>按需读取推荐</h3>
              </div>
              <strong data-testid="fetcher-load-state">{loadFetcher.state}</strong>
            </div>

            <div className="fetcher-status" role="status" aria-live="polite">
              <strong>{getLoadMessage(loadFetcher.state)}</strong>
              <span data-testid="fetcher-load-trace">{loadTrace.join(' -> ')}</span>
            </div>

            <div className="fetcher-load-controls">
              <label htmlFor="fetcher-suggestion-query">推荐关键词</label>
              <div>
                <input
                  id="fetcher-suggestion-query"
                  type="search"
                  value={suggestionQuery}
                  onChange={handleSuggestionQueryChange}
                  placeholder="例如：状态"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={handleLoadSuggestions}
                  disabled={isLoadingSuggestions}
                >
                  {isLoadingSuggestions ? '读取中' : '读取推荐'}
                </button>
              </div>
            </div>

            <div className="fetcher-result">
              <div>
                <span>fetcher data</span>
                <strong data-testid="fetcher-load-data-state">
                  {loadFetcher.data ? 'available' : 'undefined'}
                </strong>
              </div>
              {loadFetcher.data ? (
                <>
                  <small data-testid="fetcher-suggestions-loader-count">
                    推荐 loader 调用 {loadFetcher.data.loaderCalls} 次
                  </small>
                  <ul data-testid="fetcher-suggestion-list">
                    {loadFetcher.data.suggestions.map((suggestion) => (
                      <li key={suggestion.id}>{suggestion.title}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>尚未调用目标 loader。</p>
              )}
            </div>
          </section>

          <section className="fetcher-panel" aria-busy={isMutating}>
            <div className="fetcher-panel-heading">
              <div>
                <p>fetcher.Form</p>
                <h3>局部新增任务</h3>
              </div>
              <strong data-testid="fetcher-mutation-state">{mutationFetcher.state}</strong>
            </div>

            <div className="fetcher-status" role="status" aria-live="polite">
              <strong>{getMutationMessage(mutationFetcher.state)}</strong>
              <span data-testid="fetcher-mutation-trace">{mutationTrace.join(' -> ')}</span>
            </div>

            <mutationFetcher.Form method="post" className="fetcher-mutation-form">
              <label htmlFor="fetcher-task-title">任务标题</label>
              <input
                id="fetcher-task-title"
                name="title"
                type="text"
                defaultValue="整理局部提交结果"
                required
                autoComplete="off"
              />
              <button type="submit" disabled={isMutating}>
                {mutationFetcher.state === 'submitting'
                  ? '提交中'
                  : mutationFetcher.state === 'loading'
                    ? '同步中'
                    : '新增任务'}
              </button>
            </mutationFetcher.Form>

            <dl className="fetcher-mutation-observer" aria-label="提交状态观察结果">
              <div>
                <dt>pending title</dt>
                <dd data-testid="fetcher-pending-title">{pendingTitle}</dd>
              </div>
              <div>
                <dt>action data</dt>
                <dd data-testid="fetcher-action-data-state">
                  {mutationFetcher.data ? 'available' : 'undefined'}
                </dd>
              </div>
            </dl>

            <div className="fetcher-action-result">
              {mutationFetcher.data ? (
                <strong data-testid="fetcher-action-message">{mutationFetcher.data.message}</strong>
              ) : (
                <span>action 返回值会保留在当前 Fetcher 的 data 中。</span>
              )}
            </div>
          </section>
        </div>

        <section className="fetcher-task-list">
          <div>
            <p>Revalidated loader data</p>
            <h3>当前任务</h3>
          </div>
          <ol data-testid="fetcher-task-items">
            {data.tasks.map((task) => (
              <li key={task.id}>
                <span>{task.id}</span>
                <strong>{task.title}</strong>
              </li>
            ))}
          </ol>
        </section>
      </section>
    )
  }

  const routes: RouteObject[] = [
    {
      id: 'fetcher-tasks',
      path: '/tasks',
      loader: tasksLoader,
      action: tasksAction,
      Component: TaskWorkspace,
    },
    {
      id: 'fetcher-suggestions',
      path: '/suggestions',
      loader: suggestionsLoader,
    },
  ]
  const router = createMemoryRouter(routes, { initialEntries: ['/tasks'] })

  /** 把独立 Router 交给 Provider，并在真实宿主卸载后释放。 */
  function FetcherDemo() {
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

  return FetcherDemo
}
