import { useEffect } from 'react'
import {
  Form,
  Link,
  Outlet,
  RouterProvider,
  createMemoryRouter,
  redirect,
  useFetcher,
  useLoaderData,
  useLocation,
  useMatches,
  useNavigation,
  type LoaderFunctionArgs,
  type MiddlewareFunction,
  type RouteObject,
  type UIMatch,
} from 'react-router'

import {
  createContentRepository,
  workspaceUserContext,
  type ContentFilters,
  type ContentRecord,
  type WorkspaceUser,
} from './content-management-workspace-data'
import './content-management-workspace-demo.css'

type WorkspaceData = {
  user: WorkspaceUser
  stats: { total: number; draft: number; published: number }
  loaderCalls: number
}

type ContentListData = {
  filters: ContentFilters
  contents: ContentRecord[]
  loaderCalls: number
}

type BreadcrumbHandle = {
  breadcrumb?: string | ((match: UIMatch) => string)
}

/** 从 URL 读取列表过滤器，确保过滤状态只有一个来源。 */
function readFilters(request: Request): ContentFilters {
  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  return {
    query: url.searchParams.get('q')?.trim() ?? '',
    status: status === 'draft' || status === 'published' ? status : 'all',
  }
}

/** 提供可取消的短延时，让重新验证状态能够被观察。 */
function waitForRequest(signal: AbortSignal, delay: number): Promise<void> {
  return new Promise((resolve, reject) => {
    /** 在导航取消时释放当前计时器。 */
    function handleAbort() {
      window.clearTimeout(timer)
      reject(new DOMException('Request aborted', 'AbortError'))
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, delay)

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}

/** 展示当前 active matches 中由 route handle 声明的面包屑。 */
function Breadcrumbs() {
  const matches = useMatches()
  const items = matches.flatMap((match) => {
    const handle = match.handle as BreadcrumbHandle | undefined
    if (!handle?.breadcrumb) return []
    const label =
      typeof handle.breadcrumb === 'function' ? handle.breadcrumb(match) : handle.breadcrumb
    return [{ id: match.id, label }]
  })

  return (
    <nav className="content-workspace-breadcrumbs" aria-label="面包屑">
      <ol data-testid="content-workspace-breadcrumbs">
        {items.map((item, index) => (
          <li key={item.id}>
            <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** 呈现根级用户、统计、全局 pending 和子路由插槽。 */
function WorkspaceLayout() {
  const data = useLoaderData() as WorkspaceData
  const navigation = useNavigation()
  const location = useLocation()

  return (
    <section className="content-workspace-demo" data-testid="content-management-workspace-demo">
      <header className="content-workspace-header">
        <div>
          <p>React Router Data Mode</p>
          <h2>内容管理工作区</h2>
          <span>列表过滤、详情编辑和行内发布共享同一棵静态 route tree。</span>
        </div>
        <div className="content-workspace-header-actions">
          <Link to="/workspace">工作区入口</Link>
          <strong data-testid="content-workspace-navigation-state">{navigation.state}</strong>
        </div>
      </header>

      <div className="content-workspace-observer" role="status" aria-live="polite">
        <span>当前地址</span>
        <code data-testid="content-workspace-location">
          {location.pathname}
          {location.search}
        </code>
        <span>导航</span>
        <code>{navigation.state}</code>
      </div>

      <div className="content-workspace-userbar">
        <span>
          当前用户：{data.user.name}（{data.user.role}）
        </span>
        <dl aria-label="内容统计">
          <div>
            <dt>全部</dt>
            <dd data-testid="content-workspace-total">{data.stats.total}</dd>
          </div>
          <div>
            <dt>草稿</dt>
            <dd data-testid="content-workspace-draft">{data.stats.draft}</dd>
          </div>
          <div>
            <dt>已发布</dt>
            <dd data-testid="content-workspace-published">{data.stats.published}</dd>
          </div>
        </dl>
        <small>根 loader 调用 {data.loaderCalls} 次</small>
      </div>

      <Breadcrumbs />
      <main className="content-workspace-main" aria-busy={navigation.state !== 'idle'}>
        <Outlet />
      </main>
    </section>
  )
}

/** 将 URL 过滤器绑定到 GET Form，提交后由列表 loader 重新读取。 */
function ContentListPage() {
  const data = useLoaderData() as ContentListData
  const location = useLocation()
  const navigation = useNavigation()
  const isFiltering = navigation.formMethod === 'GET'

  return (
    <section className="content-workspace-panel" data-testid="content-workspace-list">
      <div className="content-workspace-panel-heading">
        <div>
          <p>content route loader</p>
          <h3>内容列表</h3>
        </div>
        <div className="content-workspace-panel-links">
          <Link className="content-workspace-primary-link" to="/workspace/content/router-data-flow">
            打开示例
          </Link>
          <Link to="/workspace/content/missing-content">演示 404</Link>
          <Link to="/workspace/content/router-data-flow?fail=once">演示 503</Link>
        </div>
      </div>

      <Form
        key={`${data.filters.query}:${data.filters.status}`}
        method="get"
        className="content-workspace-filter-form"
        aria-busy={isFiltering}
      >
        <label htmlFor="content-workspace-query">搜索</label>
        <input
          id="content-workspace-query"
          name="q"
          type="search"
          defaultValue={data.filters.query}
          placeholder="标题或摘要"
        />
        <label htmlFor="content-workspace-status">状态</label>
        <select id="content-workspace-status" name="status" defaultValue={data.filters.status}>
          <option value="all">全部</option>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
        </select>
        <button type="submit" disabled={isFiltering}>
          {isFiltering ? '筛选中' : '应用筛选'}
        </button>
        <Link to={location.pathname}>清空</Link>
      </Form>

      <div className="content-workspace-list-meta">
        <span data-testid="content-workspace-filter-summary">
          q={data.filters.query || '空'}，status={data.filters.status}
        </span>
        <small>列表 loader 调用 {data.loaderCalls} 次</small>
      </div>

      <ul className="content-workspace-content-list" data-testid="content-workspace-content-list">
        {data.contents.map((content) => (
          <ContentListItem key={content.id} content={content} />
        ))}
      </ul>
      {data.contents.length === 0 ? (
        <p className="content-workspace-empty">没有符合过滤条件的内容。</p>
      ) : null}
    </section>
  )
}

/** 将每行发布动作限制在自己的 Fetcher 状态中。 */
function ContentListItem({ content }: { content: ContentListData['contents'][number] }) {
  const fetcher = useFetcher<{ ok: true; status: string }>()
  const busy = fetcher.state !== 'idle'
  return (
    <li>
      <div>
        <Link to={`/workspace/content/${content.id}`}>
          <strong>{content.title}</strong>
        </Link>
        <span>{content.summary}</span>
      </div>
      <div className="content-workspace-list-actions">
        <span className={`content-workspace-status content-workspace-status-${content.status}`}>
          {content.status === 'published' ? '已发布' : '草稿'}
        </span>
        <fetcher.Form method="post" action={`/workspace/content/${content.id}`}>
          <input type="hidden" name="intent" value="toggle-publish" />
          <button type="submit" disabled={busy}>
            {busy ? '处理中' : content.status === 'published' ? '撤回' : '发布'}
          </button>
        </fetcher.Form>
      </div>
    </li>
  )
}

/** 为 /workspace 提供规范的内容列表入口。 */
function workspaceIndexLoader() {
  return redirect('content')
}

/** 为每次挂载创建根 loader、列表 loader 和独立内存 Router。 */
export function createContentManagementWorkspaceDemo() {
  const repository = createContentRepository()
  let workspaceLoaderCalls = 0
  let contentLoaderCalls = 0

  /** 在每次导航前把演示用户写入 Data Router context。 */
  const workspaceMiddleware: MiddlewareFunction = async ({ context }, next) => {
    context.set(workspaceUserContext, repository.currentUser())
    await next()
  }

  /** 读取共享用户与统计数据，供根布局和详情动作复用。 */
  async function workspaceLoader({ context, request }: LoaderFunctionArgs): Promise<WorkspaceData> {
    workspaceLoaderCalls += 1
    if (workspaceLoaderCalls > 1) await waitForRequest(request.signal, 360)
    return {
      user: context.get(workspaceUserContext),
      stats: repository.stats(),
      loaderCalls: workspaceLoaderCalls,
    }
  }

  /** 按 URL search 过滤内容列表并返回 loader 调用次数。 */
  async function contentListLoader({ request }: LoaderFunctionArgs): Promise<ContentListData> {
    contentLoaderCalls += 1
    if (contentLoaderCalls > 1) await waitForRequest(request.signal, 360)
    const filters = readFilters(request)
    return {
      filters,
      contents: repository.list(filters),
      loaderCalls: contentLoaderCalls,
    }
  }

  /** 展示路由工作区索引的短暂跳转状态。 */
  function WorkspaceIndex() {
    return <p className="content-workspace-empty">正在打开内容列表……</p>
  }

  const routes: RouteObject[] = [
    {
      id: 'content-workspace',
      path: '/workspace',
      middleware: [workspaceMiddleware],
      loader: workspaceLoader,
      Component: WorkspaceLayout,
      ErrorBoundary: WorkspaceErrorBoundary,
      handle: { breadcrumb: '内容工作区' },
      children: [
        {
          id: 'content-workspace-index',
          index: true,
          loader: workspaceIndexLoader,
          Component: WorkspaceIndex,
        },
        {
          id: 'content-list',
          path: 'content',
          loader: contentListLoader,
          Component: ContentListPage,
          handle: { breadcrumb: '内容列表' },
        },
        {
          id: 'content-detail',
          path: 'content/:contentId',
          lazy: async () => (await import('./content-detail-route')).defaultModule(repository),
        },
      ],
    },
  ]

  const router = createMemoryRouter(routes, { initialEntries: ['/workspace/content'] })

  /** 在宿主卸载时释放本次独立 Router。 */
  function ContentManagementWorkspaceDemo() {
    useEffect(() => () => router.dispose(), [router])
    return <RouterProvider router={router} />
  }

  return ContentManagementWorkspaceDemo
}

/** 将未知根错误收敛为工作区级兜底，并保留返回入口。 */
function WorkspaceErrorBoundary() {
  return (
    <section className="content-workspace-error" role="alert">
      <h3>工作区暂时无法加载</h3>
      <p>根路由或列表数据出现错误，请返回内容列表后重试。</p>
      <Link to="/workspace/content">返回内容列表</Link>
    </section>
  )
}
