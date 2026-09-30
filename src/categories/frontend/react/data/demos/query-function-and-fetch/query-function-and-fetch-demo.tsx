import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import { type ComponentType, type ReactElement } from 'react'

import './query-function-and-fetch-demo.css'

type LessonTask = {
  id: string
  title: string
  owner: string
}

const lessonTasks: LessonTask[] = [
  { id: 't-401', title: '检查 Response.ok', owner: '林晓' },
  { id: 't-402', title: '解析 response.json()', owner: '周宁' },
  { id: 't-403', title: '传入 AbortSignal', owner: '陈默' },
]

const lessonQueryKey = ['lesson-query-function-and-fetch-tasks'] as const
const lessonTasksUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(lessonTasks))}`
const queryClient = new QueryClient()

/** 使用 fetch 读取确定性的本地 JSON，并遵守 queryFn 的成功、失败和取消合同。 */
async function loadLessonTasks({
  signal,
}: QueryFunctionContext<typeof lessonQueryKey>): Promise<LessonTask[]> {
  const response = await fetch(lessonTasksUrl, { signal })

  if (!response.ok) {
    throw new Error(`任务请求失败：${response.status}`)
  }

  return (await response.json()) as LessonTask[]
}

/** 使用 useQuery 执行 fetch 查询，并显示请求函数的可观察结果。 */
function QueryFunctionPanel(): ReactElement {
  const taskQuery = useQuery({
    queryKey: lessonQueryKey,
    queryFn: loadLessonTasks,
  })

  return (
    <section className="query-function-and-fetch-panel" data-testid="query-function-and-fetch-demo">
      <header className="query-function-and-fetch-header">
        <span>TanStack Query</span>
        <h2>Query Function 与 fetch</h2>
        <p>请求函数检查响应、解析 JSON，并把查询提供的取消信号交给 fetch。</p>
      </header>

      <div className="query-function-and-fetch-contract" aria-label="请求函数合同">
        <span>queryFn 合同</span>
        <strong>fetch → ok 检查 → json 解析 → 返回任务</strong>
        <code>signal 已传给 fetch</code>
      </div>

      {taskQuery.isPending && (
        <p className="query-function-and-fetch-message" role="status">
          正在执行 queryFn...
        </p>
      )}

      {taskQuery.isError && (
        <p className="query-function-and-fetch-message" role="alert">
          请求失败：{taskQuery.error.message}
        </p>
      )}

      {taskQuery.isSuccess && (
        <ul className="query-function-and-fetch-list">
          {taskQuery.data.map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong>
              <span>{task.owner}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        className="query-function-and-fetch-button"
        type="button"
        onClick={() => void taskQuery.refetch()}
        disabled={taskQuery.isFetching}
      >
        {taskQuery.isFetching ? '请求中...' : '重新执行 queryFn'}
      </button>
    </section>
  )
}

/** 为 Demo 提供稳定的 QueryClient，让查询组件能访问当前数据层。 */
function QueryFunctionAndFetchDemoRoot(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryFunctionPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册 Query Function 与 fetch Demo。 */
export function createQueryFunctionAndFetchDemo(): ComponentType {
  return QueryFunctionAndFetchDemoRoot
}
