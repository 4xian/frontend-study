import { QueryClient, QueryClientProvider, queryOptions, useQuery } from '@tanstack/react-query'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './request-waterfalls-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskComment = {
  id: string
  body: string
}

type WaterfallMode = 'nested' | 'hoisted'

type TaskStore = {
  sessionId: number
  taskFetching: boolean
  commentsFetching: boolean
  commentsStarted: boolean
  overlapped: boolean
  onChange?: () => void
}

const taskStore: TaskStore = {
  sessionId: 0,
  taskFetching: false,
  commentsFetching: false,
  commentsStarted: false,
  overlapped: false,
}

const taskDetail: TaskItem = { id: 't-1', title: '现有任务', owner: '林晓' }

const taskComment: TaskComment = { id: 'c-1', body: '核对评论' }

/** 等待固定时长，让嵌套瀑布和并行提升能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 通知观察区刷新本次请求状态。 */
function notifyStore(): void {
  if (taskStore.taskFetching && taskStore.commentsFetching) {
    taskStore.overlapped = true
  }
  taskStore.onChange?.()
}

/** 只清空指定会话的请求观察。 */
function resetStore(sessionId: number): void {
  if (taskStore.sessionId !== sessionId) {
    return
  }
  taskStore.taskFetching = false
  taskStore.commentsFetching = false
  taskStore.commentsStarted = false
  taskStore.overlapped = false
  taskStore.onChange = undefined
}

/** 读取任务详情，并标记这次任务请求。 */
async function loadTaskDetail(): Promise<TaskItem> {
  const sessionId = taskStore.sessionId
  taskStore.taskFetching = true
  notifyStore()
  await waitForQuery(1400)
  if (taskStore.sessionId !== sessionId) {
    return taskDetail
  }
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(taskDetail))}`
  const response = await fetch(successUrl)
  taskStore.taskFetching = false
  notifyStore()
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 读取任务评论，并标记这次评论请求。 */
async function loadTaskComments(): Promise<TaskComment> {
  const sessionId = taskStore.sessionId
  taskStore.commentsStarted = true
  taskStore.commentsFetching = true
  notifyStore()
  await waitForQuery(1400)
  if (taskStore.sessionId !== sessionId) {
    return taskComment
  }
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(taskComment))}`
  const response = await fetch(successUrl)
  taskStore.commentsFetching = false
  notifyStore()
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskComment
}

const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  retry: false,
})

const taskCommentsOptions = queryOptions({
  queryKey: ['tasks', 'comments', 't-1'],
  queryFn: loadTaskComments,
  staleTime: Infinity,
  retry: false,
})

/** 只在任务渲染后再订阅评论，形成嵌套瀑布。 */
function NestedCommentsPane(): ReactElement {
  const commentsQuery = useQuery(taskCommentsOptions)

  if (commentsQuery.isPending) {
    return (
      <p className="request-waterfall-message" role="status">
        正在读取评论。
      </p>
    )
  }

  if (!commentsQuery.isSuccess) {
    return null
  }

  return <p data-testid="request-waterfall-comments">{commentsQuery.data.body}</p>
}

/** 父组件等任务完成才挂评论观察者。 */
function NestedTaskBoard(): ReactElement {
  const taskQuery = useQuery(taskDetailOptions)

  if (taskQuery.isPending) {
    return (
      <p className="request-waterfall-message" role="status">
        正在读取任务。
      </p>
    )
  }

  if (!taskQuery.isSuccess) {
    return null
  }

  return (
    <div className="request-waterfall-columns">
      <section className="request-waterfall-card">
        <h3>任务详情</h3>
        <p data-testid="request-waterfall-task">
          {taskQuery.data.title} / {taskQuery.data.owner}
        </p>
      </section>
      <section className="request-waterfall-card">
        <h3>任务评论</h3>
        <NestedCommentsPane />
      </section>
    </div>
  )
}

/** 把互不依赖的评论查询提升到父组件，两条请求一起开始。 */
function HoistedTaskBoard(): ReactElement {
  const taskQuery = useQuery(taskDetailOptions)
  const commentsQuery = useQuery(taskCommentsOptions)

  return (
    <div className="request-waterfall-columns">
      <section className="request-waterfall-card">
        <h3>任务详情</h3>
        {taskQuery.isPending ? (
          <p className="request-waterfall-message" role="status">
            正在读取任务。
          </p>
        ) : null}
        {taskQuery.isSuccess ? (
          <p data-testid="request-waterfall-task">
            {taskQuery.data.title} / {taskQuery.data.owner}
          </p>
        ) : null}
      </section>
      <section className="request-waterfall-card">
        <h3>任务评论</h3>
        {commentsQuery.isPending ? (
          <p className="request-waterfall-message" role="status">
            正在读取评论。
          </p>
        ) : null}
        {commentsQuery.isSuccess ? (
          <p data-testid="request-waterfall-comments">{commentsQuery.data.body}</p>
        ) : null}
      </section>
    </div>
  )
}

/** 对照嵌套瀑布和提升后的并行请求。 */
function RequestWaterfallsPanel({
  mode,
  onModeChange,
}: {
  mode: WaterfallMode
  onModeChange: (mode: WaterfallMode) => void
}): ReactElement {
  const [taskFetching, setTaskFetching] = useState(taskStore.taskFetching)
  const [commentsFetching, setCommentsFetching] = useState(taskStore.commentsFetching)
  const [commentsStarted, setCommentsStarted] = useState(taskStore.commentsStarted)
  const [overlapped, setOverlapped] = useState(taskStore.overlapped)
  const busy = taskFetching || commentsFetching

  useEffect(() => {
    /** 把当前请求状态同步到观察区。 */
    function syncStore(): void {
      setTaskFetching(taskStore.taskFetching)
      setCommentsFetching(taskStore.commentsFetching)
      setCommentsStarted(taskStore.commentsStarted)
      setOverlapped(taskStore.overlapped)
    }

    taskStore.onChange = syncStore
    syncStore()
    return () => {
      taskStore.onChange = undefined
    }
  }, [])

  /** 切回父组件等任务完成再挂评论。 */
  function showNested(): void {
    onModeChange('nested')
  }

  /** 把评论查询提升到父组件并一起启动。 */
  function showHoisted(): void {
    onModeChange('hoisted')
  }

  /** 清空本次缓存并回到嵌套瀑布。 */
  function resetDemo(): void {
    onModeChange('nested')
  }

  return (
    <section className="request-waterfall-demo" data-testid="request-waterfall-demo">
      <header className="request-waterfall-header">
        <span>TanStack Query</span>
        <h2>请求瀑布优化</h2>
        <p>父组件等任务完成再挂评论会串行。把评论查询提升后，两条请求一起开始。</p>
      </header>

      <div className="request-waterfall-metrics" aria-live="polite">
        <div>
          <span>当前模式</span>
          <strong data-testid="request-waterfall-mode">
            {mode === 'nested' ? '嵌套瀑布' : '提升并行'}
          </strong>
        </div>
        <div>
          <span>任务等待中</span>
          <strong data-testid="request-waterfall-task-pending">{taskFetching ? '是' : '否'}</strong>
        </div>
        <div>
          <span>评论等待中</span>
          <strong data-testid="request-waterfall-comments-pending">
            {commentsFetching ? '是' : '否'}
          </strong>
        </div>
        <div>
          <span>评论已开始</span>
          <strong data-testid="request-waterfall-comments-started">
            {commentsStarted ? '是' : '否'}
          </strong>
        </div>
        <div>
          <span>同时请求</span>
          <strong data-testid="request-waterfall-overlapped">{overlapped ? '是' : '否'}</strong>
        </div>
      </div>

      <div className="request-waterfall-actions">
        <button type="button" data-kind="primary" disabled={busy} onClick={showNested}>
          嵌套瀑布
        </button>
        <button type="button" disabled={busy} onClick={showHoisted}>
          提升并行
        </button>
        <button type="button" disabled={busy} onClick={resetDemo}>
          重置
        </button>
      </div>

      {mode === 'nested' ? <NestedTaskBoard /> : <HoistedTaskBoard />}
    </section>
  )
}

/** 为一次观察创建独立 QueryClient，切换模式时整段重挂。 */
function RequestWaterfallsSession({
  mode,
  onModeChange,
}: {
  mode: WaterfallMode
  onModeChange: (mode: WaterfallMode) => void
}): ReactElement {
  const [sessionId] = useState(() => {
    const nextSessionId = taskStore.sessionId + 1
    taskStore.sessionId = nextSessionId
    taskStore.taskFetching = false
    taskStore.commentsFetching = false
    taskStore.commentsStarted = false
    taskStore.overlapped = false
    taskStore.onChange = undefined
    return nextSessionId
  })
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => {
      queryClient.clear()
      resetStore(sessionId)
    }
  }, [queryClient, sessionId])

  return (
    <QueryClientProvider client={queryClient}>
      <RequestWaterfallsPanel mode={mode} onModeChange={onModeChange} />
    </QueryClientProvider>
  )
}

/** 为课程页面注册请求瀑布优化 Demo。 */
export function createRequestWaterfallsDemo(): ComponentType {
  /** 用模式 key 重挂客户端，避免两条路径共享缓存。 */
  function RequestWaterfallsDemoRoot(): ReactElement {
    const [mode, setMode] = useState<WaterfallMode>('nested')
    const [session, setSession] = useState(0)

    /** 切换观察模式并丢弃当前缓存。 */
    function changeMode(nextMode: WaterfallMode): void {
      setMode(nextMode)
      setSession((current) => current + 1)
    }

    return (
      <RequestWaterfallsSession key={`${mode}-${session}`} mode={mode} onModeChange={changeMode} />
    )
  }

  return RequestWaterfallsDemoRoot
}
