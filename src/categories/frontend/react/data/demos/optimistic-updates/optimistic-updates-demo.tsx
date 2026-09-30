import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactElement,
} from 'react'

import './optimistic-updates-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type SaveInput = {
  title: string
  shouldFail: boolean
}

type SnapshotResult = {
  previousTasks: TaskItem[] | undefined
}

const taskKeys = {
  list: ['tasks'] as const,
}

const editedTitle = '核对创建任务'

/** 生成 Demo 初始任务。 */
function createInitialTask(): TaskItem {
  return { id: 't-1', title: '现有任务', owner: '林晓' }
}

/** 等待固定时长，让乐观写入和回滚能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 把当前任务读成列表 JSON，失败时抛出带状态码的 Error。 */
async function readTasks(task: TaskItem): Promise<TaskItem[]> {
  await waitForQuery(1400)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify([task]))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem[]
}

/** 观察 onMutate 先改缓存，成功保留，失败用快照回滚。 */
function OptimisticUpdatesPanel(): ReactElement {
  const queryClient = useQueryClient()
  const taskRef = useRef<TaskItem>(createInitialTask())
  const [listCount, setListCount] = useState(0)

  /** 读取任务列表，并统计这次真实请求。 */
  const loadList = useCallback(async () => {
    queueMicrotask(() => {
      setListCount((count) => count + 1)
    })
    return readTasks(taskRef.current)
  }, [])

  const listQuery = useQuery({
    queryKey: taskKeys.list,
    queryFn: loadList,
    staleTime: Infinity,
    retry: false,
  })

  const saveMutation = useMutation({
    mutationFn: async (input: SaveInput) => {
      await waitForQuery(1400)
      if (input.shouldFail) {
        throw new Error('保存失败：HTTP 500')
      }
      const updated: TaskItem = {
        ...taskRef.current,
        title: input.title,
      }
      taskRef.current = updated
      return updated
    },
    retry: false,
    onMutate: async (variables, context) => {
      await context.client.cancelQueries({ queryKey: taskKeys.list })
      const previousTasks = context.client.getQueryData<TaskItem[]>(taskKeys.list)
      context.client.setQueryData<TaskItem[]>(taskKeys.list, (oldData) =>
        oldData
          ? oldData.map((task) => (task.id === 't-1' ? { ...task, title: variables.title } : task))
          : oldData,
      )
      return { previousTasks } satisfies SnapshotResult
    },
    onError: (_error, _variables, onMutateResult, context) => {
      if (onMutateResult?.previousTasks) {
        context.client.setQueryData(taskKeys.list, onMutateResult.previousTasks)
      }
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) =>
      context.client.invalidateQueries({ queryKey: taskKeys.list }),
  })

  const busy = saveMutation.isPending || listQuery.isFetching

  /** 乐观写入新标题，服务端会接受这次修改。 */
  function runSave(): void {
    saveMutation.mutate({ title: editedTitle, shouldFail: false })
  }

  /** 乐观写入新标题，服务端拒绝后按快照回滚。 */
  function runFail(): void {
    saveMutation.mutate({ title: editedTitle, shouldFail: true })
  }

  /** 恢复初始任务并重新读取，清掉计数。 */
  function resetDemo(): void {
    taskRef.current = createInitialTask()
    setListCount(0)
    saveMutation.reset()
    void queryClient.invalidateQueries()
  }

  const listTasks = listQuery.data
  const listTitle = listTasks && listTasks[0] ? listTasks[0].title : '无'
  const owner = listTasks && listTasks[0] ? listTasks[0].owner : '无'

  return (
    <section className="optimistic-updates-demo" data-testid="optimistic-updates-demo">
      <header className="optimistic-updates-header">
        <span>TanStack Query</span>
        <h2>乐观更新与回滚</h2>
        <p>
          点保存后，列表会先换成核对创建任务。成功会作废后再对齐服务端；失败先按快照滚回现有任务。
        </p>
      </header>

      <div className="optimistic-updates-metrics" aria-live="polite">
        <div>
          <span>列表次数</span>
          <strong data-testid="optimistic-list-count">{listCount}</strong>
        </div>
        <div>
          <span>列表标题</span>
          <strong data-testid="optimistic-list-title">{listTitle}</strong>
        </div>
        <div>
          <span>负责人</span>
          <strong data-testid="optimistic-owner">{owner}</strong>
        </div>
        <div>
          <span>mutation</span>
          <strong data-testid="optimistic-mutation-status">{saveMutation.status}</strong>
        </div>
        <div>
          <span>错误</span>
          <strong data-testid="optimistic-error">
            {saveMutation.error instanceof Error ? saveMutation.error.message : '无'}
          </strong>
        </div>
      </div>

      <div className="optimistic-updates-actions">
        <button type="button" data-kind="primary" disabled={busy} onClick={runSave}>
          乐观保存
        </button>
        <button type="button" disabled={busy} onClick={runFail}>
          失败回滚
        </button>
        <button type="button" disabled={busy} onClick={resetDemo}>
          重置
        </button>
      </div>

      <div className="optimistic-updates-columns">
        <section className="optimistic-updates-card">
          <h3>任务列表</h3>
          {listQuery.isPending ? (
            <p className="optimistic-updates-message" role="status">
              正在读取列表。
            </p>
          ) : null}
          {listQuery.isSuccess && listTasks ? (
            <ul data-testid="optimistic-list">
              {listTasks.map((task) => (
                <li key={task.id}>
                  {task.title} / {task.owner}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function OptimisticUpdatesDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <OptimisticUpdatesPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册乐观更新与回滚 Demo。 */
export function createOptimisticUpdatesDemo(): ComponentType {
  return OptimisticUpdatesDemoRoot
}
