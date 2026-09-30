import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  useQueryClient,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import { useCallback, useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './query-options-reuse-demo.css'

type ArticleDetail = {
  id: string
  title: string
  body: string
}

type ArticleDetailQueryKey = readonly ['articles', 'detail', string]

const articleDetails: Record<string, ArticleDetail> = {
  'a-cache': {
    id: 'a-cache',
    title: '查询缓存',
    body: '完整观察者读取整篇文章，摘要观察者只选出标题。',
  },
  'a-key': {
    id: 'a-key',
    title: '查询键',
    body: '两处都展开同一份 queryOptions，缓存里仍是完整对象。',
  },
}

const articleKeys = {
  all: ['articles'] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
}

/** 等待固定时长并响应取消，让配置复用时的加载过程可观察。 */
function waitForArticle(signal: AbortSignal): Promise<void> {
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

/** 按详情 key 读取文章，失败时检查 response.ok。 */
async function loadArticleDetail({
  queryKey,
  signal,
}: QueryFunctionContext<ArticleDetailQueryKey>): Promise<ArticleDetail> {
  const articleId = queryKey[2]
  await waitForArticle(signal)
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

type ObservedArticleFn = (
  context: QueryFunctionContext<ArticleDetailQueryKey>,
) => Promise<ArticleDetail>

/** 把同一篇文章的 queryKey、queryFn 和新鲜度收进一份可复用配置。 */
function articleOptions(articleId: string, queryFn: ObservedArticleFn) {
  return queryOptions({
    queryKey: articleKeys.detail(articleId),
    queryFn,
    staleTime: Infinity,
    retry: false,
  })
}

/** 用 queryOptions 复用查询配置，并对照缓存中的完整数据。 */
function QueryOptionsReusePanel(): ReactElement {
  const queryClient = useQueryClient()
  const [articleId, setArticleId] = useState('a-cache')
  const [requestCount, setRequestCount] = useState(0)
  const loadObservedArticle = useCallback(
    async (context: QueryFunctionContext<ArticleDetailQueryKey>) => {
      setRequestCount((count) => count + 1)
      return loadArticleDetail(context)
    },
    [],
  )
  const sharedOptions = articleOptions(articleId, loadObservedArticle)
  const detailQuery = useQuery(sharedOptions)
  const titleQuery = useQuery({
    ...sharedOptions,
    select: (article) => article.title,
  })
  const cachedArticle = queryClient.getQueryData(sharedOptions.queryKey)

  /** 切换要复用的文章身份。 */
  function selectArticle(nextId: string): void {
    setArticleId(nextId)
  }

  return (
    <section className="query-options-reuse-demo" data-testid="query-options-reuse-demo">
      <header className="query-options-reuse-header">
        <span>TanStack Query</span>
        <h2>查询配置复用</h2>
        <p>
          两处观察者展开同一份
          queryOptions。完整观察者读取整篇文章，摘要观察者只选出标题；缓存仍保存完整对象。
        </p>
      </header>

      <div className="query-options-reuse-metrics" aria-live="polite">
        <div>
          <span>共享 queryKey</span>
          <strong data-testid="query-options-reuse-key">
            {JSON.stringify(sharedOptions.queryKey)}
          </strong>
        </div>
        <div>
          <span>请求次数</span>
          <strong data-testid="query-options-reuse-count">{requestCount}</strong>
        </div>
        <div>
          <span>缓存标题</span>
          <strong data-testid="query-options-reuse-cached-title">
            {cachedArticle ? cachedArticle.title : '尚未写入'}
          </strong>
        </div>
      </div>

      <div className="query-options-reuse-actions">
        <button
          type="button"
          aria-pressed={articleId === 'a-cache'}
          onClick={() => selectArticle('a-cache')}
        >
          查询缓存
        </button>
        <button
          type="button"
          aria-pressed={articleId === 'a-key'}
          onClick={() => selectArticle('a-key')}
        >
          查询键
        </button>
      </div>

      <div className="query-options-reuse-columns">
        <section className="query-options-reuse-card" data-testid="query-options-reuse-detail">
          <h3>完整观察者</h3>
          {detailQuery.isLoading && (
            <p className="query-options-reuse-message" role="status">
              正在读取文章...
            </p>
          )}
          {detailQuery.isError && (
            <p className="query-options-reuse-message" role="alert">
              {detailQuery.error.message}
            </p>
          )}
          {detailQuery.isSuccess && (
            <>
              <p data-testid="query-options-reuse-detail-title">{detailQuery.data.title}</p>
              <p data-testid="query-options-reuse-detail-body">{detailQuery.data.body}</p>
            </>
          )}
        </section>
        <section className="query-options-reuse-summary" data-testid="query-options-reuse-title">
          <h3>摘要观察者</h3>
          {titleQuery.isSuccess && (
            <p data-testid="query-options-reuse-selected-title">{titleQuery.data}</p>
          )}
          <p>摘要只选出标题，不改写缓存里的完整文章。</p>
        </section>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function QueryOptionsReuseDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <QueryOptionsReusePanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册查询配置复用 Demo。 */
export function createQueryOptionsReuseDemo(): ComponentType {
  return QueryOptionsReuseDemoRoot
}
