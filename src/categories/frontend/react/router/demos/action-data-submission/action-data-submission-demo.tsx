import { type ComponentType, type FormEvent, useEffect, useRef, useState } from 'react'
import {
  createMemoryRouter,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './action-data-submission-demo.css'

type Task = {
  id: number
  title: string
}

type MutationRecord = {
  method: string
  title: string
}

const initialTasks: readonly Task[] = [
  { id: 1, title: '核对课程来源' },
  { id: 2, title: '整理 loader 数据' },
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

/** 把 Router 导航状态转换为观察台文案。 */
function getNavigationMessage(state: 'idle' | 'loading' | 'submitting'): string {
  if (state === 'submitting') return 'Action 正在处理提交'
  if (state === 'loading') return 'Action 已完成，loader 正在重新读取数据'
  return '提交管线空闲'
}

/** 为每次宿主挂载创建独立的 Action 数据提交 Demo。 */
export function createActionDataSubmissionDemo(): ComponentType {
  let tasks = initialTasks.map((task) => ({ ...task }))
  let nextTaskId = tasks.length + 1
  let actionCalls = 0
  let loaderCalls = 0
  let lastMutation: MutationRecord | null = null

  /** 返回当前任务快照，并为 action 后的重新读取留出 loading 窗口。 */
  async function tasksLoader({ request }: LoaderFunctionArgs) {
    loaderCalls += 1
    if (loaderCalls > 1) await waitForRequest(request.signal, 450)

    return {
      tasks: tasks.map((task) => ({ ...task })),
      actionCalls,
      loaderCalls,
      lastMutation,
      requestMethod: request.method,
    }
  }

  /** 从原生 Request 读取一次 FormData，并写入当前 Demo 的内存模型。 */
  async function tasksAction({ request }: ActionFunctionArgs) {
    actionCalls += 1
    const formData = await request.formData()
    const titleValue = formData.get('title')
    if (typeof titleValue !== 'string' || titleValue.trim() === '') return null

    const title = titleValue.trim()
    await waitForRequest(request.signal, 600)
    tasks = [...tasks, { id: nextTaskId, title }]
    nextTaskId += 1
    lastMutation = { method: request.method, title }
    return null
  }

  /** 呈现 submission、action 与 loader revalidation 的同一条状态管线。 */
  function TaskInboxPage() {
    const data = useLoaderData<typeof tasksLoader>()
    const navigation = useNavigation()
    const [stateTrace, setStateTrace] = useState<string[]>(['idle'])
    const isBusy = navigation.state !== 'idle'
    const pendingTitleValue = navigation.formData?.get('title')
    const pendingTitle = typeof pendingTitleValue === 'string' ? pendingTitleValue : '-'

    useEffect(() => {
      setStateTrace((currentTrace) => {
        if (currentTrace.at(-1) === navigation.state) return currentTrace
        return [...currentTrace.slice(-5), navigation.state]
      })
    }, [navigation.state])

    /** 把原生表单字段交给 DataRouter 的 mutation submission。 */
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault()
      const form = event.currentTarget
      const formData = new FormData(form)

      await router.navigate('/tasks', {
        formMethod: 'post',
        formData,
      })
      if (form.isConnected) form.reset()
    }

    return (
      <section
        className="action-submission-demo"
        data-testid="action-submission-demo"
        aria-busy={isBusy}
      >
        <header className="action-submission-heading">
          <div>
            <p>Data Router mutation</p>
            <h2>课程任务收件箱</h2>
            <span>Action 写入内存模型，loader 重新读取后才更新列表。</span>
          </div>
          <strong data-testid="action-submission-state">{navigation.state}</strong>
        </header>

        <div className="action-submission-status" role="status" aria-live="polite">
          <strong data-testid="action-submission-message">
            {getNavigationMessage(navigation.state)}
          </strong>
          <span data-testid="action-submission-trace">{stateTrace.join(' -> ')}</span>
        </div>

        <form className="action-submission-form" onSubmit={handleSubmit}>
          <label htmlFor="action-submission-title">任务标题</label>
          <div>
            <input
              id="action-submission-title"
              name="title"
              type="text"
              placeholder="例如：整理路由笔记"
              autoComplete="off"
              required
            />
            <button type="submit" disabled={isBusy}>
              {navigation.state === 'submitting' ? '提交中' : '添加任务'}
            </button>
          </div>
          <small>教学数据只保存在本次 Demo 挂载期间。</small>
        </form>

        <dl className="action-submission-observer" aria-label="Action 提交观察结果">
          <div>
            <dt>submission method</dt>
            <dd data-testid="action-submission-pending-method">{navigation.formMethod ?? '-'}</dd>
          </div>
          <div>
            <dt>submission title</dt>
            <dd data-testid="action-submission-pending-title">{pendingTitle}</dd>
          </div>
          <div>
            <dt>action calls</dt>
            <dd data-testid="action-submission-action-count">{data.actionCalls}</dd>
          </div>
          <div>
            <dt>loader calls</dt>
            <dd data-testid="action-submission-loader-count">{data.loaderCalls}</dd>
          </div>
        </dl>

        <div className="action-submission-content">
          <section className="action-submission-list">
            <div>
              <p>Revalidated loader data</p>
              <h3>当前任务</h3>
            </div>
            <ol data-testid="action-submission-task-list">
              {data.tasks.map((task) => (
                <li key={task.id}>
                  <span>{task.id}</span>
                  <strong>{task.title}</strong>
                </li>
              ))}
            </ol>
          </section>

          <aside className="action-submission-result">
            <p>最近完成的 Action</p>
            <dl>
              <div>
                <dt>method</dt>
                <dd data-testid="action-submission-last-method">
                  {data.lastMutation?.method ?? '-'}
                </dd>
              </div>
              <div>
                <dt>title</dt>
                <dd data-testid="action-submission-last-title">
                  {data.lastMutation?.title ?? '-'}
                </dd>
              </div>
              <div>
                <dt>loader request</dt>
                <dd data-testid="action-submission-loader-method">{data.requestMethod}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    )
  }

  const routes: RouteObject[] = [
    {
      id: 'action-submission-tasks',
      path: '/tasks',
      loader: tasksLoader,
      action: tasksAction,
      Component: TaskInboxPage,
    },
  ]
  const router = createMemoryRouter(routes, { initialEntries: ['/tasks'] })

  /** 把独立 Router 交给 Provider，并在真实宿主卸载后释放。 */
  function ActionDataSubmissionDemo() {
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

  return ActionDataSubmissionDemo
}
