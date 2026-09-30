import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { useRef, useState, type ComponentType, type ReactElement } from 'react'

import './react-query-devtools-demo.css'

type LessonProfile = {
  id: string
  name: string
  role: 'admin' | 'member'
}

type LessonQueryKey = readonly ['lesson-react-query-devtools-profile', number]

const lessonProfile: LessonProfile = {
  id: 'u-14',
  name: '林晓',
  role: 'member',
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

/** 等待固定时长并响应取消，让查询状态变化足够被 Devtools 观察。 */
function waitForProfile(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel)
      resolve()
    }, 550)

    /** 取消本地延迟并结束当前查询等待。 */
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

/** 用真实 React Query Devtools 观察查询缓存、状态和手动重新获取。 */
function DevtoolsQueryPanel(): ReactElement {
  const [revision, setRevision] = useState(0)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const shouldFailRef = useRef(false)
  const queryKey: LessonQueryKey = ['lesson-react-query-devtools-profile', revision]
  const isDevelopmentBuild = import.meta.env.DEV

  /** 读取本地用户资料，并按按钮选择决定成功或失败。 */
  async function loadProfile({ signal }: { signal: AbortSignal }): Promise<LessonProfile> {
    await waitForProfile(signal)
    if (shouldFailRef.current) {
      shouldFailRef.current = false
      throw new Error('这是一次用于观察 error 状态的模拟失败')
    }
    return lessonProfile
  }

  const query = useQuery({
    queryKey,
    queryFn: loadProfile,
    enabled: false,
  })

  /** 发起一次成功查询，让 Devtools 出现对应缓存条目。 */
  function readProfile(): void {
    shouldFailRef.current = false
    void query.refetch()
  }

  /** 发起一次失败查询，观察 Devtools 中的 error 状态。 */
  function failProfile(): void {
    shouldFailRef.current = true
    void query.refetch()
  }

  /** 切换嵌入式 Devtools 面板的显示。 */
  function togglePanel(): void {
    setIsPanelOpen((open) => !open)
  }

  /** 关闭嵌入式 Devtools 面板。 */
  function closePanel(): void {
    setIsPanelOpen(false)
  }

  /** 更换查询身份，回到尚未执行的观察起点。 */
  function resetQuery(): void {
    shouldFailRef.current = false
    setRevision((currentRevision) => currentRevision + 1)
  }

  return (
    <section className="react-query-devtools-demo" data-testid="react-query-devtools-demo">
      <header className="react-query-devtools-header">
        <span>TanStack Query</span>
        <h2>React Query Devtools</h2>
        <p>使用真实 Devtools 面板观察查询键、缓存条目和查询状态，而不是自制一份外观相似的界面。</p>
      </header>

      <div className="react-query-devtools-controls">
        <button type="button" onClick={readProfile} disabled={query.isFetching}>
          读取资料
        </button>
        <button type="button" onClick={failProfile} disabled={query.isFetching}>
          模拟失败
        </button>
        <button type="button" onClick={() => void query.refetch()} disabled={query.isFetching}>
          手动刷新
        </button>
        <button type="button" onClick={togglePanel}>
          {isPanelOpen ? '关闭面板' : '打开面板'}
        </button>
        <button type="button" onClick={resetQuery} disabled={query.isFetching}>
          重置查询
        </button>
      </div>

      <div className="react-query-devtools-state" aria-live="polite">
        <div>
          <span>queryKey</span>
          <strong data-testid="react-query-devtools-query-key">{JSON.stringify(queryKey)}</strong>
        </div>
        <div>
          <span>status</span>
          <strong data-testid="react-query-devtools-status">{query.status}</strong>
        </div>
        <div>
          <span>fetchStatus</span>
          <strong>{query.fetchStatus}</strong>
        </div>
        <div>
          <span>isFetching</span>
          <strong>{String(query.isFetching)}</strong>
        </div>
      </div>

      {query.isPending && query.fetchStatus === 'idle' && (
        <p className="react-query-devtools-message">尚未读取：先打开面板，再点击“读取资料”。</p>
      )}
      {query.isFetching && (
        <p className="react-query-devtools-message" role="status">
          正在读取资料...
        </p>
      )}
      {query.isError && (
        <p className="react-query-devtools-error" role="alert">
          {query.error.message}
        </p>
      )}
      {query.isSuccess && (
        <p className="react-query-devtools-success">
          {query.data.name}（{query.data.role}）
        </p>
      )}

      {isDevelopmentBuild ? (
        isPanelOpen ? (
          <div className="react-query-devtools-panel-host">
            <ReactQueryDevtoolsPanel
              onClose={closePanel}
              style={{ height: '280px' }}
              theme="light"
            />
          </div>
        ) : (
          <p className="react-query-devtools-message">
            Devtools 面板已关闭，可再次打开继续观察缓存。
          </p>
        )
      ) : (
        <p className="react-query-devtools-message">
          默认 Devtools 入口只在开发模式挂载，当前构建不会渲染真实面板。
        </p>
      )}
    </section>
  )
}

/** 为 Demo 提供稳定 QueryClient，并让真实 Devtools 读取同一作用域的缓存。 */
function ReactQueryDevtoolsDemoRoot(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <DevtoolsQueryPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册 React Query Devtools Demo。 */
export function createReactQueryDevtoolsDemo(): ComponentType {
  return ReactQueryDevtoolsDemoRoot
}
