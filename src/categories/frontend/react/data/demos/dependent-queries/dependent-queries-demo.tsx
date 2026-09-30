import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import { useCallback, useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './dependent-queries-demo.css'

type UserEmail = 'lin@team.local' | 'zhou@team.local'

type UserProfile = {
  id: string
  name: string
  email: UserEmail
}

type UserProject = {
  id: string
  title: string
}

type UserQueryKey = readonly ['users', 'detail', UserEmail]
type ProjectQueryKey = readonly ['projects', 'list', string | undefined]

type ObservedUserFn = (context: QueryFunctionContext<UserQueryKey>) => Promise<UserProfile>
type ObservedProjectFn = (context: QueryFunctionContext<ProjectQueryKey>) => Promise<UserProject[]>

const usersByEmail: Record<UserEmail, UserProfile> = {
  'lin@team.local': { id: 'u-lin', name: '林晓', email: 'lin@team.local' },
  'zhou@team.local': { id: 'u-zhou', name: '周宁', email: 'zhou@team.local' },
}

const projectsByUser: Record<string, UserProject[]> = {
  'u-lin': [{ id: 'p-cache', title: '查询缓存整理' }],
  'u-zhou': [{ id: 'p-key', title: '查询键分层' }],
}

/** 等待固定时长并响应取消，让用户查询和项目查询的先后关系可观察。 */
function waitForDependent(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel)
      resolve()
    }, 420)

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

/** 按邮箱读取用户；项目查询需要等这里的 id。 */
async function loadUser({
  queryKey,
  signal,
}: QueryFunctionContext<UserQueryKey>): Promise<UserProfile> {
  const email = queryKey[2]
  await waitForDependent(signal)
  const user = usersByEmail[email]
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(user))}`
  const response = await fetch(successUrl, { signal })
  if (!response.ok) {
    throw new Error(`读取用户失败：${response.status}`)
  }
  return (await response.json()) as UserProfile
}

/** 按用户 id 读取项目列表。 */
async function loadProjects({
  queryKey,
  signal,
}: QueryFunctionContext<ProjectQueryKey>): Promise<UserProject[]> {
  const userId = queryKey[2]
  if (!userId) {
    throw new Error('缺少用户 id，不能读取项目')
  }
  await waitForDependent(signal)
  const projects = projectsByUser[userId] ?? []
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(projects))}`
  const response = await fetch(successUrl, { signal })
  if (!response.ok) {
    throw new Error(`读取项目失败：${response.status}`)
  }
  return (await response.json()) as UserProject[]
}

/** 把用户查询的身份和请求收进同一份配置。 */
function userOptions(email: UserEmail, queryFn: ObservedUserFn) {
  return queryOptions({
    queryKey: ['users', 'detail', email] as const,
    queryFn,
    staleTime: Infinity,
    retry: false,
  })
}

/** 把项目查询收进配置，并在缺少用户 id 时保持未启用。 */
function projectOptions(userId: string | undefined, queryFn: ObservedProjectFn) {
  return queryOptions({
    queryKey: ['projects', 'list', userId] as const,
    queryFn,
    enabled: Boolean(userId),
    staleTime: Infinity,
    retry: false,
  })
}

/** 先读用户，再按用户 id 启用项目查询。 */
function DependentQueriesPanel(): ReactElement {
  const [email, setEmail] = useState<UserEmail>('lin@team.local')
  const [userRequestCount, setUserRequestCount] = useState(0)
  const [projectRequestCount, setProjectRequestCount] = useState(0)
  const loadObservedUser = useCallback(async (context: QueryFunctionContext<UserQueryKey>) => {
    setUserRequestCount((count) => count + 1)
    return loadUser(context)
  }, [])
  const loadObservedProjects = useCallback(
    async (context: QueryFunctionContext<ProjectQueryKey>) => {
      setProjectRequestCount((count) => count + 1)
      return loadProjects(context)
    },
    [],
  )
  const sharedUserOptions = userOptions(email, loadObservedUser)
  const userQuery = useQuery(sharedUserOptions)
  const userId = userQuery.data?.id
  const sharedProjectOptions = projectOptions(userId, loadObservedProjects)
  const projectQuery = useQuery(sharedProjectOptions)

  /** 切换要读取的用户邮箱，项目查询会等待新的用户 id。 */
  function selectEmail(nextEmail: UserEmail): void {
    setEmail(nextEmail)
  }

  return (
    <section className="dependent-queries-demo" data-testid="dependent-queries-demo">
      <header className="dependent-queries-header">
        <span>TanStack Query</span>
        <h2>依赖查询</h2>
        <p>
          项目查询等到用户 id 出现后才启用。未启用时看 isLoading，不要把空闲的 pending
          当成正在读取。
        </p>
      </header>

      <div className="dependent-queries-metrics" aria-live="polite">
        <div>
          <span>用户请求次数</span>
          <strong data-testid="dependent-queries-user-count">{userRequestCount}</strong>
        </div>
        <div>
          <span>项目请求次数</span>
          <strong data-testid="dependent-queries-project-count">{projectRequestCount}</strong>
        </div>
        <div>
          <span>项目 status</span>
          <strong data-testid="dependent-queries-project-status">{projectQuery.status}</strong>
        </div>
        <div>
          <span>项目 fetchStatus</span>
          <strong data-testid="dependent-queries-project-fetch">{projectQuery.fetchStatus}</strong>
        </div>
        <div>
          <span>项目 isLoading</span>
          <strong data-testid="dependent-queries-project-loading">
            {String(projectQuery.isLoading)}
          </strong>
        </div>
        <div>
          <span>项目 queryKey</span>
          <strong data-testid="dependent-queries-project-key">
            {userId ? JSON.stringify(sharedProjectOptions.queryKey) : '等待用户 id'}
          </strong>
        </div>
      </div>

      <div className="dependent-queries-actions">
        <button
          type="button"
          aria-pressed={email === 'lin@team.local'}
          onClick={() => selectEmail('lin@team.local')}
        >
          林晓
        </button>
        <button
          type="button"
          aria-pressed={email === 'zhou@team.local'}
          onClick={() => selectEmail('zhou@team.local')}
        >
          周宁
        </button>
      </div>

      <div className="dependent-queries-columns">
        <section className="dependent-queries-card" data-testid="dependent-queries-user">
          <h3>用户查询</h3>
          {userQuery.isLoading && (
            <p className="dependent-queries-message" role="status">
              正在读取用户...
            </p>
          )}
          {userQuery.isError && (
            <p className="dependent-queries-message" role="alert">
              {userQuery.error.message}
            </p>
          )}
          {userQuery.isSuccess && (
            <p data-testid="dependent-queries-user-name">
              {userQuery.data.name} / {userQuery.data.id}
            </p>
          )}
        </section>
        <section className="dependent-queries-card" data-testid="dependent-queries-projects">
          <h3>项目查询</h3>
          {!userId && (
            <p className="dependent-queries-message" role="status">
              等待用户 id 后才启用。
            </p>
          )}
          {projectQuery.isLoading && (
            <p className="dependent-queries-message" role="status">
              正在读取项目...
            </p>
          )}
          {projectQuery.isError && (
            <p className="dependent-queries-message" role="alert">
              {projectQuery.error.message}
            </p>
          )}
          {projectQuery.isSuccess && (
            <ul data-testid="dependent-queries-project-list">
              {projectQuery.data.map((project) => (
                <li key={project.id}>{project.title}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function DependentQueriesDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <DependentQueriesPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册依赖查询 Demo。 */
export function createDependentQueriesDemo(): ComponentType {
  return DependentQueriesDemoRoot
}
