import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import { useEffect, useRef, useState, type ComponentType, type ReactElement } from 'react'

import './article-list-and-detail-demo.css'

type ArticleSummary = {
  id: string
  title: string
  excerpt: string
}

type ArticleDetail = {
  id: string
  title: string
  body: string
}

type ArticleListQueryKey = readonly ['lesson-article-list']
type ArticleDetailQueryKey = readonly ['lesson-article-detail', string]

const articleSummaries: readonly ArticleSummary[] = [
  { id: 'a-cache', title: '查询缓存', excerpt: '相同 queryKey 会共享一份列表结果。' },
  { id: 'a-key', title: '查询键', excerpt: '列表和详情必须使用不同的查询身份。' },
]

const articleDetails: Record<string, ArticleDetail> = {
  'a-cache': {
    id: 'a-cache',
    title: '查询缓存',
    body: '列表查询缓存的是摘要数组；再次进入同一列表身份时可以直接复用。',
  },
  'a-key': {
    id: 'a-key',
    title: '查询键',
    body: '详情查询把文章 id 放进自己的 key，不会覆盖列表那一条缓存。',
  },
}

const listQueryKey: ArticleListQueryKey = ['lesson-article-list']

/** 等待固定时长并响应取消，让列表和详情的加载过程可观察。 */
function waitForArticles(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel)
      resolve()
    }, 500)

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

/** 读取文章列表；失败时按 fetch 规则检查 response.ok 并抛错。 */
async function loadArticleList(
  signal: AbortSignal,
  shouldFail: boolean,
): Promise<ArticleSummary[]> {
  await waitForArticles(signal)
  if (shouldFail) {
    const failedResponse = new Response('列表不可用', {
      status: 503,
      statusText: 'Service Unavailable',
    })
    if (!failedResponse.ok) {
      throw new Error(`读取列表失败：${failedResponse.status}`)
    }
  }
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(articleSummaries))}`
  const response = await fetch(successUrl, { signal })
  if (!response.ok) {
    throw new Error(`读取列表失败：${response.status}`)
  }
  return (await response.json()) as ArticleSummary[]
}

/** 读取单篇文章详情，未知编号走 404。 */
async function loadArticleDetail({
  queryKey,
  signal,
}: QueryFunctionContext<ArticleDetailQueryKey>): Promise<ArticleDetail> {
  const articleId = queryKey[1]
  await waitForArticles(signal)
  const detail = articleDetails[articleId]
  if (!detail) {
    const failedResponse = new Response('文章不存在', { status: 404, statusText: 'Not Found' })
    if (!failedResponse.ok) {
      throw new Error(`读取详情失败：${failedResponse.status}`)
    }
  }
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(detail))}`
  const response = await fetch(successUrl, { signal })
  if (!response.ok) {
    throw new Error(`读取详情失败：${response.status}`)
  }
  return (await response.json()) as ArticleDetail
}

/** 组合列表查询、选中文章和详情查询，并保持两条 queryKey 彼此独立。 */
function ArticleListAndDetailPanel(): ReactElement {
  const [selectedId, setSelectedId] = useState('')
  const [listRequestCount, setListRequestCount] = useState(0)
  const [detailRequestCount, setDetailRequestCount] = useState(0)
  const shouldFailListRef = useRef(false)
  const detailQueryKey: ArticleDetailQueryKey = ['lesson-article-detail', selectedId]
  const isDetailEnabled = selectedId.length > 0

  const listQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: async ({ signal }: QueryFunctionContext<ArticleListQueryKey>) => {
      setListRequestCount((count) => count + 1)
      const shouldFail = shouldFailListRef.current
      shouldFailListRef.current = false
      return loadArticleList(signal, shouldFail)
    },
    staleTime: Infinity,
    retry: false,
  })

  const detailQuery = useQuery({
    queryKey: detailQueryKey,
    queryFn: async (context: QueryFunctionContext<ArticleDetailQueryKey>) => {
      setDetailRequestCount((count) => count + 1)
      return loadArticleDetail(context)
    },
    enabled: isDetailEnabled,
    staleTime: Infinity,
    retry: false,
  })

  const isWaitingForSelection = detailQuery.isPending && detailQuery.fetchStatus === 'idle'

  /** 选中列表中的一篇文章，只改变详情查询的身份。 */
  function selectArticle(articleId: string): void {
    setSelectedId(articleId)
  }

  /** 清空选择，让详情查询回到未启用。 */
  function clearSelection(): void {
    setSelectedId('')
  }

  /** 让下一次列表读取失败，用于观察列表错误分支。 */
  function failList(): void {
    shouldFailListRef.current = true
    void listQuery.refetch()
  }

  return (
    <section className="article-list-detail-demo" data-testid="article-list-detail-demo">
      <header className="article-list-detail-header">
        <span>TanStack Query</span>
        <h2>文章列表与详情</h2>
        <p>
          列表和详情使用不同的 queryKey。先看列表，再选择一篇文章读取详情；相同文章会复用详情缓存。
        </p>
      </header>

      <div className="article-list-detail-metrics" aria-live="polite">
        <div>
          <span>列表 queryKey</span>
          <strong data-testid="article-list-query-key">{JSON.stringify(listQueryKey)}</strong>
        </div>
        <div>
          <span>列表 status</span>
          <strong data-testid="article-list-status">{listQuery.status}</strong>
        </div>
        <div>
          <span>列表请求次数</span>
          <strong data-testid="article-list-request-count">{listRequestCount}</strong>
        </div>
        <div>
          <span>详情 queryKey</span>
          <strong data-testid="article-detail-query-key">{JSON.stringify(detailQueryKey)}</strong>
        </div>
        <div>
          <span>详情 status</span>
          <strong data-testid="article-detail-status">{detailQuery.status}</strong>
        </div>
        <div>
          <span>详情请求次数</span>
          <strong data-testid="article-detail-request-count">{detailRequestCount}</strong>
        </div>
      </div>

      <div className="article-list-detail-columns">
        <section className="article-list-detail-list">
          <h3>文章列表</h3>
          {listQuery.isLoading && (
            <p className="article-list-detail-message" role="status">
              正在读取列表...
            </p>
          )}
          {listQuery.isError && (
            <p className="article-list-detail-message" role="alert">
              {listQuery.error.message}
            </p>
          )}
          {listQuery.isSuccess && (
            <ul>
              {listQuery.data.map((article) => (
                <li key={article.id}>
                  <button
                    type="button"
                    aria-pressed={selectedId === article.id}
                    onClick={() => selectArticle(article.id)}
                  >
                    {article.title}
                    <span> {article.excerpt}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="article-list-detail-detail">
          <h3>文章详情</h3>
          {isWaitingForSelection && (
            <p className="article-list-detail-message" role="status">
              尚未选择文章，详情查询保持未启用。
            </p>
          )}
          {detailQuery.isLoading && (
            <p className="article-list-detail-message" role="status">
              正在读取详情...
            </p>
          )}
          {detailQuery.isError && (
            <p className="article-list-detail-message" role="alert">
              {detailQuery.error.message}
            </p>
          )}
          {detailQuery.isSuccess && (
            <div data-testid="article-detail-card">
              <h3>{detailQuery.data.title}</h3>
              <p>{detailQuery.data.body}</p>
            </div>
          )}
        </section>
      </div>

      <div className="article-list-detail-actions">
        <button
          type="button"
          onClick={() => void listQuery.refetch()}
          disabled={listQuery.isFetching}
        >
          刷新列表
        </button>
        <button
          type="button"
          onClick={() => void detailQuery.refetch()}
          disabled={!isDetailEnabled || detailQuery.isFetching}
        >
          刷新详情
        </button>
        <button
          type="button"
          data-tone="secondary"
          onClick={failList}
          disabled={listQuery.isFetching}
        >
          模拟列表失败
        </button>
        <button type="button" data-tone="secondary" onClick={() => selectArticle('a-missing')}>
          打开缺失文章
        </button>
        <button type="button" data-tone="secondary" onClick={clearSelection} disabled={!selectedId}>
          清除选择
        </button>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function ArticleListAndDetailDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <ArticleListAndDetailPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册文章列表与详情 Demo。 */
export function createArticleListAndDetailDemo(): ComponentType {
  return ArticleListAndDetailDemoRoot
}
