import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useState, type ComponentType, type ReactElement } from 'react'

import './server-state-demo.css'

type Ticket = { id: string; title: string; owner: string; status: '待处理' | '处理中' }

const serverTickets: Ticket[] = [
  { id: 't-101', title: '整理 API 文档', owner: '林晓', status: '待处理' },
  { id: 't-102', title: '复核缓存策略', owner: '周宁', status: '处理中' },
  { id: 't-103', title: '补充错误边界', owner: '陈默', status: '待处理' },
]

const queryClient = new QueryClient()

/** 模拟一次延迟的远程读取，让服务端状态的异步特征可被观察。 */
function loadServerTickets(): Promise<Ticket[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(serverTickets), 650)
  })
}

/** 展示远程任务与只影响当前视图的本地筛选。 */
function ServerStatePanel(): ReactElement {
  const [filter, setFilter] = useState<'全部' | Ticket['status']>('全部')
  const query = useQuery({
    queryKey: ['lesson-server-tickets'],
    queryFn: loadServerTickets,
  })
  const visibleTickets = (query.data ?? []).filter(
    (ticket) => filter === '全部' || ticket.status === filter,
  )

  return (
    <section className="server-state-demo" data-testid="server-state-demo">
      <header className="server-state-heading">
        <span>TanStack Query</span>
        <h2>远程任务与本地视图</h2>
        <p>任务列表由服务端状态工具管理，当前筛选仍属于 React State。</p>
      </header>

      <label className="server-state-filter">
        <span>当前视图</span>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as '全部' | Ticket['status'])}
        >
          <option value="全部">全部任务</option>
          <option value="待处理">待处理</option>
          <option value="处理中">处理中</option>
        </select>
      </label>

      {query.isPending && <p className="server-state-message">正在读取远程任务...</p>}
      {query.isError && (
        <p className="server-state-message server-state-error" role="alert">
          暂时无法读取远程任务
        </p>
      )}
      {query.isSuccess && (
        <ul className="server-state-list">
          {visibleTickets.map((ticket) => (
            <li key={ticket.id}>
              <strong>{ticket.title}</strong>
              <span>
                {ticket.owner} · {ticket.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** 创建带 QueryClientProvider 的服务端状态观察 Demo。 */
function ServerStateDemoRoot(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ServerStatePanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册服务端状态 Demo。 */
export function createServerStateDemo(): ComponentType {
  return ServerStateDemoRoot
}
