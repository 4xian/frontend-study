import { type ComponentType, useEffect, useRef, useState } from 'react'
import {
  createMemoryRouter,
  Form,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
  useNavigationType,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './form-navigation-form-demo.css'

type Task = {
  id: number
  title: string
}

type MutationRecord = {
  method: string
  title: string
}

type TasksData = {
  tasks: Task[]
  actionCalls: number
  loaderCalls: number
  lastMutation: MutationRecord | null
  query: string
  locationSearch: string
}

const initialTasks: readonly Task[] = [
  { id: 1, title: '核对课程来源' },
  { id: 2, title: '整理 loader 数据' },
  { id: 3, title: '练习 Form 导航' },
]

/** 提供可取消的观察延时，并在请求中止时释放计时器。 */
function waitForRequest(signal: AbortSignal, delay: number): Promise<void> {
  return new Promise((resolve, reject) => {
    /** 结束已取消请求的计时工作。 */
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

/** 把 Form 导航状态转换为观察台文案。 */
function getNavigationMessage(state: 'idle' | 'loading' | 'submitting', method?: string): string {
  if (state === 'submitting') return 'POST Form 正在提交到 action'
  if (state === 'loading' && method === 'GET') return 'GET Form 正在重新读取 loader'
  if (state === 'loading') return 'Form 导航完成 action，loader 正在重新读取'
  return 'Form 导航空闲'
}

/** 为每次宿主挂载创建独立的 Form 导航观察台。 */
export function createFormNavigationFormDemo(): ComponentType {
  let tasks = initialTasks.map((task) => ({ ...task }))
  let nextTaskId = tasks.length + 1
  let actionCalls = 0
  let loaderCalls = 0
  let lastMutation: MutationRecord | null = null

  /** 根据当前 URL 查询参数返回任务快照，并为状态观察留出窗口。 */
  async function tasksLoader({ request }: LoaderFunctionArgs): Promise<TasksData> {
    loaderCalls += 1
    if (loaderCalls > 1) await waitForRequest(request.signal, 380)

    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.trim() ?? ''
    const visibleTasks = query
      ? tasks.filter((task) => task.title.toLowerCase().includes(query.toLowerCase()))
      : tasks

    return {
      tasks: visibleTasks.map((task) => ({ ...task })),
      actionCalls,
      loaderCalls,
      lastMutation,
      query,
      locationSearch: url.search,
    }
  }

  /** 从 POST Form 读取一次标题并写入本次 Demo 的内存模型。 */
  async function tasksAction({ request }: ActionFunctionArgs) {
    actionCalls += 1
    const formData = await request.formData()
    const titleValue = formData.get('title')
    if (typeof titleValue !== 'string' || titleValue.trim() === '') return null

    const title = titleValue.trim()
    await waitForRequest(request.signal, 560)
    tasks = [...tasks, { id: nextTaskId, title }]
    nextTaskId += 1
    lastMutation = { method: request.method, title }
    return null
  }

  /** 呈现 GET Form、POST Form 与同一条导航状态管线。 */
  function TaskBoardPage() {
    const data = useLoaderData<typeof tasksLoader>()
    const navigation = useNavigation()
    const location = useLocation()
    const navigate = useNavigate()
    const navigationType = useNavigationType()
    const [stateTrace, setStateTrace] = useState<string[]>(['idle'])
    const navigationMethod = navigation.formMethod
    const isBusy = navigation.state !== 'idle'
    const pendingTitleValue = navigation.formData?.get('title')
    const pendingTitle = typeof pendingTitleValue === 'string' ? pendingTitleValue : '-'

    useEffect(() => {
      setStateTrace((currentTrace) => {
        if (currentTrace.at(-1) === navigation.state) return currentTrace
        return [...currentTrace.slice(-5), navigation.state]
      })
    }, [navigation.state])

    /** 读取可见的当前 URL 与 loader 查询结果。 */
    function getLocationLabel() {
      return `${location.pathname}${location.search}`
    }

    /** 返回内存 history 中的上一条已提交记录。 */
    function handleHistoryBack() {
      void navigate(-1)
    }

    return (
      <section
        className="form-navigation-demo"
        data-testid="form-navigation-demo"
        aria-busy={isBusy}
      >
        <header className="form-navigation-heading">
          <div>
            <p>Data Router Form</p>
            <h2>课程任务检索台</h2>
            <span>GET Form 改变 URL 查询，POST Form 进入 action 并重新读取 loader。</span>
          </div>
          <strong data-testid="form-navigation-state">{navigation.state}</strong>
        </header>

        <div className="form-navigation-status" role="status" aria-live="polite">
          <strong data-testid="form-navigation-message">
            {getNavigationMessage(navigation.state, navigationMethod)}
          </strong>
          <span data-testid="form-navigation-trace">{stateTrace.join(' -> ')}</span>
        </div>

        <div className="form-navigation-forms">
          <Form
            method="get"
            action="/tasks"
            className="form-navigation-filter"
            data-testid="form-navigation-get"
          >
            <label htmlFor="form-navigation-query">按标题筛选</label>
            <div>
              <input
                id="form-navigation-query"
                name="q"
                type="search"
                defaultValue={data.query}
                placeholder="例如：loader"
                autoComplete="off"
              />
              <button type="submit" disabled={isBusy}>
                筛选任务
              </button>
            </div>
            <small>显式 action 指向 /tasks，字段会进入目标 URL 查询。</small>
          </Form>

          <Form method="post" className="form-navigation-create" data-testid="form-navigation-post">
            <label htmlFor="form-navigation-title">新增任务</label>
            <div>
              <input
                id="form-navigation-title"
                name="title"
                type="text"
                placeholder="例如：检查表单 action"
                autoComplete="off"
                required
              />
              <button type="submit" disabled={isBusy}>
                {navigation.state === 'submitting' ? '提交中' : '添加任务'}
              </button>
            </div>
            <small>未指定 action，提交到当前 route 并保留现有查询。</small>
          </Form>
        </div>

        <div className="form-navigation-history">
          <span>GET 默认 PUSH；当前地址的 POST 默认 REPLACE。</span>
          <button type="button" onClick={handleHistoryBack} disabled={isBusy}>
            后退一项
          </button>
        </div>

        <dl className="form-navigation-observer" aria-label="Form 导航观察结果">
          <div>
            <dt>navigation method</dt>
            <dd data-testid="form-navigation-method">{navigationMethod ?? '-'}</dd>
          </div>
          <div>
            <dt>pending title</dt>
            <dd data-testid="form-navigation-pending-title">{pendingTitle}</dd>
          </div>
          <div>
            <dt>current URL</dt>
            <dd data-testid="form-navigation-location">{getLocationLabel()}</dd>
          </div>
          <div>
            <dt>history action</dt>
            <dd data-testid="form-navigation-history-action">{navigationType}</dd>
          </div>
          <div>
            <dt>action calls</dt>
            <dd data-testid="form-navigation-action-count">{data.actionCalls}</dd>
          </div>
          <div>
            <dt>loader calls</dt>
            <dd data-testid="form-navigation-loader-count">{data.loaderCalls}</dd>
          </div>
        </dl>

        <div className="form-navigation-content">
          <section className="form-navigation-list">
            <div>
              <p>Loader data</p>
              <h3>当前任务</h3>
            </div>
            <ol data-testid="form-navigation-task-list">
              {data.tasks.length > 0 ? (
                data.tasks.map((task) => (
                  <li key={task.id}>
                    <span>{task.id}</span>
                    <strong>{task.title}</strong>
                  </li>
                ))
              ) : (
                <li className="form-navigation-empty">没有匹配任务</li>
              )}
            </ol>
          </section>

          <aside className="form-navigation-result">
            <p>最近完成的 Action</p>
            <dl>
              <div>
                <dt>method</dt>
                <dd data-testid="form-navigation-last-method">
                  {data.lastMutation?.method ?? '-'}
                </dd>
              </div>
              <div>
                <dt>title</dt>
                <dd data-testid="form-navigation-last-title">{data.lastMutation?.title ?? '-'}</dd>
              </div>
              <div>
                <dt>loader URL</dt>
                <dd data-testid="form-navigation-loader-url">{data.locationSearch || '-'}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    )
  }

  const routes: RouteObject[] = [
    {
      id: 'form-navigation-tasks',
      path: '/tasks',
      loader: tasksLoader,
      action: tasksAction,
      Component: TaskBoardPage,
    },
  ]
  const router = createMemoryRouter(routes, { initialEntries: ['/tasks'] })

  /** 把独立 Router 交给 Provider，并在真实宿主卸载后释放。 */
  function FormNavigationFormDemo() {
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

  return FormNavigationFormDemo
}
