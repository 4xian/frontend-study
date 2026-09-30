import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './use-mutation-demo.css'

type CreatedTask = {
  id: string
  title: string
  owner: string
}

const successTask: CreatedTask = {
  id: 't-901',
  title: '核对创建任务',
  owner: '林晓',
}

const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(successTask))}`

/** 等待固定时长，让 idle、pending、success、error 能被看清。 */
function waitForMutation(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 创建任务；失败路径抛出错误，成功路径返回林晓的任务。 */
async function createTask(shouldFail: boolean): Promise<CreatedTask> {
  await waitForMutation(1400)
  if (shouldFail) {
    throw new Error('任务创建失败：HTTP 404')
  }
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`任务创建失败：HTTP ${response.status}`)
  }
  return (await response.json()) as CreatedTask
}

/** 观察 mutate 触发写入后的四种状态，以及 reset 清掉结果。 */
function UseMutationPanel(): ReactElement {
  const [shouldFail, setShouldFail] = useState(false)
  const [requestCount, setRequestCount] = useState(0)

  /** 统计每次真实请求，避免在渲染期间同步更新次数。 */
  const createObservedTask = useCallback(async () => {
    queueMicrotask(() => {
      setRequestCount((count) => count + 1)
    })
    return createTask(shouldFail)
  }, [shouldFail])

  const taskMutation = useMutation({
    mutationFn: createObservedTask,
    retry: false,
  })

  /** 用 mutate 触发一次创建，不处理返回的 Promise。 */
  function runMutate(): void {
    taskMutation.mutate()
  }

  /** 用 mutateAsync 等待这次创建，失败时只读 mutation.error。 */
  async function runMutateAsync(): Promise<void> {
    try {
      await taskMutation.mutateAsync()
    } catch {
      return
    }
  }

  /** 切到失败路径，让下一次创建走进 error。 */
  function selectFailure(): void {
    setShouldFail(true)
  }

  /** 切回成功路径，让下一次创建走进 success。 */
  function selectSuccess(): void {
    setShouldFail(false)
  }

  /** 清掉这次 mutation 的 data 和 error，回到 idle。 */
  function resetMutation(): void {
    taskMutation.reset()
    setRequestCount(0)
  }

  const createdTask = taskMutation.data
  const canSubmit = !taskMutation.isPending

  return (
    <section className="use-mutation-demo" data-testid="use-mutation-demo">
      <header className="use-mutation-header">
        <span>TanStack Query</span>
        <h2>useMutation</h2>
        <p>
          点创建任务后才会请求。默认成功返回林晓；改成失败路径后会进入 error。reset 会清掉结果，回到
          idle。
        </p>
      </header>

      <div className="use-mutation-metrics" aria-live="polite">
        <div>
          <span>请求次数</span>
          <strong data-testid="use-mutation-count">{requestCount}</strong>
        </div>
        <div>
          <span>status</span>
          <strong data-testid="use-mutation-status">{taskMutation.status}</strong>
        </div>
        <div>
          <span>isIdle</span>
          <strong data-testid="use-mutation-idle">{String(taskMutation.isIdle)}</strong>
        </div>
        <div>
          <span>isPending</span>
          <strong data-testid="use-mutation-pending">{String(taskMutation.isPending)}</strong>
        </div>
        <div>
          <span>isSuccess</span>
          <strong data-testid="use-mutation-success">{String(taskMutation.isSuccess)}</strong>
        </div>
        <div>
          <span>isError</span>
          <strong data-testid="use-mutation-error">{String(taskMutation.isError)}</strong>
        </div>
        <div>
          <span>data</span>
          <strong data-testid="use-mutation-data">{createdTask ? createdTask.owner : '无'}</strong>
        </div>
        <div>
          <span>error</span>
          <strong data-testid="use-mutation-error-message">
            {taskMutation.error ? taskMutation.error.message : '无'}
          </strong>
        </div>
      </div>

      <div className="use-mutation-actions">
        <button type="button" data-kind="primary" disabled={!canSubmit} onClick={runMutate}>
          创建任务
        </button>
        <button type="button" disabled={!canSubmit} onClick={() => void runMutateAsync()}>
          用 mutateAsync 创建
        </button>
        <button type="button" disabled={taskMutation.isPending} onClick={selectSuccess}>
          成功路径
        </button>
        <button type="button" disabled={taskMutation.isPending} onClick={selectFailure}>
          失败路径
        </button>
        <button type="button" disabled={taskMutation.isPending} onClick={resetMutation}>
          重置
        </button>
      </div>

      <div className="use-mutation-columns">
        <section className="use-mutation-card">
          <h3>当前观察</h3>
          {taskMutation.isIdle && (
            <p className="use-mutation-message" role="status">
              还没有点创建。mutation 停在 idle，不会自动请求。
            </p>
          )}
          {taskMutation.isPending && (
            <p className="use-mutation-message" role="status">
              mutationFn 正在跑。按钮先停住，避免连点。
            </p>
          )}
          {taskMutation.isSuccess && (
            <p className="use-mutation-message" role="status">
              创建成功。data 是林晓那条任务。reset 会清掉这份结果。
            </p>
          )}
          {taskMutation.isError && (
            <p className="use-mutation-message" role="status">
              创建失败。error 里有状态码。默认不会自动重试。
            </p>
          )}
        </section>
        <section className="use-mutation-card" data-testid="use-mutation-result">
          <h3>这次写入</h3>
          {taskMutation.isIdle && (
            <p className="use-mutation-message" role="status">
              还没有可显示的任务。
            </p>
          )}
          {taskMutation.isPending && (
            <p className="use-mutation-message" role="status">
              正在创建任务。
            </p>
          )}
          {taskMutation.isSuccess && createdTask && (
            <ul data-testid="use-mutation-task-list">
              <li>
                {createdTask.title} / {createdTask.owner}
              </li>
            </ul>
          )}
          {taskMutation.isError && (
            <p className="use-mutation-message" role="status">
              {taskMutation.error.message}
            </p>
          )}
        </section>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function UseMutationDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <UseMutationPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册 useMutation Demo。 */
export function createUseMutationDemo(): ComponentType {
  return UseMutationDemoRoot
}
