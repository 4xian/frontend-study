import {
  QueryClient,
  QueryClientProvider,
  mutationOptions,
  useIsMutating,
  useMutation,
  useMutationState,
} from '@tanstack/react-query'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './concurrent-mutation-state-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type CreateTaskInput = {
  id: string
  title: string
  owner: string
}

const linTask: CreateTaskInput = { id: 't-1', title: '现有任务', owner: '林晓' }

const zhouTask: CreateTaskInput = { id: 't-2', title: '第二页任务', owner: '周宁' }

const createTaskKey = ['tasks', 'create'] as const

/** 等待固定时长，让两次写入能重叠。 */
function waitForMutation(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 创建任务；非 2xx 时抛出带状态码的 Error。 */
async function createTask(input: CreateTaskInput): Promise<TaskItem> {
  await waitForMutation(1400)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(input))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`创建失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const createTaskOptions = mutationOptions({
  mutationKey: createTaskKey,
  mutationFn: createTask,
  retry: false,
})

/** 对照观察者只跟最后一次，以及缓存里全部进行中的写入。 */
function ConcurrentMutationStatePanel({ onReset }: { onReset: () => void }): ReactElement {
  const taskMutation = useMutation(createTaskOptions)
  const pendingCount = useIsMutating({ mutationKey: createTaskKey })
  const pendingTitles = useMutationState({
    filters: { mutationKey: createTaskKey, status: 'pending' },
    select: (mutation) => (mutation.state.variables as CreateTaskInput | undefined)?.title ?? '无',
  })

  /** 触发林晓那次创建，不打断已经在跑的写入。 */
  function createLinTask(): void {
    taskMutation.mutate(linTask)
  }

  /** 再触发周宁那次创建，默认与上一笔并行。 */
  function createZhouTask(): void {
    taskMutation.mutate(zhouTask)
  }

  const inflightText = pendingTitles.length > 0 ? pendingTitles.join('、') : '无'
  const observerTask = taskMutation.isSuccess
    ? `${taskMutation.data.title} / ${taskMutation.data.owner}`
    : '无'

  return (
    <section className="concurrent-mutation-demo" data-testid="concurrent-mutation-demo">
      <header className="concurrent-mutation-header">
        <span>TanStack Query</span>
        <h2>并发 Mutation 状态</h2>
        <p>默认两次 mutate 一起跑。观察者只跟最后一次，进行中的条数和标题要问 MutationCache。</p>
      </header>

      <div className="concurrent-mutation-metrics" aria-live="polite">
        <div>
          <span>进行中条数</span>
          <strong data-testid="concurrent-mutation-pending-count">{pendingCount}</strong>
        </div>
        <div>
          <span>观察者等待中</span>
          <strong data-testid="concurrent-mutation-observer-pending">
            {taskMutation.isPending ? '是' : '否'}
          </strong>
        </div>
        <div>
          <span>观察者结果</span>
          <strong data-testid="concurrent-mutation-observer-data">{observerTask}</strong>
        </div>
        <div>
          <span>进行中标题</span>
          <strong data-testid="concurrent-mutation-inflight">{inflightText}</strong>
        </div>
      </div>

      <div className="concurrent-mutation-actions">
        <button type="button" data-kind="primary" onClick={createLinTask}>
          创建林晓
        </button>
        <button type="button" onClick={createZhouTask}>
          创建周宁
        </button>
        <button type="button" onClick={onReset}>
          重置
        </button>
      </div>

      <div className="concurrent-mutation-columns">
        <section className="concurrent-mutation-card">
          <h3>当前观察</h3>
          {pendingCount === 0 && !taskMutation.isSuccess && (
            <p className="concurrent-mutation-message" role="status">
              还没有写入。先创建林晓，再立刻创建周宁，就能看到两条一起 pending。
            </p>
          )}
          {pendingCount > 0 && (
            <p className="concurrent-mutation-message" role="status">
              默认并行。观察者只显示最后一次，进行中标题会列出每一笔。
            </p>
          )}
          {pendingCount === 0 && taskMutation.isSuccess && (
            <p className="concurrent-mutation-message" role="status">
              写入结束。观察者拿到的是最后一次成功结果。
            </p>
          )}
        </section>
        <section className="concurrent-mutation-card">
          <h3>观察者数据</h3>
          <p data-testid="concurrent-mutation-status">{taskMutation.status}</p>
        </section>
      </div>
    </section>
  )
}

/** 为一次观察创建独立 QueryClient。 */
function ConcurrentMutationStateSession({ onReset }: { onReset: () => void }): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => {
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <ConcurrentMutationStatePanel onReset={onReset} />
    </QueryClientProvider>
  )
}

/** 为课程页面注册并发 Mutation 状态 Demo。 */
export function createConcurrentMutationStateDemo(): ComponentType {
  /** 重置时整段重挂，避免旧 mutation 条目留在缓存里。 */
  function ConcurrentMutationStateDemoRoot(): ReactElement {
    const [session, setSession] = useState(0)

    /** 丢弃当前 MutationCache 和观察者。 */
    function resetDemo(): void {
      setSession((current) => current + 1)
    }

    return <ConcurrentMutationStateSession key={session} onReset={resetDemo} />
  }

  return ConcurrentMutationStateDemoRoot
}
