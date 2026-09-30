import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
  queryOptions,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  Component,
  Suspense,
  useEffect,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from 'react'

import './query-error-boundary-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskStore = {
  allowSuccess: boolean
}

type TaskErrorBoundaryProps = {
  onReset: () => void
  fallbackRender: (args: { error: Error; resetErrorBoundary: () => void }) => ReactNode
  children: ReactNode
}

type TaskErrorBoundaryState = {
  error: Error | null
}

const taskStore: TaskStore = {
  allowSuccess: false,
}

const taskDetail: TaskItem = { id: 't-1', title: '现有任务', owner: '林晓' }

/** 等待固定时长，让 fallback 和错误边界都能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 首次读取返回 503；允许成功后才返回现有任务。 */
async function loadTaskDetail(): Promise<TaskItem> {
  await waitForQuery(1400)
  if (!taskStore.allowSuccess) {
    const response = new Response(JSON.stringify({ message: '任务服务暂不可用' }), {
      status: 503,
      statusText: 'Service Unavailable',
    })
    if (!response.ok) {
      throw new Error(`读取失败：HTTP ${response.status}`)
    }
  }
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(taskDetail))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'] as const,
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  retry: false,
})

/** 成功后直接读 data。 */
function TaskDetailPane(): ReactElement {
  const taskQuery = useSuspenseQuery(taskDetailOptions)
  return (
    <p data-testid="query-error-boundary-task">
      {taskQuery.data.title} / {taskQuery.data.owner}
    </p>
  )
}

/** 重试等待时显示 fallback。 */
function SuspenseFallback(): ReactElement {
  return (
    <p
      className="query-error-boundary-message"
      role="status"
      data-testid="query-error-boundary-fallback"
    >
      正在读取任务。
    </p>
  )
}

/** 捕获查询抛出的错误，并在重置时先通知 Query。 */
class TaskErrorBoundary extends Component<TaskErrorBoundaryProps, TaskErrorBoundaryState> {
  state: TaskErrorBoundaryState = { error: null }

  /** 把后代抛出的错误转成边界状态。 */
  static getDerivedStateFromError(error: Error): TaskErrorBoundaryState {
    return { error }
  }

  /** 先标记查询可以重试，再清掉边界，避免立刻抛出缓存里的同一错误。 */
  resetErrorBoundary = (): void => {
    this.props.onReset()
    this.setState({ error: null })
  }

  /** 有错误时渲染 fallback，否则继续渲染子树。 */
  render(): ReactNode {
    if (this.state.error) {
      return this.props.fallbackRender({
        error: this.state.error,
        resetErrorBoundary: this.resetErrorBoundary,
      })
    }
    return this.props.children
  }
}

/** 对照错误边界与再试一次后的成功结果。 */
function QueryErrorBoundaryPanel({ onReset }: { onReset: () => void }): ReactElement {
  return (
    <section className="query-error-boundary-demo" data-testid="query-error-boundary-demo">
      <header className="query-error-boundary-header">
        <span>TanStack Query</span>
        <h2>Query Error Boundary</h2>
        <p>
          首次没有缓存时失败会抛给错误边界。再试一次必须先 reset 查询，再清掉边界，才会重新请求。
        </p>
      </header>

      <div className="query-error-boundary-actions">
        <button type="button" onClick={onReset}>
          重置
        </button>
      </div>

      <div className="query-error-boundary-columns">
        <section className="query-error-boundary-card">
          <h3>任务详情</h3>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <TaskErrorBoundary
                onReset={reset}
                fallbackRender={({ error, resetErrorBoundary }) => (
                  <div>
                    <p
                      className="query-error-boundary-message"
                      role="alert"
                      data-testid="query-error-boundary-error"
                    >
                      {error.message}
                    </p>
                    <div className="query-error-boundary-actions">
                      <button
                        type="button"
                        data-kind="primary"
                        data-testid="query-error-boundary-retry"
                        onClick={() => {
                          taskStore.allowSuccess = true
                          resetErrorBoundary()
                        }}
                      >
                        再试一次
                      </button>
                    </div>
                  </div>
                )}
              >
                <Suspense fallback={<SuspenseFallback />}>
                  <TaskDetailPane />
                </Suspense>
              </TaskErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </section>
      </div>
    </section>
  )
}

/** 客户端放在会挂起和抛错的树外面。 */
function QueryErrorBoundarySession({ onReset }: { onReset: () => void }): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    taskStore.allowSuccess = false
    return () => {
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorBoundaryPanel onReset={onReset} />
    </QueryClientProvider>
  )
}

/** 为课程页面注册 Query Error Boundary Demo。 */
export function createQueryErrorBoundaryDemo(): ComponentType {
  /** 重置时整段重挂，并恢复成首次失败。 */
  function QueryErrorBoundaryDemoRoot(): ReactElement {
    const [session, setSession] = useState(0)

    /** 丢弃当前缓存和边界，下一次再走 503。 */
    function resetDemo(): void {
      taskStore.allowSuccess = false
      setSession((current) => current + 1)
    }

    return <QueryErrorBoundarySession key={session} onReset={resetDemo} />
  }

  return QueryErrorBoundaryDemoRoot
}
