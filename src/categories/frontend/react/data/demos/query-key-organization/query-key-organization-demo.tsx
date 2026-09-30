import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './query-key-organization-demo.css'

type ArticleStatus = 'all' | 'published'

type ArticleSummary = {
  id: string
  title: string
  status: 'published' | 'draft'
}

type ArticleDetail = {
  id: string
  title: string
  body: string
}

type ArticleComment = {
  id: string
  body: string
}

type ArticleListFilters = { status: ArticleStatus }
type ArticleListQueryKey = readonly ['articles', 'list', ArticleListFilters]
type ArticleDetailQueryKey = readonly ['articles', 'detail', string]
type CommentListQueryKey = readonly ['comments', 'list', string]

const articleSummaries: readonly ArticleSummary[] = [
  { id: 'a-cache', title: '查询缓存', status: 'published' },
  { id: 'a-key', title: '查询键', status: 'draft' },
]

const articleDetails: Record<string, ArticleDetail> = {
  'a-cache': {
    id: 'a-cache',
    title: '查询缓存',
    body: '列表和详情共享 articles 前缀，但分段不同，因此是两份缓存。',
  },
  'a-key': {
    id: 'a-key',
    title: '查询键',
    body: '详情 key 把文章 id 放在 detail 分段后面，不会覆盖列表。',
  },
}

const commentsByArticle: Record<string, ArticleComment[]> = {
  'a-cache': [{ id: 'c-1', body: '评论走独立的 comments 根前缀。' }],
  'a-key': [{ id: 'c-2', body: '文章前缀匹配不应扫进评论。' }],
}

const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (filters: ArticleListFilters) => [...articleKeys.lists(), filters] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
}

const commentKeys = {
  all: ['comments'] as const,
  list: (articleId: string) => [...commentKeys.all, 'list', articleId] as const,
}

/** 等待固定时长并响应取消，让列表、详情和评论的加载过程可观察。 */
function waitForKeyDemo(signal: AbortSignal): Promise<void> {
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

/** 按筛选条件读取文章列表，失败时检查 response.ok。 */
async function loadArticleList({
  queryKey,
  signal,
}: QueryFunctionContext<ArticleListQueryKey>): Promise<ArticleSummary[]> {
  const filters = queryKey[2]
  await waitForKeyDemo(signal)
  const items =
    filters.status === 'all'
      ? articleSummaries
      : articleSummaries.filter((article) => article.status === 'published')
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(items))}`
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
  const articleId = queryKey[2]
  await waitForKeyDemo(signal)
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

/** 读取文章评论；评论使用独立根前缀，不挂到 articles 树上。 */
async function loadCommentList({
  queryKey,
  signal,
}: QueryFunctionContext<CommentListQueryKey>): Promise<ArticleComment[]> {
  const articleId = queryKey[2]
  await waitForKeyDemo(signal)
  const comments = commentsByArticle[articleId] ?? []
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(comments))}`
  const response = await fetch(successUrl, { signal })
  if (!response.ok) {
    throw new Error(`读取评论失败：${response.status}`)
  }
  return (await response.json()) as ArticleComment[]
}

/** 把匹配到的 queryKey 格式化成可阅读的字符串列表。 */
function formatMatchedKeys(entries: Array<[readonly unknown[], unknown]>): string {
  if (entries.length === 0) {
    return '无'
  }
  return entries.map(([queryKey]) => JSON.stringify(queryKey)).join('；')
}

type SelectedResourceQueriesProps = {
  selectedId: string
  onDetailRequest: () => void
  onCommentRequest: () => void
}

/** 已选择文章后才挂载详情和评论，避免空 id 进入缓存。 */
function SelectedResourceQueries({
  selectedId,
  onDetailRequest,
  onCommentRequest,
}: SelectedResourceQueriesProps): ReactElement {
  const detailQueryKey = articleKeys.detail(selectedId)
  const commentQueryKey = commentKeys.list(selectedId)

  const detailQuery = useQuery({
    queryKey: detailQueryKey,
    queryFn: async (context: QueryFunctionContext<ArticleDetailQueryKey>) => {
      onDetailRequest()
      return loadArticleDetail(context)
    },
    staleTime: Infinity,
    retry: false,
  })

  const commentQuery = useQuery({
    queryKey: commentQueryKey,
    queryFn: async (context: QueryFunctionContext<CommentListQueryKey>) => {
      onCommentRequest()
      return loadCommentList(context)
    },
    staleTime: Infinity,
    retry: false,
  })

  return (
    <>
      {detailQuery.isLoading && (
        <p className="query-key-org-message" role="status">
          正在读取详情...
        </p>
      )}
      {detailQuery.isError && (
        <p className="query-key-org-message" role="alert">
          {detailQuery.error.message}
        </p>
      )}
      {detailQuery.isSuccess && (
        <div data-testid="query-key-org-detail-card">
          <h3>{detailQuery.data.title}</h3>
          <p>{detailQuery.data.body}</p>
        </div>
      )}
      {commentQuery.isSuccess && (
        <p data-testid="query-key-org-comment-body">
          {commentQuery.data.map((comment) => comment.body).join(' ')}
        </p>
      )}
    </>
  )
}

/** 用层次化工厂声明列表、详情和评论，并对照前缀匹配与精确匹配。 */
function QueryKeyOrganizationPanel(): ReactElement {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<ArticleStatus>('all')
  const [selectedId, setSelectedId] = useState('')
  const [listRequestCount, setListRequestCount] = useState(0)
  const [detailRequestCount, setDetailRequestCount] = useState(0)
  const [commentRequestCount, setCommentRequestCount] = useState(0)
  const listQueryKey = articleKeys.list({ status })
  const detailQueryKey = selectedId ? articleKeys.detail(selectedId) : null
  const commentQueryKey = selectedId ? commentKeys.list(selectedId) : null
  const [matchTick, setMatchTick] = useState(0)

  /** 等列表筛选或详情挂载提交后再读一次匹配结果。 */
  useEffect(() => {
    setMatchTick((count) => count + 1)
  }, [selectedId, status])

  const listQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: async (context: QueryFunctionContext<ArticleListQueryKey>) => {
      setListRequestCount((count) => count + 1)
      return loadArticleList(context)
    },
    staleTime: Infinity,
    retry: false,
  })

  const prefixAll = formatMatchedKeys(
    queryClient.getQueriesData({ queryKey: articleKeys.all, type: 'active' }),
  )
  const prefixLists = formatMatchedKeys(
    queryClient.getQueriesData({ queryKey: articleKeys.lists(), type: 'active' }),
  )
  const prefixDetails = formatMatchedKeys(
    queryClient.getQueriesData({ queryKey: articleKeys.details(), type: 'active' }),
  )
  const prefixComments = formatMatchedKeys(
    queryClient.getQueriesData({ queryKey: commentKeys.all, type: 'active' }),
  )
  const exactAll = formatMatchedKeys(
    queryClient.getQueriesData({ queryKey: articleKeys.all, exact: true, type: 'active' }),
  )

  /** 切换列表筛选，只更换 list 分段上的条件对象。 */
  function selectStatus(nextStatus: ArticleStatus): void {
    setStatus(nextStatus)
  }

  /** 选中一篇文章，随后挂载详情查询和评论查询。 */
  function selectArticle(articleId: string): void {
    setSelectedId(articleId)
  }

  /** 清空选择，卸载详情和评论观察者。 */
  function clearSelection(): void {
    setSelectedId('')
  }

  /** 记录一次详情请求，便于观察缓存复用。 */
  function markDetailRequest(): void {
    setDetailRequestCount((count) => count + 1)
  }

  /** 记录一次评论请求，便于和文章前缀对照。 */
  function markCommentRequest(): void {
    setCommentRequestCount((count) => count + 1)
  }

  return (
    <section className="query-key-org-demo" data-testid="query-key-org-demo">
      <header className="query-key-org-header">
        <span>TanStack Query</span>
        <h2>Query Key 组织</h2>
        <p>
          文章列表、文章详情和评论使用工厂拼出的层次化 key。下方对照前缀匹配与精确匹配，不触发作废。
        </p>
      </header>

      <div className="query-key-org-metrics" aria-live="polite">
        <div>
          <span>列表 queryKey</span>
          <strong data-testid="query-key-org-list-key">{JSON.stringify(listQueryKey)}</strong>
        </div>
        <div>
          <span>详情 queryKey</span>
          <strong data-testid="query-key-org-detail-key">
            {detailQueryKey ? JSON.stringify(detailQueryKey) : '未选择'}
          </strong>
        </div>
        <div>
          <span>评论 queryKey</span>
          <strong data-testid="query-key-org-comment-key">
            {commentQueryKey ? JSON.stringify(commentQueryKey) : '未选择'}
          </strong>
        </div>
        <div>
          <span>列表请求次数</span>
          <strong data-testid="query-key-org-list-count">{listRequestCount}</strong>
        </div>
        <div>
          <span>详情请求次数</span>
          <strong data-testid="query-key-org-detail-count">{detailRequestCount}</strong>
        </div>
        <div>
          <span>评论请求次数</span>
          <strong data-testid="query-key-org-comment-count">{commentRequestCount}</strong>
        </div>
      </div>

      <div className="query-key-org-actions">
        <button type="button" aria-pressed={status === 'all'} onClick={() => selectStatus('all')}>
          全部文章
        </button>
        <button
          type="button"
          aria-pressed={status === 'published'}
          onClick={() => selectStatus('published')}
        >
          已发布
        </button>
        <button type="button" data-tone="secondary" onClick={clearSelection} disabled={!selectedId}>
          清除选择
        </button>
      </div>

      <div className="query-key-org-columns">
        <section className="query-key-org-list">
          <h3>文章列表</h3>
          {listQuery.isLoading && (
            <p className="query-key-org-message" role="status">
              正在读取列表...
            </p>
          )}
          {listQuery.isError && (
            <p className="query-key-org-message" role="alert">
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
                    <span> {article.status === 'published' ? '已发布' : '草稿'}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="query-key-org-detail">
          <h3>文章详情</h3>
          {selectedId ? (
            <SelectedResourceQueries
              selectedId={selectedId}
              onDetailRequest={markDetailRequest}
              onCommentRequest={markCommentRequest}
            />
          ) : (
            <p className="query-key-org-message" role="status">
              尚未选择文章，详情和评论保持未启用。
            </p>
          )}
        </section>
      </div>

      <section className="query-key-org-matches" aria-live="polite" data-match-tick={matchTick}>
        <h3>匹配结果</h3>
        <p>
          <span>前缀 articles</span>
          <strong data-testid="query-key-org-prefix-all">{prefixAll}</strong>
        </p>
        <p>
          <span>前缀 articles/list</span>
          <strong data-testid="query-key-org-prefix-lists">{prefixLists}</strong>
        </p>
        <p>
          <span>前缀 articles/detail</span>
          <strong data-testid="query-key-org-prefix-details">{prefixDetails}</strong>
        </p>
        <p>
          <span>前缀 comments</span>
          <strong data-testid="query-key-org-prefix-comments">{prefixComments}</strong>
        </p>
        <p>
          <span>精确 articles</span>
          <strong data-testid="query-key-org-exact-all">{exactAll}</strong>
        </p>
      </section>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function QueryKeyOrganizationDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <QueryKeyOrganizationPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册 Query Key 组织 Demo。 */
export function createQueryKeyOrganizationDemo(): ComponentType {
  return QueryKeyOrganizationDemoRoot
}
