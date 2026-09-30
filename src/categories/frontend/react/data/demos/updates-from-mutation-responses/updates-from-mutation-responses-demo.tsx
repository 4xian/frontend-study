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

import './updates-from-mutation-responses-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

const taskKeys = {
  list: ['tasks'] as const,
  detail: (id: string) => ['tasks', 'detail', id] as const,
}

const editedTitle = '核对创建任务'

/** 生成 Demo 初始任务。 */
function createInitialTask(): TaskItem {
  return { id: 't-1', title: '现有任务', owner: '林晓' }
}

/** 等待固定时长，让写入和查询加载能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 把当前对象读成 JSON，失败时抛出带状态码的 Error。 */
async function readTask(task: TaskItem): Promise<TaskItem> {
  await waitForQuery(1400)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(task))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 观察 mutation 返回对象后，用 setQueryData 写回详情，列表不会自动跟上。 */
function UpdatesFromMutationResponsesPanel(): ReactElement {
  const queryClient = useQueryClient()
  const taskRef = useRef<TaskItem>(createInitialTask())
  const [listCount, setListCount] = useState(0)
  const [detailCount, setDetailCount] = useState(0)

  /** 读取任务列表，并统计这次真实请求。 */
  const loadList = useCallback(async () => {
    queueMicrotask(() => {
      setListCount((count) => count + 1)
    })
    return readTask(taskRef.current).then((task) => [task])
  }, [])

  /** 读取任务详情，并统计这次真实请求。 */
  const loadDetail = useCallback(async () => {
    queueMicrotask(() => {
      setDetailCount((count) => count + 1)
    })
    return readTask(taskRef.current)
  }, [])

  const listQuery = useQuery({
    queryKey: taskKeys.list,
    queryFn: loadList,
    staleTime: Infinity,
    retry: false,
  })

  const detailQuery = useQuery({
    queryKey: taskKeys.detail('t-1'),
    queryFn: loadDetail,
    staleTime: Infinity,
    retry: false,
  })

  const editMutation = useMutation({
    mutationFn: async () => {
      await waitForQuery(1400)
      const updated: TaskItem = {
        ...taskRef.current,
        title: editedTitle,
      }
      taskRef.current = updated
      return updated
    },
    retry: false,
    onSuccess: (data) => {
      queryClient.setQueryData(taskKeys.detail(data.id), data)
    },
  })

  const busy = editMutation.isPending || listQuery.isFetching || detailQuery.isFetching

  /** 用 mutate 保存修改，成功后把返回对象写进详情缓存。 */
  function runSave(): void {
    editMutation.mutate()
  }

  /** 恢复初始任务并重新读取，清掉计数。 */
  function resetDemo(): void {
    taskRef.current = createInitialTask()
    setListCount(0)
    setDetailCount(0)
    editMutation.reset()
    void queryClient.invalidateQueries()
  }

  const detailTask = detailQuery.data
  const listTasks = listQuery.data

  return (
    <section className="mutation-response-demo" data-testid="mutation-response-demo">
      <header className="mutation-response-header">
        <span>TanStack Query</span>
        <h2>Mutation 响应更新缓存</h2>
        <p>
          保存成功后，用返回对象 setQueryData
          写回详情。详情请求次数不会因此增加；列表仍是写入前的标题。
        </p>
      </header>

      <div className="mutation-response-metrics" aria-live="polite">
        <div>
          <span>列表次数</span>
          <strong data-testid="mutation-response-list-count">{listCount}</strong>
        </div>
        <div>
          <span>详情次数</span>
          <strong data-testid="mutation-response-detail-count">{detailCount}</strong>
        </div>
        <div>
          <span>详情标题</span>
          <strong data-testid="mutation-response-detail-title">
            {detailTask ? detailTask.title : '无'}
          </strong>
        </div>
        <div>
          <span>列表标题</span>
          <strong data-testid="mutation-response-list-title">
            {listTasks && listTasks[0] ? listTasks[0].title : '无'}
          </strong>
        </div>
        <div>
          <span>负责人</span>
          <strong data-testid="mutation-response-owner">
            {detailTask ? detailTask.owner : '无'}
          </strong>
        </div>
        <div>
          <span>mutation</span>
          <strong data-testid="mutation-response-mutation-status">{editMutation.status}</strong>
        </div>
      </div>

      <div className="mutation-response-actions">
        <button type="button" data-kind="primary" disabled={busy} onClick={runSave}>
          保存修改
        </button>
        <button type="button" disabled={busy} onClick={resetDemo}>
          重置
        </button>
      </div>

      <div className="mutation-response-columns">
        <section className="mutation-response-card">
          <h3>详情缓存</h3>
          {detailQuery.isPending ? (
            <p className="mutation-response-message" role="status">
              正在读取详情。
            </p>
          ) : null}
          {detailQuery.isSuccess && detailTask ? (
            <ul data-testid="mutation-response-detail-list">
              <li>
                {detailTask.title} / {detailTask.owner}
              </li>
            </ul>
          ) : null}
        </section>
        <section className="mutation-response-card">
          <h3>列表缓存</h3>
          {listQuery.isPending ? (
            <p className="mutation-response-message" role="status">
              正在读取列表。
            </p>
          ) : null}
          {listQuery.isSuccess && listTasks ? (
            <ul data-testid="mutation-response-list">
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
function UpdatesFromMutationResponsesDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <UpdatesFromMutationResponsesPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册 Mutation 响应更新缓存 Demo。 */
export function createUpdatesFromMutationResponsesDemo(): ComponentType {
  return UpdatesFromMutationResponsesDemoRoot
}
