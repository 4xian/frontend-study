import { type ComponentType, useState } from 'react'
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

import './optimistic-ui-demo.css'

type Task = {
  id: string
  title: string
  done: boolean
}

type TaskListData = {
  tasks: Task[]
  revision: number
  loaderCalls: number
}

type TaskActionResult =
  | { ok: true; taskId: string; done: boolean; message: string }
  | { ok: false; taskId: string; message: string }

const initialTasks: readonly Task[] = [
  { id: 'route-model', title: '画出 route tree 的数据所有权', done: false },
  { id: 'fetcher-state', title: '记录 fetcher 的 submitting 与 loading', done: true },
  { id: 'rollback', title: '验证失败后的乐观状态回滚', done: false },
]

/** 提供可取消的观察延时，让提交和重新验证状态能够被看见。 */
function waitForRequest(signal: AbortSignal, delay: number): Promise<void> {
  return new Promise((resolve, reject) => {
    /** 在请求取消时清理延时并结束当前任务。 */
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

/** 为每次宿主挂载创建独立的任务数据与 Data Router。 */
export function createOptimisticUiDemo(): ComponentType {
  let tasks = initialTasks.map((task) => ({ ...task }))
  let revision = 1
  let loaderCalls = 0

  /** 恢复任务、版本和 loader 计数，方便重复观察同一条流程。 */
  function resetServerState() {
    tasks = initialTasks.map((task) => ({ ...task }))
    revision = 1
    loaderCalls = 0
  }

  /** 返回服务端任务快照，重新验证时保留可观察的 loading 窗口。 */
  async function tasksLoader({ request }: LoaderFunctionArgs): Promise<TaskListData> {
    loaderCalls += 1
    if (loaderCalls > 1) await waitForRequest(request.signal, 520)

    return {
      tasks: tasks.map((task) => ({ ...task })),
      revision,
      loaderCalls,
    }
  }

  /** 写入任务完成状态；失败时不改数据，让乐观 UI 回到 loader 快照。 */
  async function tasksAction({ request }: ActionFunctionArgs): Promise<TaskActionResult> {
    const formData = await request.formData()
    const taskId = String(formData.get('taskId') ?? '')
    const done = formData.get('done') === 'true'
    const shouldFail = formData.get('failure') === 'true'

    await waitForRequest(request.signal, 680)

    const task = tasks.find((candidate) => candidate.id === taskId)
    if (!task) {
      return { ok: false, taskId, message: '任务不存在，乐观状态应回滚。' }
    }

    if (shouldFail) {
      return { ok: false, taskId, message: '服务端拒绝了这次更新，界面已回到原状态。' }
    }

    task.done = done
    revision += 1
    return {
      ok: true,
      taskId,
      done,
      message: `服务端已${done ? '完成' : '恢复'}该任务，loader 将重新验证。`,
    }
  }

  /** 呈现任务列表、全局导航状态与乐观更新观察结果。 */
  function TaskWorkspace() {
    const data = useLoaderData<typeof tasksLoader>()
    const navigation = useNavigation()
    const location = useLocation()
    const [failureMode, setFailureMode] = useState(false)

    /** 清除内存任务并重新读取初始 loader 数据。 */
    function handleReset() {
      resetServerState()
      void router.navigate('/tasks', { replace: true })
    }

    return (
      <section className="optimistic-ui-demo" data-testid="optimistic-ui-demo">
        <header className="optimistic-ui-header">
          <div>
            <p className="optimistic-ui-eyebrow">React Router Data Mode</p>
            <h2>任务完成状态观察台</h2>
            <span>提交尚未完成时先显示预期结果，服务端结果回来后再由 loader 数据接管。</span>
          </div>
          <button type="button" className="optimistic-ui-reset" onClick={handleReset}>
            重置演示
          </button>
        </header>

        <div className="optimistic-ui-observer" role="status" aria-live="polite">
          <span>当前地址</span>
          <code data-testid="optimistic-ui-location">{location.pathname}</code>
          <span>导航</span>
          <code data-testid="optimistic-ui-navigation">{navigation.state}</code>
          <span>loader 调用</span>
          <strong data-testid="optimistic-ui-loader-calls">{data.loaderCalls}</strong>
          <span>数据版本</span>
          <strong data-testid="optimistic-ui-revision">{data.revision}</strong>
        </div>

        <label className="optimistic-ui-failure-toggle">
          <input
            type="checkbox"
            checked={failureMode}
            onChange={(event) => setFailureMode(event.currentTarget.checked)}
          />
          下一次提交模拟失败
        </label>

        <ul className="optimistic-ui-task-list" data-testid="optimistic-ui-task-list">
          {data.tasks.map((task) => (
            <TaskRow key={task.id} task={task} failureMode={failureMode} />
          ))}
        </ul>

        <p className="optimistic-ui-note">
          当前地址保持不变；每一行有自己的 Fetcher，因此一行提交不会锁住其他任务。
        </p>
      </section>
    )
  }

  type TaskRowProps = {
    task: Task
    failureMode: boolean
  }

  /** 用 fetcher.formData 计算 pending 期间的预期状态，并在失败后回到 loader 数据。 */
  function TaskRow({ task, failureMode }: TaskRowProps) {
    const fetcher = useFetcher<TaskActionResult>()
    const pendingDone = fetcher.formData?.get('done')
    const isPending = fetcher.state !== 'idle' && typeof pendingDone === 'string'
    const visibleDone = isPending ? pendingDone === 'true' : task.done
    const result = fetcher.data

    return (
      <li className={visibleDone ? 'is-done' : ''} data-testid={`optimistic-ui-task-${task.id}`}>
        <div className="optimistic-ui-task-copy">
          <strong>{task.title}</strong>
          <span>{isPending ? '正在显示预期结果…' : visibleDone ? '已完成' : '待完成'}</span>
          <small data-testid={`optimistic-ui-state-${task.id}`}>
            fetcher: {fetcher.state} · 来源：{isPending ? 'formData' : 'loader data'}
          </small>
        </div>
        <fetcher.Form method="post" className="optimistic-ui-task-form">
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="done" value={String(!visibleDone)} />
          <input type="hidden" name="failure" value={String(failureMode)} />
          <button type="submit" disabled={isPending}>
            {isPending ? '同步中' : visibleDone ? '标为待完成' : '标为完成'}
          </button>
        </fetcher.Form>
        {result && fetcher.state === 'idle' ? (
          <small
            className={result.ok ? 'optimistic-ui-success' : 'optimistic-ui-error'}
            role="status"
          >
            {result.message}
          </small>
        ) : null}
      </li>
    )
  }

  const routes: RouteObject[] = [
    {
      path: '/tasks',
      loader: tasksLoader,
      action: tasksAction,
      Component: TaskWorkspace,
    },
  ]

  const router = createMemoryRouter(routes, { initialEntries: ['/tasks'] })
  return () => <RouterProvider router={router} />
}
