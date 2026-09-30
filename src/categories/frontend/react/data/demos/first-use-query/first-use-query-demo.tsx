import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { type ComponentType, type ReactElement } from 'react'

import './first-use-query-demo.css'

type LessonTask = {
  id: string
  title: string
  owner: string
}

const lessonTasks: LessonTask[] = [
  { id: 't-301', title: '确认查询声明', owner: '林晓' },
  { id: 't-302', title: '观察数据渲染', owner: '周宁' },
  { id: 't-303', title: '保留本地筛选', owner: '陈默' },
]

const queryClient = new QueryClient()
const lessonQueryKey = ['lesson-first-use-query-tasks'] as const

/** 模拟一次可取消的异步读取，让 useQuery 的等待和数据结果都能被观察。 */
function loadLessonTasks({ signal }: { signal: AbortSignal }): Promise<LessonTask[]> {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel)
      resolve(lessonTasks)
    }, 650)

    /** 在查询卸载时清理 Demo 的延迟资源。 */
    function cancel(): void {
      window.clearTimeout(timerId)
      signal.removeEventListener('abort', cancel)
      reject(new DOMException('查询已取消', 'AbortError'))
    }

    if (signal.aborted) {
      cancel()
      return
    }

    signal.addEventListener('abort', cancel, { once: true })
  })
}

/** 使用 useQuery 声明任务读取，并把查询结果渲染到列表。 */
function FirstUseQueryPanel(): ReactElement {
  const taskQuery = useQuery({
    queryKey: lessonQueryKey,
    queryFn: loadLessonTasks,
  })

  return (
    <section className="first-use-query-panel" data-testid="first-use-query-demo">
      <header className="first-use-query-header">
        <span>TanStack Query</span>
        <h2>第一个 useQuery</h2>
        <p>组件声明它需要一组异步任务，数据就绪后直接从查询结果渲染。</p>
      </header>

      {taskQuery.isPending && (
        <p className="first-use-query-message" role="status">
          正在读取任务...
        </p>
      )}

      {taskQuery.isSuccess && (
        <ul className="first-use-query-list">
          {taskQuery.data.map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong>
              <span>{task.owner}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** 为 Demo 提供稳定的 QueryClient，让查询组件能访问当前数据层。 */
function FirstUseQueryDemoRoot(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <FirstUseQueryPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册第一个 useQuery Demo。 */
export function createFirstUseQueryDemo(): ComponentType {
  return FirstUseQueryDemoRoot
}
