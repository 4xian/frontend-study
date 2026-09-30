import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './mutation-lifecycle-demo.css'

type CreatedTask = {
  id: string
  title: string
  owner: string
}

type TaskInput = {
  id: string
  title: string
}

type LifecycleLog = {
  id: number
  source: 'hook' | 'call' | 'fn'
  message: string
}

const successTask: CreatedTask = {
  id: 't-901',
  title: '核对创建任务',
  owner: '林晓',
}

const firstConsecutiveTask: TaskInput = {
  id: 't-a',
  title: '任务甲',
}

const lastConsecutiveTask: TaskInput = {
  id: 't-b',
  title: '任务乙',
}

/** 等待固定时长，让回调顺序能被看清。 */
function waitForMutation(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 创建任务；失败路径抛出错误，成功路径返回林晓的任务。 */
async function createTask(input: TaskInput, shouldFail: boolean): Promise<CreatedTask> {
  await waitForMutation(1400)
  if (shouldFail) {
    throw new Error('任务创建失败：HTTP 404')
  }
  return {
    id: input.id,
    title: input.title,
    owner: '林晓',
  }
}

/** 观察钩子回调、调用回调，以及连续 mutate 时调用回调只跟最后一次绑定。 */
function MutationLifecyclePanel(): ReactElement {
  const [shouldFail, setShouldFail] = useState(false)
  const [requestCount, setRequestCount] = useState(0)
  const [logs, setLogs] = useState<LifecycleLog[]>([])

  /** 把一条生命周期记录追加到时间线。 */
  const pushLog = useCallback((source: LifecycleLog['source'], message: string) => {
    setLogs((current) => [...current, { id: current.length + 1, source, message }])
  }, [])

  /** 统计每次真实请求，并记下 mutationFn 已经开始。 */
  const createObservedTask = useCallback(
    async (input: TaskInput) => {
      queueMicrotask(() => {
        setRequestCount((count) => count + 1)
      })
      pushLog('fn', `mutationFn · ${input.title}`)
      return createTask(input, shouldFail)
    },
    [pushLog, shouldFail],
  )

  const taskMutation = useMutation({
    mutationFn: createObservedTask,
    retry: false,
    onMutate(variables) {
      pushLog('hook', `onMutate · ${variables.title}`)
    },
    onSuccess(data, variables) {
      pushLog('hook', `onSuccess · ${variables.title} / ${data.owner}`)
    },
    onError(error, variables) {
      pushLog('hook', `onError · ${variables.title} / ${error.message}`)
    },
    onSettled(_data, error, variables) {
      pushLog('hook', `onSettled · ${variables.title} / ${error ? 'error' : 'success'}`)
    },
  })

  /** 调用级成功与结束回调，只跟当前这次 mutate 绑定。 */
  function createCallCallbacks(label: string) {
    return {
      onSuccess(data: CreatedTask, variables: TaskInput) {
        pushLog('call', `onSuccess · ${label} · ${variables.title} / ${data.owner}`)
      },
      onError(error: Error, variables: TaskInput) {
        pushLog('call', `onError · ${label} · ${variables.title} / ${error.message}`)
      },
      onSettled(_data: CreatedTask | undefined, error: Error | null, variables: TaskInput) {
        pushLog(
          'call',
          `onSettled · ${label} · ${variables.title} / ${error ? 'error' : 'success'}`,
        )
      },
    }
  }

  /** 用 mutate 触发一次创建，并挂上调用级回调。 */
  function runMutate(): void {
    taskMutation.mutate(
      { id: successTask.id, title: successTask.title },
      createCallCallbacks('本次'),
    )
  }

  /** 连续调用两次 mutate，对照钩子回调和调用回调。 */
  function runConsecutive(): void {
    taskMutation.mutate(firstConsecutiveTask, createCallCallbacks('第一次'))
    taskMutation.mutate(lastConsecutiveTask, createCallCallbacks('第二次'))
  }

  /** 切到失败路径，让下一次创建走进 error。 */
  function selectFailure(): void {
    setShouldFail(true)
  }

  /** 切回成功路径，让下一次创建走进 success。 */
  function selectSuccess(): void {
    setShouldFail(false)
  }

  /** 清掉这次 mutation 的结果和时间线，回到 idle。 */
  function resetMutation(): void {
    taskMutation.reset()
    setRequestCount(0)
    setLogs([])
  }

  const createdTask = taskMutation.data
  const canSubmit = !taskMutation.isPending
  const hookCount = logs.filter((entry) => entry.source === 'hook').length
  const callCount = logs.filter((entry) => entry.source === 'call').length
  const hookLogs = logs.filter((entry) => entry.source === 'hook')
  const callLogs = logs.filter((entry) => entry.source === 'call')

  return (
    <section className="mutation-lifecycle-demo" data-testid="mutation-lifecycle-demo">
      <header className="mutation-lifecycle-header">
        <span>TanStack Query</span>
        <h2>Mutation 生命周期</h2>
        <p>
          一次创建会按 onMutate、mutationFn、onSuccess 或 onError、onSettled
          记录。连续创建两次时，钩子回调两次都记，调用回调只跟最后一次绑定。
        </p>
      </header>

      <div className="mutation-lifecycle-metrics" aria-live="polite">
        <div>
          <span>请求次数</span>
          <strong data-testid="mutation-lifecycle-count">{requestCount}</strong>
        </div>
        <div>
          <span>status</span>
          <strong data-testid="mutation-lifecycle-status">{taskMutation.status}</strong>
        </div>
        <div>
          <span>钩子回调</span>
          <strong data-testid="mutation-lifecycle-hook-count">{hookCount}</strong>
        </div>
        <div>
          <span>调用回调</span>
          <strong data-testid="mutation-lifecycle-call-count">{callCount}</strong>
        </div>
        <div>
          <span>data</span>
          <strong data-testid="mutation-lifecycle-data">
            {createdTask ? `${createdTask.title} / ${createdTask.owner}` : '无'}
          </strong>
        </div>
        <div>
          <span>error</span>
          <strong data-testid="mutation-lifecycle-error">
            {taskMutation.error ? taskMutation.error.message : '无'}
          </strong>
        </div>
      </div>

      <div className="mutation-lifecycle-actions">
        <button type="button" data-kind="primary" disabled={!canSubmit} onClick={runMutate}>
          创建任务
        </button>
        <button type="button" disabled={!canSubmit} onClick={runConsecutive}>
          连续创建两次
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

      <div className="mutation-lifecycle-columns">
        <section className="mutation-lifecycle-card">
          <h3>执行顺序</h3>
          {logs.length === 0 ? (
            <p className="mutation-lifecycle-message" role="status">
              还没有回调。点创建任务后，先记钩子 onMutate，再记 mutationFn。
            </p>
          ) : (
            <ul data-testid="mutation-lifecycle-timeline">
              {logs.map((entry) => (
                <li key={entry.id}>
                  {entry.source === 'hook' ? '钩子' : entry.source === 'call' ? '调用' : '执行'}{' '}
                  {entry.message}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="mutation-lifecycle-card">
          <h3>钩子回调</h3>
          {hookLogs.length === 0 ? (
            <p className="mutation-lifecycle-message" role="status">
              钩子级 onMutate、onSuccess、onError、onSettled 会记在这里。
            </p>
          ) : (
            <ul data-testid="mutation-lifecycle-hook-log">
              {hookLogs.map((entry) => (
                <li key={entry.id}>{entry.message}</li>
              ))}
            </ul>
          )}
        </section>
        <section className="mutation-lifecycle-card">
          <h3>调用回调</h3>
          {callLogs.length === 0 ? (
            <p className="mutation-lifecycle-message" role="status">
              传给 mutate 的 onSuccess、onError、onSettled 会记在这里。连续两次时只会出现最后一次。
            </p>
          ) : (
            <ul data-testid="mutation-lifecycle-call-log">
              {callLogs.map((entry) => (
                <li key={entry.id}>{entry.message}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function MutationLifecycleDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <MutationLifecyclePanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册 Mutation 生命周期 Demo。 */
export function createMutationLifecycleDemo(): ComponentType {
  return MutationLifecycleDemoRoot
}
