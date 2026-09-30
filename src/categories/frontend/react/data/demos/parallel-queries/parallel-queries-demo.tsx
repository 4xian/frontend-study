import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQueries,
  useQuery,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import { useCallback, useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './parallel-queries-demo.css'

type MemberId = 'u-lin' | 'u-zhou'

type NamedItem = {
  id: string
  title: string
}

type MemberProfile = {
  id: MemberId
  name: string
  title: string
}

type UsersQueryKey = readonly ['users', 'list']
type TeamsQueryKey = readonly ['teams', 'list']
type MemberQueryKey = readonly ['users', 'detail', MemberId]

type ObservedUsersFn = (context: QueryFunctionContext<UsersQueryKey>) => Promise<NamedItem[]>
type ObservedTeamsFn = (context: QueryFunctionContext<TeamsQueryKey>) => Promise<NamedItem[]>
type ObservedMemberFn = (context: QueryFunctionContext<MemberQueryKey>) => Promise<MemberProfile>

const userList: NamedItem[] = [
  { id: 'u-lin', title: '林晓' },
  { id: 'u-zhou', title: '周宁' },
]

const teamList: NamedItem[] = [
  { id: 't-cache', title: '缓存组' },
  { id: 't-key', title: '查询键组' },
]

const membersById: Record<MemberId, MemberProfile> = {
  'u-lin': { id: 'u-lin', name: '林晓', title: '查询缓存整理' },
  'u-zhou': { id: 'u-zhou', name: '周宁', title: '查询键分层' },
}

/** 等待固定时长并响应取消，让并行查询的重叠过程可观察。 */
function waitForParallel(signal: AbortSignal, delayMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel)
      resolve()
    }, delayMs)

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

/** 读取用户列表；时长较短，便于对照团队查询仍在进行。 */
async function loadUsers({ signal }: QueryFunctionContext<UsersQueryKey>): Promise<NamedItem[]> {
  await waitForParallel(signal, 420)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(userList))}`
  const response = await fetch(successUrl, { signal })
  if (!response.ok) {
    throw new Error(`读取用户失败：${response.status}`)
  }
  return (await response.json()) as NamedItem[]
}

/** 读取团队列表；时长更长，进入后会和用户查询同时 fetching。 */
async function loadTeams({ signal }: QueryFunctionContext<TeamsQueryKey>): Promise<NamedItem[]> {
  await waitForParallel(signal, 700)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(teamList))}`
  const response = await fetch(successUrl, { signal })
  if (!response.ok) {
    throw new Error(`读取团队失败：${response.status}`)
  }
  return (await response.json()) as NamedItem[]
}

/** 按成员 id 读取详情。 */
async function loadMember({
  queryKey,
  signal,
}: QueryFunctionContext<MemberQueryKey>): Promise<MemberProfile> {
  const memberId = queryKey[2]
  await waitForParallel(signal, 420)
  const member = membersById[memberId]
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(member))}`
  const response = await fetch(successUrl, { signal })
  if (!response.ok) {
    throw new Error(`读取成员失败：${response.status}`)
  }
  return (await response.json()) as MemberProfile
}

/** 把用户列表的身份和请求收进同一份配置。 */
function usersOptions(queryFn: ObservedUsersFn) {
  return queryOptions({
    queryKey: ['users', 'list'] as const,
    queryFn,
    staleTime: Infinity,
    retry: false,
  })
}

/** 把团队列表的身份和请求收进同一份配置。 */
function teamsOptions(queryFn: ObservedTeamsFn) {
  return queryOptions({
    queryKey: ['teams', 'list'] as const,
    queryFn,
    staleTime: Infinity,
    retry: false,
  })
}

/** 把单个成员详情收进配置，供数量会变的 useQueries 使用。 */
function memberOptions(memberId: MemberId, queryFn: ObservedMemberFn) {
  return queryOptions({
    queryKey: ['users', 'detail', memberId] as const,
    queryFn,
    staleTime: Infinity,
    retry: false,
  })
}

/** 固定数量并排查询，数量变化时改用 useQueries。 */
function ParallelQueriesPanel(): ReactElement {
  const [selectedIds, setSelectedIds] = useState<MemberId[]>(['u-lin'])
  const [userRequestCount, setUserRequestCount] = useState(0)
  const [teamRequestCount, setTeamRequestCount] = useState(0)
  const [memberRequestCount, setMemberRequestCount] = useState(0)
  const loadObservedUsers = useCallback(async (context: QueryFunctionContext<UsersQueryKey>) => {
    setUserRequestCount((count) => count + 1)
    return loadUsers(context)
  }, [])
  const loadObservedTeams = useCallback(async (context: QueryFunctionContext<TeamsQueryKey>) => {
    setTeamRequestCount((count) => count + 1)
    return loadTeams(context)
  }, [])
  const loadObservedMember = useCallback(async (context: QueryFunctionContext<MemberQueryKey>) => {
    setMemberRequestCount((count) => count + 1)
    return loadMember(context)
  }, [])
  const usersQuery = useQuery(usersOptions(loadObservedUsers))
  const teamsQuery = useQuery(teamsOptions(loadObservedTeams))
  const memberQueries = useQueries({
    queries: selectedIds.map((memberId) => memberOptions(memberId, loadObservedMember)),
  })

  /** 增删要并行读取的成员，改变 useQueries 的数组长度。 */
  function toggleMember(memberId: MemberId): void {
    setSelectedIds((current) =>
      current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId],
    )
  }

  return (
    <section className="parallel-queries-demo" data-testid="parallel-queries-demo">
      <header className="parallel-queries-header">
        <span>TanStack Query</span>
        <h2>并行查询</h2>
        <p>
          用户和团队互不依赖，并排放两个 useQuery 会同时开始。成员数量会变，改用 useQueries
          映射选中的 id。
        </p>
      </header>

      <div className="parallel-queries-metrics" aria-live="polite">
        <div>
          <span>用户请求次数</span>
          <strong data-testid="parallel-queries-user-count">{userRequestCount}</strong>
        </div>
        <div>
          <span>团队请求次数</span>
          <strong data-testid="parallel-queries-team-count">{teamRequestCount}</strong>
        </div>
        <div>
          <span>成员请求次数</span>
          <strong data-testid="parallel-queries-member-count">{memberRequestCount}</strong>
        </div>
        <div>
          <span>用户 fetchStatus</span>
          <strong data-testid="parallel-queries-user-fetch">{usersQuery.fetchStatus}</strong>
        </div>
        <div>
          <span>团队 fetchStatus</span>
          <strong data-testid="parallel-queries-team-fetch">{teamsQuery.fetchStatus}</strong>
        </div>
        <div>
          <span>同时 fetching</span>
          <strong data-testid="parallel-queries-both-fetching">
            {String(usersQuery.isFetching && teamsQuery.isFetching)}
          </strong>
        </div>
        <div>
          <span>成员查询条数</span>
          <strong data-testid="parallel-queries-member-length">{memberQueries.length}</strong>
        </div>
      </div>

      <div className="parallel-queries-actions">
        <button
          type="button"
          aria-pressed={selectedIds.includes('u-lin')}
          onClick={() => toggleMember('u-lin')}
        >
          林晓
        </button>
        <button
          type="button"
          aria-pressed={selectedIds.includes('u-zhou')}
          onClick={() => toggleMember('u-zhou')}
        >
          周宁
        </button>
      </div>

      <div className="parallel-queries-columns">
        <section className="parallel-queries-card" data-testid="parallel-queries-users">
          <h3>用户查询</h3>
          {usersQuery.isLoading && (
            <p className="parallel-queries-message" role="status">
              正在读取用户...
            </p>
          )}
          {usersQuery.isError && (
            <p className="parallel-queries-message" role="alert">
              {usersQuery.error.message}
            </p>
          )}
          {usersQuery.isSuccess && (
            <ul data-testid="parallel-queries-user-list">
              {usersQuery.data.map((user) => (
                <li key={user.id}>{user.title}</li>
              ))}
            </ul>
          )}
        </section>
        <section className="parallel-queries-card" data-testid="parallel-queries-teams">
          <h3>团队查询</h3>
          {teamsQuery.isLoading && (
            <p className="parallel-queries-message" role="status">
              正在读取团队...
            </p>
          )}
          {teamsQuery.isError && (
            <p className="parallel-queries-message" role="alert">
              {teamsQuery.error.message}
            </p>
          )}
          {teamsQuery.isSuccess && (
            <ul data-testid="parallel-queries-team-list">
              {teamsQuery.data.map((team) => (
                <li key={team.id}>{team.title}</li>
              ))}
            </ul>
          )}
        </section>
        <section className="parallel-queries-card" data-testid="parallel-queries-members">
          <h3>成员查询</h3>
          {selectedIds.length === 0 && (
            <p className="parallel-queries-message" role="status">
              没有选中成员，useQueries 收到空数组。
            </p>
          )}
          <ul data-testid="parallel-queries-member-list">
            {memberQueries.map((query, index) => {
              const memberId = selectedIds[index]
              if (query.isLoading) {
                return (
                  <li key={memberId}>
                    <p className="parallel-queries-message" role="status">
                      正在读取成员...
                    </p>
                  </li>
                )
              }
              if (query.isError) {
                return (
                  <li key={memberId}>
                    <p className="parallel-queries-message" role="alert">
                      {query.error.message}
                    </p>
                  </li>
                )
              }
              if (query.isSuccess) {
                return (
                  <li key={query.data.id}>
                    {query.data.name} / {query.data.title}
                  </li>
                )
              }
              return null
            })}
          </ul>
        </section>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function ParallelQueriesDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <ParallelQueriesPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册并行查询 Demo。 */
export function createParallelQueriesDemo(): ComponentType {
  return ParallelQueriesDemoRoot
}
