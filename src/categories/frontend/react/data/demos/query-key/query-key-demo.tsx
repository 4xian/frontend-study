import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import { useState, type ComponentType, type ReactElement } from 'react'

import './query-key-demo.css'

type TaskStatus = 'all' | 'open' | 'done'

type LessonTask = {
  id: string
  title: string
  status: Exclude<TaskStatus, 'all'>
}

type LessonQueryKey = readonly ['lesson-query-key-tasks', { status: TaskStatus }]

const lessonTasks: LessonTask[] = [
  { id: 't-501', title: '整理查询身份', status: 'open' },
  { id: 't-502', title: '记录动态变量', status: 'done' },
  { id: 't-503', title: '比较数组顺序', status: 'open' },
  { id: 't-504', title: '检查序列化值', status: 'done' },
]

const statusLabels: Record<TaskStatus, string> = {
  all: '全部任务',
  open: '待处理',
  done: '已完成',
}

const queryClient = new QueryClient()

/** 根据 queryKey 中的 status 返回对应任务，展示 key 与数据条件的绑定。 */
async function loadLessonTasks({
  queryKey,
}: QueryFunctionContext<LessonQueryKey>): Promise<LessonTask[]> {
  const [, filters] = queryKey

  if (filters.status === 'all') {
    return lessonTasks
  }

  return lessonTasks.filter((task) => task.status === filters.status)
}

/** 通过切换状态构造不同 queryKey，并渲染每个 key 对应的任务结果。 */
function QueryKeyPanel(): ReactElement {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('all')
  const lessonQueryKey: LessonQueryKey = ['lesson-query-key-tasks', { status: selectedStatus }]
  const taskQuery = useQuery({
    queryKey: lessonQueryKey,
    queryFn: loadLessonTasks,
  })

  return (
    <section className="query-key-panel" data-testid="query-key-demo">
      <header className="query-key-header">
        <span>TanStack Query</span>
        <h2>Query Key 观察器</h2>
        <p>筛选变量进入 queryKey 后，每种状态都对应自己的查询身份。</p>
      </header>

      <div className="query-key-controls" aria-label="任务状态筛选">
        {(Object.keys(statusLabels) as TaskStatus[]).map((status) => (
          <button
            className={status === selectedStatus ? 'is-selected' : ''}
            key={status}
            type="button"
            aria-pressed={status === selectedStatus}
            onClick={() => setSelectedStatus(status)}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      <div className="query-key-readout" aria-live="polite">
        <span>当前 queryKey</span>
        <code>{JSON.stringify(lessonQueryKey)}</code>
        <strong>{statusLabels[selectedStatus]}</strong>
      </div>

      {taskQuery.isSuccess && (
        <ul className="query-key-list">
          {taskQuery.data.map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong>
              <span>{task.status === 'done' ? '已完成' : '待处理'}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** 为 Demo 提供稳定的 QueryClient，让不同 queryKey 的查询可以被观察。 */
function QueryKeyDemoRoot(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryKeyPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册 Query Key Demo。 */
export function createQueryKeyDemo(): ComponentType {
  return QueryKeyDemoRoot
}
