import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { useState, type ComponentType, type ReactElement } from 'react'

import './query-client-provider-demo.css'

const cacheKey = ['lesson-provider-scope-message'] as const
const sharedClient = new QueryClient()
const isolatedClient = new QueryClient()
const clientLabels = new Map([
  [sharedClient, 'client-main'],
  [isolatedClient, 'client-preview'],
])

type ScopePanelProps = {
  title: string
  description: string
  revision: number
  onRevisionChange: () => void
}

/** 显示当前 Provider 作用域使用的客户端和同步缓存值。 */
function ScopeReader({
  label,
  onRevisionChange,
}: {
  label: string
  onRevisionChange: () => void
}): ReactElement {
  const queryClient = useQueryClient()
  const value = queryClient.getQueryData<string>(cacheKey) ?? '尚未写入'
  const clientLabel = clientLabels.get(queryClient) ?? '未知客户端'

  /** 通过当前作用域的 QueryClient 写入同步缓存，并通知同作用域重新读取。 */
  function writeValue(): void {
    queryClient.setQueryData(cacheKey, `${label}已写入`)
    onRevisionChange()
  }

  return (
    <article className="query-client-reader">
      <span className="query-client-reader-label">{label}</span>
      <strong>{queryClient === sharedClient ? '共享客户端' : '隔离客户端'}</strong>
      <code>{clientLabel}</code>
      <span className="query-client-reader-value">缓存值：{value}</span>
      <button type="button" onClick={writeValue}>
        写入当前客户端
      </button>
    </article>
  )
}

/** 在同一个 Provider 作用域内渲染两个读取组件，观察客户端实例共享。 */
function ScopePanel({
  title,
  description,
  revision,
  onRevisionChange,
}: ScopePanelProps): ReactElement {
  return (
    <section className="query-client-scope-panel">
      <header>
        <span className="query-client-scope-kicker">QueryClientProvider</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </header>
      <div className="query-client-reader-list" data-revision={revision}>
        <ScopeReader label="读取组件 A" onRevisionChange={onRevisionChange} />
        <ScopeReader label="读取组件 B" onRevisionChange={onRevisionChange} />
      </div>
    </section>
  )
}

/** 创建两个作用域，演示同一客户端共享与不同客户端隔离。 */
function QueryClientProviderDemoRoot(): ReactElement {
  const [sharedRevision, setSharedRevision] = useState(0)
  const [isolatedRevision, setIsolatedRevision] = useState(0)

  /** 让共享客户端作用域中的读取组件重新读取缓存。 */
  function refreshSharedScope(): void {
    setSharedRevision((revision) => revision + 1)
  }

  /** 让隔离客户端作用域中的读取组件重新读取缓存。 */
  function refreshIsolatedScope(): void {
    setIsolatedRevision((revision) => revision + 1)
  }

  return (
    <section className="query-client-provider-demo" data-testid="query-client-provider-demo">
      <header className="query-client-demo-header">
        <span className="query-client-demo-kicker">TanStack Query</span>
        <h2>客户端作用域观察器</h2>
        <p>同一 Provider 共享一个客户端；不同 Provider 可以连接到隔离客户端。</p>
      </header>

      <QueryClientProvider client={sharedClient}>
        <ScopePanel
          title="主应用作用域"
          description="两个读取组件通过同一个 QueryClient 读写同步缓存。"
          revision={sharedRevision}
          onRevisionChange={refreshSharedScope}
        />
      </QueryClientProvider>

      <QueryClientProvider client={isolatedClient}>
        <ScopePanel
          title="嵌入式预览作用域"
          description="这个 Provider 使用另一个 QueryClient，缓存值与主应用分开。"
          revision={isolatedRevision}
          onRevisionChange={refreshIsolatedScope}
        />
      </QueryClientProvider>
    </section>
  )
}

/** 为课程页面注册 QueryClient 与 Provider 作用域 Demo。 */
export function createQueryClientProviderDemo(): ComponentType {
  return QueryClientProviderDemoRoot
}
