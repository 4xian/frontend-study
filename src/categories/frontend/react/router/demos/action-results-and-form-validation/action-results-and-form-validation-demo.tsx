import { type ComponentType, useEffect, useRef } from 'react'
import {
  createMemoryRouter,
  data,
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './action-results-and-form-validation-demo.css'

type Task = {
  id: number
  title: string
  owner: string
}

type ActionResult =
  | {
      ok: false
      fieldErrors: {
        title?: string
        owner?: string
      }
      values: {
        title: string
        owner: string
      }
      actionCalls: number
    }
  | {
      ok: true
      message: string
      taskTitle: string
      actionCalls: number
    }

type TasksData = {
  tasks: Task[]
  actionCalls: number
  loaderCalls: number
}

const initialTasks: readonly Task[] = [
  { id: 1, title: '核对课程来源', owner: '课程组' },
  { id: 2, title: '整理 loader 数据', owner: '课程组' },
]

/** 提供可取消的观察延时，并在请求中止时释放计时器。 */
function waitForRequest(signal: AbortSignal, delay: number): Promise<void> {
  return new Promise((resolve, reject) => {
    /** 在请求中止时清理计时器。 */
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

/** 把 Action 结果转换为当前观察台的状态文案。 */
function getActionMessage(result: ActionResult | undefined): string {
  if (!result) return '尚未发生 POST Action，action data 为 undefined'
  if (!result.ok) return 'Action 返回字段错误，内存任务列表保持不变'
  return result.message
}

/** 把当前挂载隔离为一套独立的 action、loader 和 Memory Router。 */
export function createActionResultsAndFormValidationDemo(): ComponentType {
  let tasks = initialTasks.map((task) => ({ ...task }))
  let nextTaskId = tasks.length + 1
  let actionCalls = 0
  let loaderCalls = 0

  /** 读取内存任务快照，并让成功提交出现 loader loading 窗口。 */
  async function tasksLoader({ request }: LoaderFunctionArgs): Promise<TasksData> {
    loaderCalls += 1
    if (loaderCalls > 1) await waitForRequest(request.signal, 420)

    return {
      tasks: tasks.map((task) => ({ ...task })),
      actionCalls,
      loaderCalls,
    }
  }

  /** 读取一次 FormData，返回校验结果或写入成功结果。 */
  async function tasksAction({ request }: ActionFunctionArgs) {
    actionCalls += 1
    const formData = await request.formData()
    const titleValue = formData.get('title')
    const ownerValue = formData.get('owner')
    const title = typeof titleValue === 'string' ? titleValue.trim() : ''
    const owner = typeof ownerValue === 'string' ? ownerValue.trim() : ''
    const fieldErrors: NonNullable<Extract<ActionResult, { ok: false }>['fieldErrors']> = {}

    if (title.length < 3) fieldErrors.title = '标题至少需要 3 个字符。'
    if (owner.length === 0) fieldErrors.owner = '请填写负责人。'

    if (Object.keys(fieldErrors).length > 0) {
      const validationResult: Extract<ActionResult, { ok: false }> = {
        ok: false,
        fieldErrors,
        values: { title, owner },
        actionCalls,
      }
      return data(validationResult, { status: 400 })
    }

    await waitForRequest(request.signal, 560)
    tasks = [...tasks, { id: nextTaskId, title, owner }]
    nextTaskId += 1

    const successResult: Extract<ActionResult, { ok: true }> = {
      ok: true,
      message: `已创建任务“${title}”，loader 将重新读取列表。`,
      taskTitle: title,
      actionCalls,
    }
    return successResult
  }

  /** 呈现原生 Form、action data、pending 状态和 revalidated loader data。 */
  function TaskWorkspace() {
    const data = useLoaderData<typeof tasksLoader>()
    const actionData = useActionData<typeof tasksAction>() as ActionResult | undefined
    const navigation = useNavigation()
    const isBusy = navigation.state !== 'idle'
    const pendingTitleValue = navigation.formData?.get('title')
    const pendingTitle = typeof pendingTitleValue === 'string' ? pendingTitleValue : '-'
    const values = actionData?.ok === false ? actionData.values : undefined
    const titleError = actionData?.ok === false ? actionData.fieldErrors.title : undefined
    const ownerError = actionData?.ok === false ? actionData.fieldErrors.owner : undefined

    return (
      <section
        className="action-validation-demo"
        data-testid="action-validation-demo"
        aria-busy={isBusy}
      >
        <header className="action-validation-heading">
          <div>
            <p>Data Router action result</p>
            <h2>课程任务校验台</h2>
            <span>无效结果只回填表单；成功结果才写入，列表由 loader 重新读取。</span>
          </div>
          <strong data-testid="action-validation-state">{navigation.state}</strong>
        </header>

        <div className="action-validation-status" role="status" aria-live="polite">
          <strong data-testid="action-validation-message">{getActionMessage(actionData)}</strong>
          <span data-testid="action-validation-result-kind">
            {actionData ? (actionData.ok ? 'success result' : 'validation result') : 'undefined'}
          </span>
        </div>

        <Form className="action-validation-form" method="post">
          <div className="action-validation-field">
            <label htmlFor="action-validation-title">任务标题</label>
            <input
              id="action-validation-title"
              name="title"
              type="text"
              defaultValue={values?.title ?? ''}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? 'action-validation-title-error' : undefined}
              placeholder="例如：整理路由笔记"
              autoComplete="off"
            />
            {titleError ? (
              <span id="action-validation-title-error" className="action-validation-error">
                {titleError}
              </span>
            ) : null}
          </div>

          <div className="action-validation-field">
            <label htmlFor="action-validation-owner">负责人</label>
            <input
              id="action-validation-owner"
              name="owner"
              type="text"
              defaultValue={values?.owner ?? ''}
              aria-invalid={Boolean(ownerError)}
              aria-describedby={ownerError ? 'action-validation-owner-error' : undefined}
              placeholder="例如：课程组"
              autoComplete="off"
            />
            {ownerError ? (
              <span id="action-validation-owner-error" className="action-validation-error">
                {ownerError}
              </span>
            ) : null}
          </div>

          <button type="submit" disabled={isBusy}>
            {navigation.state === 'submitting' ? '校验中' : '提交任务'}
          </button>
          <small>提交期间可在下方观察 action data、pending 字段和 loader 调用次数。</small>
        </Form>

        <dl className="action-validation-observer" aria-label="Action 结果观察结果">
          <div>
            <dt>action data</dt>
            <dd data-testid="action-validation-result-kind-secondary">
              {actionData ? (actionData.ok ? 'success' : 'field-errors') : 'undefined'}
            </dd>
          </div>
          <div>
            <dt>pending title</dt>
            <dd data-testid="action-validation-pending-title">{pendingTitle}</dd>
          </div>
          <div>
            <dt>action calls</dt>
            <dd data-testid="action-validation-action-count">
              {actionData?.actionCalls ?? data.actionCalls}
            </dd>
          </div>
          <div>
            <dt>loader calls</dt>
            <dd data-testid="action-validation-loader-count">{data.loaderCalls}</dd>
          </div>
        </dl>

        <div className="action-validation-content">
          <section className="action-validation-list">
            <div>
              <p>Revalidated loader data</p>
              <h3>当前任务</h3>
            </div>
            <ol data-testid="action-validation-task-list">
              {data.tasks.map((task) => (
                <li key={task.id}>
                  <span>{task.id}</span>
                  <div>
                    <strong>{task.title}</strong>
                    <small>{task.owner}</small>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <aside className="action-validation-result">
            <p>最近 Action 结果</p>
            {actionData?.ok ? (
              <strong data-testid="action-validation-success">{actionData.message}</strong>
            ) : (
              <span data-testid="action-validation-boundary">
                {actionData?.ok === false
                  ? '字段错误停留在当前 route component。'
                  : '提交后结果会在这里出现。'}
              </span>
            )}
          </aside>
        </div>
      </section>
    )
  }

  const routes: RouteObject[] = [
    {
      id: 'action-results-tasks',
      path: '/tasks',
      loader: tasksLoader,
      action: tasksAction,
      Component: TaskWorkspace,
    },
  ]
  const router = createMemoryRouter(routes, { initialEntries: ['/tasks'] })

  /** 把独立 Router 交给 Provider，并在真实宿主卸载后释放。 */
  function ActionResultsAndFormValidationDemo() {
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

  return ActionResultsAndFormValidationDemo
}
