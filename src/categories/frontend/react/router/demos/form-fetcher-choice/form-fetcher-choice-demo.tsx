import { type ComponentType, useEffect, useRef, useState } from 'react'
import {
  createMemoryRouter,
  Form,
  Link,
  Outlet,
  redirect,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
  useNavigationType,
  useOutletContext,
  useParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './form-fetcher-choice-demo.css'

type Task = {
  id: number
  title: string
  starred: boolean
}

type TasksData = {
  tasks: Task[]
  query: string
  loaderCalls: number
  actionCalls: number
}

type ActionResult = {
  ok: true
  taskId: number
  taskTitle: string
  message: string
  actionCalls: number
}

type PreviewData = {
  task: Task | null
  loaderCalls: number
}

type DetailData = {
  task: Task | null
}

type ChoiceLayoutContext = {
  resetVersion: number
}

const initialTasks: readonly Task[] = [
  { id: 1, title: '保留筛选条件在 URL', starred: false },
  { id: 2, title: '比较 Form 与 Fetcher 的 pending', starred: false },
  { id: 3, title: '确认 action 后的 loader revalidation', starred: false },
]

/** 提供可取消的观察延时，让导航和局部提交状态有可见窗口。 */
function waitForRequest(signal: AbortSignal, delay: number): Promise<void> {
  return new Promise((resolve, reject) => {
    /** 取消请求时释放计时器并结束本次等待。 */
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

/** 只在状态变化时追加记录，避免重复刷屏。 */
function appendState(trace: string[], state: string): string[] {
  if (trace.at(-1) === state) return trace
  return [...trace, state]
}

/** 把导航携带的表单字段转换为可读文本。 */
function formatFormData(formData: FormData | undefined): string {
  if (!formData) return '-'

  const entries = Array.from(formData.entries()).map(([name, value]) => {
    const displayValue = typeof value === 'string' ? value : value.name
    return `${name}=${displayValue}`
  })

  return entries.length > 0 ? entries.join('&') : '(empty)'
}

/** 把全局导航状态转换为 Form 选择反馈。 */
function getFormMessage(state: 'idle' | 'loading' | 'submitting'): string {
  if (state === 'loading') return 'Form 正在导航并重新读取页面数据'
  if (state === 'submitting') return 'Form 正在提交页面意图'
  return 'Form 导航空闲'
}

/** 把局部 Fetcher 状态转换为行内交互反馈。 */
function getFetcherMessage(state: 'idle' | 'loading' | 'submitting'): string {
  if (state === 'submitting') return 'Fetcher 正在提交行内 action'
  if (state === 'loading') return 'Fetcher action 已完成，页面 loader 正在重新验证'
  return 'Fetcher 局部交互空闲'
}

/** 为每次宿主挂载创建独立的任务模型与 Data Router。 */
export function createFormFetcherChoiceDemo(): ComponentType {
  let tasks = initialTasks.map((task) => ({ ...task }))
  let loaderCalls = 0
  let actionCalls = 0
  let previewLoaderCalls = 0

  /** 根据 URL 查询返回任务快照，并记录页面 loader 执行次数。 */
  async function tasksLoader({ request }: LoaderFunctionArgs): Promise<TasksData> {
    loaderCalls += 1
    if (loaderCalls > 1) await waitForRequest(request.signal, 420)

    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.trim().toLowerCase() ?? ''
    const visibleTasks = query
      ? tasks.filter((task) => task.title.toLowerCase().includes(query))
      : tasks

    return {
      tasks: visibleTasks.map((task) => ({ ...task })),
      query,
      loaderCalls,
      actionCalls,
    }
  }

  /** 处理 Fetcher 的行内收藏 action，返回只属于 Fetcher 的结果。 */
  async function tasksAction({ request }: ActionFunctionArgs): Promise<ActionResult> {
    actionCalls += 1
    const formData = await request.formData()
    const taskIdValue = formData.get('taskId')
    const taskId = typeof taskIdValue === 'string' ? Number(taskIdValue) : NaN
    const task = tasks.find((item) => item.id === taskId)

    await waitForRequest(request.signal, 560)

    if (!task) {
      return {
        ok: true,
        taskId,
        taskTitle: '未知任务',
        message: '没有找到可收藏的任务。',
        actionCalls,
      }
    }

    tasks = tasks.map((item) => (item.id === taskId ? { ...item, starred: !item.starred } : item))

    return {
      ok: true,
      taskId,
      taskTitle: task.title,
      message: `${task.starred ? '已取消收藏' : '已收藏'}：${task.title}`,
      actionCalls,
    }
  }

  /** 读取一个任务详情，供 Link 导航后的页面消费。 */
  async function taskDetailLoader({ params, request }: LoaderFunctionArgs): Promise<DetailData> {
    await waitForRequest(request.signal, 300)
    const taskId = Number(params.taskId)
    return { task: tasks.find((item) => item.id === taskId) ?? null }
  }

  /** 读取一个局部预览，结果只写入 Preview Fetcher。 */
  async function taskPreviewLoader({ params, request }: LoaderFunctionArgs): Promise<PreviewData> {
    previewLoaderCalls += 1
    await waitForRequest(request.signal, 360)
    const taskId = Number(params.taskId)
    return {
      task: tasks.find((item) => item.id === taskId) ?? null,
      loaderCalls: previewLoaderCalls,
    }
  }

  /** 处理页面级新增并 redirect 到新任务上下文。 */
  async function createTaskAction({ request }: ActionFunctionArgs) {
    const formData = await request.formData()
    const titleValue = formData.get('title')
    const title = typeof titleValue === 'string' ? titleValue.trim() : ''
    await waitForRequest(request.signal, 520)
    const task = { id: tasks.length + 1, title: title || '未命名任务', starred: false }
    tasks = [...tasks, task]
    return redirect(`/tasks/${task.id}`)
  }

  /** 触发一个显式 redirect，用来展示 Fetcher 的普通成功例外。 */
  async function redirectAction({ request }: ActionFunctionArgs) {
    await waitForRequest(request.signal, 260)
    return redirect('/tasks?redirect=1')
  }

  /** 在子页面切换期间持续保留导航上下文与完整状态序列。 */
  function ChoiceLayout() {
    const navigation = useNavigation()
    const location = useLocation()
    const navigationType = useNavigationType()
    const navigate = useNavigate()
    const [navigationTrace, setNavigationTrace] = useState<string[]>(['idle'])
    const [resetVersion, setResetVersion] = useState(0)

    useEffect(() => {
      setNavigationTrace((currentTrace) => appendState(currentTrace, navigation.state))
    }, [navigation.state])

    /** 清空内存模型和观察记录，并回到无查询的页面入口。 */
    function handleReset() {
      tasks = initialTasks.map((task) => ({ ...task }))
      loaderCalls = 0
      actionCalls = 0
      previewLoaderCalls = 0
      setNavigationTrace(['idle'])
      setResetVersion((currentVersion) => currentVersion + 1)
      void navigate('/tasks', { replace: true })
    }

    return (
      <section className="form-fetcher-choice-demo" data-testid="form-fetcher-choice-demo">
        <header className="form-fetcher-choice-heading">
          <div>
            <p>Data Router 选择实验室</p>
            <h2>Form 与 Fetcher 选择</h2>
            <span>页面意图进入导航，行内意图保留在当前页面。</span>
          </div>
          <div className="form-fetcher-choice-heading-actions">
            <strong data-testid="form-fetcher-navigation-state">
              navigation: {navigation.state}
            </strong>
            <button type="button" onClick={handleReset} disabled={navigation.state !== 'idle'}>
              重置演示
            </button>
          </div>
        </header>

        <dl className="form-fetcher-choice-observer" aria-label="导航上下文观察">
          <div>
            <dt>final location</dt>
            <dd data-testid="form-fetcher-location">{location.pathname + location.search}</dd>
          </div>
          <div>
            <dt>location key</dt>
            <dd data-testid="form-fetcher-location-key">{location.key}</dd>
          </div>
          <div>
            <dt>history action</dt>
            <dd data-testid="form-fetcher-history-action">{navigationType}</dd>
          </div>
          <div>
            <dt>navigation target</dt>
            <dd data-testid="form-fetcher-navigation-target">
              {navigation.location
                ? navigation.location.pathname + navigation.location.search
                : '-'}
            </dd>
          </div>
          <div>
            <dt>pending FormData</dt>
            <dd data-testid="form-fetcher-navigation-form-data">
              {formatFormData(navigation.formData)}
            </dd>
          </div>
          <div>
            <dt>navigation state trace</dt>
            <dd data-testid="form-fetcher-navigation-trace">{navigationTrace.join(' -> ')}</dd>
          </div>
        </dl>

        <Outlet context={{ resetVersion } satisfies ChoiceLayoutContext} />
      </section>
    )
  }

  /** 呈现同一 route 上的 Form 导航与 Fetcher 局部交互。 */
  function DecisionWorkspace() {
    const data = useLoaderData<typeof tasksLoader>()
    const navigation = useNavigation()
    const favoriteFetcher = useFetcher<typeof tasksAction>()
    const previewFetcher = useFetcher<typeof taskPreviewLoader>()
    const redirectFetcher = useFetcher<typeof redirectAction>()
    const navigate = useNavigate()
    const { resetVersion } = useOutletContext<ChoiceLayoutContext>()
    const [formTrace, setFormTrace] = useState<string[]>(['idle'])
    const [fetcherTrace, setFetcherTrace] = useState<string[]>(['idle'])
    const [queryInput, setQueryInput] = useState(data.query)
    const formBusy = navigation.state !== 'idle'
    const fetcherBusy = favoriteFetcher.state !== 'idle'
    const targetTask = data.tasks.at(0) ?? initialTasks.at(0)!
    const targetIsStarred = data.tasks.find((task) => task.id === targetTask.id)?.starred ?? false

    useEffect(() => {
      setFormTrace((currentTrace) => appendState(currentTrace, navigation.state))
    }, [navigation.state])

    useEffect(() => {
      setFetcherTrace((currentTrace) => appendState(currentTrace, favoriteFetcher.state))
    }, [favoriteFetcher.state])

    useEffect(() => {
      setQueryInput(data.query)
    }, [data.query])

    useEffect(() => {
      favoriteFetcher.reset()
      previewFetcher.reset()
      redirectFetcher.reset()
      setQueryInput('')
      setFormTrace(['idle'])
      setFetcherTrace(['idle'])
    }, [resetVersion])

    return (
      <>
        <dl className="form-fetcher-choice-observer" aria-label="数据调用观察">
          <div>
            <dt>page loader calls</dt>
            <dd data-testid="form-fetcher-loader-count">{data.loaderCalls}</dd>
          </div>
          <div>
            <dt>action calls</dt>
            <dd data-testid="form-fetcher-action-count">{data.actionCalls}</dd>
          </div>
        </dl>

        <div className="form-fetcher-choice-panels">
          <section className="form-fetcher-choice-panel form-choice-panel" aria-busy={formBusy}>
            <div className="form-fetcher-choice-panel-heading">
              <div>
                <p>Form</p>
                <h3>筛选是页面意图</h3>
              </div>
              <strong data-testid="form-choice-state">{navigation.state}</strong>
            </div>
            <div className="form-fetcher-choice-status" role="status" aria-live="polite">
              <strong>{getFormMessage(navigation.state)}</strong>
              <span data-testid="form-choice-trace">{formTrace.join(' -> ')}</span>
            </div>
            <Form method="get" action="/tasks" className="form-fetcher-choice-form">
              <label htmlFor="form-fetcher-choice-query">任务关键词</label>
              <div>
                <input
                  id="form-fetcher-choice-query"
                  name="q"
                  type="search"
                  value={queryInput}
                  onChange={(event) => setQueryInput(event.currentTarget.value)}
                  placeholder="例如：页面"
                  autoComplete="off"
                />
                <button type="submit" disabled={formBusy}>
                  筛选任务
                </button>
              </div>
            </Form>
            <p className="form-fetcher-choice-explanation">
              GET Form 更新 URL，适合可分享、可刷新、可回退的页面条件。
            </p>
            <Form
              method="post"
              action="/tasks/new"
              className="form-fetcher-choice-form form-create-choice-form"
            >
              <label htmlFor="form-fetcher-choice-title">页面级新增</label>
              <div>
                <input
                  id="form-fetcher-choice-title"
                  name="title"
                  type="text"
                  defaultValue="进入新的任务上下文"
                  required
                  autoComplete="off"
                />
                <button type="submit" disabled={formBusy}>
                  {navigation.state === 'submitting' ? '提交中' : '创建并导航'}
                </button>
              </div>
            </Form>
            <Link className="form-fetcher-choice-link" to={`/tasks/${targetTask.id}`}>
              Link：打开当前任务详情
            </Link>
            <button
              type="button"
              className="form-fetcher-choice-navigate"
              onClick={() => void navigate(`/tasks/${targetTask.id}`)}
              disabled={formBusy}
            >
              useNavigate：打开详情
            </button>
          </section>

          <section
            className="form-fetcher-choice-panel fetcher-choice-panel"
            aria-busy={fetcherBusy}
          >
            <div className="form-fetcher-choice-panel-heading">
              <div>
                <p>Fetcher</p>
                <h3>收藏是局部意图</h3>
              </div>
              <strong data-testid="fetcher-choice-state">{favoriteFetcher.state}</strong>
            </div>
            <div className="form-fetcher-choice-status" role="status" aria-live="polite">
              <strong>{getFetcherMessage(favoriteFetcher.state)}</strong>
              <span data-testid="fetcher-choice-trace">{fetcherTrace.join(' -> ')}</span>
            </div>
            <favoriteFetcher.Form
              method="post"
              action="/tasks"
              className="form-fetcher-choice-form"
            >
              <input type="hidden" name="taskId" value={targetTask.id} readOnly />
              <button type="submit" disabled={fetcherBusy}>
                {fetcherBusy ? '保存中' : targetIsStarred ? '取消收藏' : '收藏当前任务'}
              </button>
            </favoriteFetcher.Form>
            <p className="form-fetcher-choice-explanation">
              Fetcher 不改变 location，适合行内保存、预览和局部反馈；action 后页面 loader
              仍会重新验证。
            </p>
            <div className="form-fetcher-choice-result">
              <span>fetcher data</span>
              <strong data-testid="fetcher-choice-data-state">
                {favoriteFetcher.data ? 'available' : 'undefined'}
              </strong>
              {favoriteFetcher.data ? (
                <small data-testid="fetcher-choice-message">{favoriteFetcher.data.message}</small>
              ) : null}
            </div>
            <div className="form-fetcher-choice-preview">
              <strong>局部预览</strong>
              <button
                type="button"
                onClick={() => previewFetcher.load(`/tasks/preview/${targetTask.id}`)}
                disabled={previewFetcher.state !== 'idle'}
              >
                {previewFetcher.state === 'loading' ? '读取中' : '读取预览'}
              </button>
              <span data-testid="fetcher-preview-state">{previewFetcher.state}</span>
              <small data-testid="fetcher-preview-data">
                {previewFetcher.data?.task
                  ? `${previewFetcher.data.task.title}（loader ${previewFetcher.data.loaderCalls} 次）`
                  : '尚未读取局部预览'}
              </small>
            </div>
            <redirectFetcher.Form
              method="post"
              action="/tasks/redirect"
              className="form-fetcher-choice-redirect"
            >
              <button type="submit" disabled={redirectFetcher.state !== 'idle'}>
                {redirectFetcher.state === 'idle' ? '演示 redirect 例外' : 'redirect 中'}
              </button>
              <small>普通 Fetcher 不导航；目标返回 redirect 时会进入导航。</small>
            </redirectFetcher.Form>
          </section>
        </div>

        <section className="form-fetcher-choice-tasks">
          <div>
            <p>Loader data</p>
            <h3>当前任务</h3>
          </div>
          <ol data-testid="form-fetcher-task-list">
            {data.tasks.length > 0 ? (
              data.tasks.map((task) => (
                <li key={task.id}>
                  <span>{task.id}</span>
                  <strong>
                    {task.starred ? '★ ' : ''}
                    {task.title}
                  </strong>
                  <Link to={`/tasks/${task.id}`}>详情</Link>
                </li>
              ))
            ) : (
              <li>没有匹配任务</li>
            )}
          </ol>
        </section>
      </>
    )
  }

  /** 呈现 Link、Form redirect 或 useNavigate 到达的任务详情页面。 */
  function TaskDetailPage() {
    const data = useLoaderData<typeof taskDetailLoader>()
    const navigate = useNavigate()
    const params = useParams()

    return (
      <section className="form-fetcher-choice-detail" data-testid="form-fetcher-choice-detail">
        <p>页面级导航结果</p>
        <h2>任务详情：{data.task?.title ?? `任务 ${params.taskId ?? '-'}`}</h2>
        <span>这里是 Form、Link 或 useNavigate 进入的新页面上下文。</span>
        <div>
          <Link to="/tasks">Link：返回任务列表</Link>
          <button type="button" onClick={() => void navigate('/tasks')}>
            useNavigate：返回列表
          </button>
        </div>
      </section>
    )
  }

  const routes: RouteObject[] = [
    {
      id: 'form-fetcher-choice-layout',
      path: '/',
      Component: ChoiceLayout,
      children: [
        {
          id: 'form-fetcher-choice-tasks',
          path: 'tasks',
          loader: tasksLoader,
          action: tasksAction,
          Component: DecisionWorkspace,
        },
        {
          id: 'form-fetcher-choice-detail',
          path: 'tasks/:taskId',
          loader: taskDetailLoader,
          Component: TaskDetailPage,
        },
        {
          id: 'form-fetcher-choice-new',
          path: 'tasks/new',
          action: createTaskAction,
        },
        {
          id: 'form-fetcher-choice-preview',
          path: 'tasks/preview/:taskId',
          loader: taskPreviewLoader,
        },
        {
          id: 'form-fetcher-choice-redirect',
          path: 'tasks/redirect',
          action: redirectAction,
        },
      ],
    },
  ]
  const router = createMemoryRouter(routes, { initialEntries: ['/tasks'] })

  /** 把独立 Router 交给 Provider，并在真实宿主卸载后释放。 */
  function FormFetcherChoiceDemo() {
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

  return FormFetcherChoiceDemo
}
