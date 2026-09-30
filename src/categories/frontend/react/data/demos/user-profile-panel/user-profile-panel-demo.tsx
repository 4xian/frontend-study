import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './user-profile-panel-demo.css'

type UserRole = 'admin' | 'member'

type UserProfile = {
  id: string
  name: string
  role: UserRole
  team: string
}

type UserQueryKey = readonly ['lesson-user-profile', string]

const userCatalog: Record<string, UserProfile> = {
  'u-lin': { id: 'u-lin', name: '林晓', role: 'admin', team: '平台组' },
  'u-zhou': { id: 'u-zhou', name: '周宁', role: 'member', team: '内容组' },
}

/** 等待固定时长并响应取消，让加载、错误和卸载清理都可观察。 */
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

/** 用 fetch 思维读取用户资料：成功走 JSON 响应，失败检查 response.ok。 */
async function loadUserProfile({
  queryKey,
  signal,
}: QueryFunctionContext<UserQueryKey>): Promise<UserProfile> {
  const userId = queryKey[1]
  await waitForProfile(signal)

  if (userId === 'u-missing' || !userCatalog[userId]) {
    const failedResponse = new Response('用户不存在', {
      status: 404,
      statusText: 'Not Found',
    })
    if (!failedResponse.ok) {
      throw new Error(`读取用户失败：${failedResponse.status}`)
    }
  }

  const profile = userCatalog[userId]
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(profile))}`
  const response = await fetch(successUrl, { signal })
  if (!response.ok) {
    throw new Error(`读取用户失败：${response.status}`)
  }
  return (await response.json()) as UserProfile
}

/** 用同一 queryKey 展示缓存共享：摘要区不发起第二份请求。 */
function ProfileSummary({
  queryKey,
  queryFn,
  enabled,
}: {
  queryKey: UserQueryKey
  queryFn: (context: QueryFunctionContext<UserQueryKey>) => Promise<UserProfile>
  enabled: boolean
}): ReactElement {
  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime: Infinity,
    retry: false,
  })

  return (
    <aside className="user-profile-panel-summary" data-testid="user-profile-panel-summary">
      <span>共享观察者</span>
      {query.isPending && query.fetchStatus === 'idle' && <strong>等待选择用户</strong>}
      {query.isLoading && <strong>正在读取同一条查询</strong>}
      {query.isError && <strong>同一条查询失败</strong>}
      {query.isSuccess && (
        <strong>
          {query.data.name} · {query.data.team}
        </strong>
      )}
    </aside>
  )
}

/** 组合条件、查询键、状态、错误恢复和缓存复用，构成用户信息面板。 */
function UserProfilePanel(): ReactElement {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [requestCount, setRequestCount] = useState(0)
  const queryKey: UserQueryKey = ['lesson-user-profile', selectedUserId]
  const isEnabled = selectedUserId.length > 0

  /** 记录真实发起的查询次数，并交给两个观察者共用。 */
  async function loadObservedProfile(
    context: QueryFunctionContext<UserQueryKey>,
  ): Promise<UserProfile> {
    setRequestCount((count) => count + 1)
    return loadUserProfile(context)
  }

  const query = useQuery({
    queryKey,
    queryFn: loadObservedProfile,
    enabled: isEnabled,
    staleTime: Infinity,
    retry: false,
  })

  const isWaitingForSelection = query.isPending && query.fetchStatus === 'idle'

  /** 切换当前用户身份，空值表示尚未满足查询条件。 */
  function chooseUser(userId: string): void {
    setSelectedUserId(userId)
  }

  /** 手动重新读取当前用户，用于观察刷新路径。 */
  function refreshProfile(): void {
    void query.refetch()
  }

  return (
    <section className="user-profile-panel-demo" data-testid="user-profile-panel-demo">
      <header className="user-profile-panel-header">
        <span>TanStack Query</span>
        <h2>用户信息面板</h2>
        <p>先选择用户再查询。相同用户会复用缓存；未知用户走错误路径，手动刷新可以再次读取。</p>
      </header>

      <form
        className="user-profile-panel-form"
        onSubmit={(event) => {
          event.preventDefault()
        }}
      >
        <label>
          <span>选择用户</span>
          <select
            value={selectedUserId}
            onChange={(event) => chooseUser(event.target.value)}
            data-testid="user-profile-panel-select"
          >
            <option value="">未选择</option>
            <option value="u-lin">林晓</option>
            <option value="u-zhou">周宁</option>
            <option value="u-missing">未知用户</option>
          </select>
        </label>
        <button type="button" onClick={() => chooseUser('')} disabled={!selectedUserId}>
          清除选择
        </button>
      </form>

      <div className="user-profile-panel-metrics" aria-live="polite">
        <div>
          <span>queryKey</span>
          <strong data-testid="user-profile-panel-query-key">{JSON.stringify(queryKey)}</strong>
        </div>
        <div>
          <span>status</span>
          <strong data-testid="user-profile-panel-status">{query.status}</strong>
        </div>
        <div>
          <span>fetchStatus</span>
          <strong>{query.fetchStatus}</strong>
        </div>
        <div>
          <span>isEnabled</span>
          <strong data-testid="user-profile-panel-enabled">{String(query.isEnabled)}</strong>
        </div>
        <div>
          <span>请求次数</span>
          <strong data-testid="user-profile-panel-request-count">{requestCount}</strong>
        </div>
      </div>

      {isWaitingForSelection && (
        <p className="user-profile-panel-message" role="status">
          尚未选择用户，查询保持未启用。
        </p>
      )}
      {query.isLoading && (
        <p className="user-profile-panel-message" role="status">
          正在读取用户资料...
        </p>
      )}
      {query.isError && (
        <p className="user-profile-panel-message" role="alert">
          {query.error.message}
        </p>
      )}
      {query.isSuccess && (
        <article className="user-profile-panel-card" data-testid="user-profile-panel-card">
          <h3>{query.data.name}</h3>
          <dl>
            <div>
              <dt>编号</dt>
              <dd>{query.data.id}</dd>
            </div>
            <div>
              <dt>角色</dt>
              <dd>{query.data.role}</dd>
            </div>
            <div>
              <dt>团队</dt>
              <dd>{query.data.team}</dd>
            </div>
          </dl>
        </article>
      )}

      <ProfileSummary queryKey={queryKey} queryFn={loadObservedProfile} enabled={isEnabled} />

      <div className="user-profile-panel-actions">
        <button type="button" onClick={refreshProfile} disabled={!isEnabled || query.isFetching}>
          手动刷新
        </button>
        <button
          type="button"
          data-tone="secondary"
          onClick={() => chooseUser('u-lin')}
          disabled={selectedUserId === 'u-lin'}
        >
          再次选择林晓
        </button>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function UserProfilePanelDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <UserProfilePanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册用户信息面板 Demo。 */
export function createUserProfilePanelDemo(): ComponentType {
  return UserProfilePanelDemoRoot
}
