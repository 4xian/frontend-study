import { useEffect } from 'react'
import {
  Link,
  Outlet,
  RouterProvider,
  createMemoryRouter,
  useLoaderData,
  useLocation,
  useMatches,
  type LoaderFunctionArgs,
  type RouteObject,
  type UIMatch,
} from 'react-router'
import './route-metadata-and-breadcrumbs-demo.css'

type DemoProject = {
  id: string
  title: string
  owner: string
  status: string
}

type BreadcrumbDefinition = {
  label: string | ((match: UIMatch) => string)
  to?: string | ((match: UIMatch) => string)
}

type BreadcrumbHandle = {
  breadcrumb?: BreadcrumbDefinition
}

type BreadcrumbItem = {
  match: UIMatch
  definition: BreadcrumbDefinition
}

const projects: Record<string, DemoProject> = {
  alpha: {
    id: 'alpha',
    title: 'Alpha 发布平台',
    owner: 'Lin',
    status: '准备发布',
  },
  beta: {
    id: 'beta',
    title: 'Beta 数据看板',
    owner: 'Kai',
    status: '需求评审',
  },
}

/** 从未知 handle 中读取本 Demo 约定的 breadcrumb 描述。 */
function readBreadcrumbDefinition(match: UIMatch): BreadcrumbDefinition | null {
  if (!match.handle || typeof match.handle !== 'object') return null
  const candidate = (match.handle as BreadcrumbHandle).breadcrumb
  if (!candidate || typeof candidate !== 'object') return null
  if (typeof candidate.label !== 'string' && typeof candidate.label !== 'function') return null
  if (
    candidate.to !== undefined &&
    typeof candidate.to !== 'string' &&
    typeof candidate.to !== 'function'
  ) {
    return null
  }
  return candidate
}

/** 把静态文本或读取当前 UI match 的函数解析为面包屑标签。 */
function resolveBreadcrumbLabel(definition: BreadcrumbDefinition, match: UIMatch): string {
  return typeof definition.label === 'function' ? definition.label(match) : definition.label
}

/** 把静态地址或读取当前 UI match 的函数解析为链接目标。 */
function resolveBreadcrumbTarget(
  definition: BreadcrumbDefinition,
  match: UIMatch,
): string | undefined {
  return typeof definition.to === 'function' ? definition.to(match) : definition.to
}

/** 判断未知 loader data 是否为本 Demo 的项目数据。 */
function isDemoProject(value: unknown): value is DemoProject {
  if (!value || typeof value !== 'object') return false
  const project = value as Partial<DemoProject>
  return (
    typeof project.id === 'string' &&
    typeof project.title === 'string' &&
    typeof project.owner === 'string' &&
    typeof project.status === 'string'
  )
}

/** 从项目 route 的 match 中生成动态项目标题。 */
function readProjectBreadcrumbLabel(match: UIMatch): string {
  return isDemoProject(match.loaderData) ? match.loaderData.title : '项目'
}

/** 收集当前匹配链中声明了 breadcrumb handle 的 route。 */
function useBreadcrumbItems(): BreadcrumbItem[] {
  return useMatches().flatMap((match) => {
    const definition = readBreadcrumbDefinition(match)
    return definition ? [{ match, definition }] : []
  })
}

/** 按 active matches 的父子顺序渲染面包屑，并标记当前页。 */
function Breadcrumbs() {
  const items = useBreadcrumbItems()

  return (
    <nav className="route-metadata-breadcrumbs" aria-label="面包屑">
      <ol data-testid="route-metadata-breadcrumb-list">
        {items.map(({ match, definition }, index) => {
          const label = resolveBreadcrumbLabel(definition, match)
          const to = resolveBreadcrumbTarget(definition, match)
          const isCurrent = index === items.length - 1
          return (
            <li key={match.id} data-route-id={match.id}>
              {isCurrent || !to ? (
                <span aria-current={isCurrent ? 'page' : undefined}>{label}</span>
              ) : (
                <Link to={to}>{label}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** 展示 useMatches 返回的 route ID、pathname 与 handle 是否参与面包屑。 */
function MatchInspector() {
  const matches = useMatches()

  return (
    <section className="route-metadata-matches" aria-labelledby="route-metadata-match-title">
      <div className="route-metadata-section-heading">
        <div>
          <p>useMatches()</p>
          <h3 id="route-metadata-match-title">当前 Active Matches</h3>
        </div>
        <strong data-testid="route-metadata-match-count">{matches.length} 条</strong>
      </div>
      <ol>
        {matches.map((match) => (
          <li key={match.id} data-testid="route-metadata-match">
            <code>{match.id}</code>
            <span>{match.pathname}</span>
            <small>{readBreadcrumbDefinition(match) ? '提供 breadcrumb' : '没有 breadcrumb'}</small>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** 读取项目 ID 对应的本地 loader 数据。 */
function projectLoader({ params }: LoaderFunctionArgs): DemoProject {
  return projects[params.projectId ?? ''] ?? projects.alpha!
}

/** 呈现路由元数据 Demo 的祖先布局与分支观察入口。 */
function DemoShell() {
  const location = useLocation()

  return (
    <section className="route-metadata-demo" data-testid="route-metadata-demo">
      <header className="route-metadata-header">
        <div>
          <p>React Router Data Mode</p>
          <h2>路由元数据与面包屑工作台</h2>
          <span>每条 route 提供元数据，祖先布局只负责组合当前匹配链。</span>
        </div>
        <code data-testid="route-metadata-location">{location.pathname}</code>
      </header>

      <nav className="route-metadata-shortcuts" aria-label="切换演示页面">
        <Link to="/workspace/projects/alpha/settings">Alpha 设置</Link>
        <Link to="/workspace/projects/beta/settings">Beta 设置</Link>
        <Link to="/workspace/projects/alpha">Alpha 总览</Link>
        <Link to="/workspace/billing">账单</Link>
      </nav>

      <Breadcrumbs />
      <MatchInspector />

      <main className="route-metadata-content">
        <Outlet />
      </main>
    </section>
  )
}

/** 提供工作区分支共享的 Outlet，不额外复制面包屑。 */
function WorkspaceLayout() {
  return <Outlet />
}

/** 呈现工作区默认页面。 */
function WorkspaceOverview() {
  return (
    <article className="route-metadata-card">
      <p>workspace index route</p>
      <h3>工作区概览</h3>
      <span>当前项由 index route 的 handle 提供。</span>
    </article>
  )
}

/** 作为技术性布局承载项目分支，本身故意不声明 breadcrumb。 */
function ProjectsLayout() {
  return <Outlet />
}

/** 呈现项目 loader 数据并承载项目子页面。 */
function ProjectLayout() {
  const project = useLoaderData<typeof projectLoader>()

  return (
    <article className="route-metadata-card" data-testid="route-metadata-project">
      <div className="route-metadata-project-heading">
        <div>
          <p>dynamic loader data</p>
          <h3>{project.title}</h3>
        </div>
        <strong>{project.status}</strong>
      </div>
      <dl>
        <div>
          <dt>projectId</dt>
          <dd>{project.id}</dd>
        </div>
        <div>
          <dt>owner</dt>
          <dd>{project.owner}</dd>
        </div>
      </dl>
      <nav className="route-metadata-project-links" aria-label="项目页面">
        <Link to={`/workspace/projects/${project.id}`}>项目总览</Link>
        <Link to={`/workspace/projects/${project.id}/settings`}>项目设置</Link>
      </nav>
      <div className="route-metadata-project-outlet">
        <Outlet />
      </div>
    </article>
  )
}

/** 呈现项目 index route 的正文。 */
function ProjectOverview() {
  return (
    <section data-testid="route-metadata-project-overview">
      <h4>项目总览</h4>
      <p>最后一项来自 index route 的静态 breadcrumb handle。</p>
    </section>
  )
}

/** 呈现项目设置 child route 的正文。 */
function ProjectSettings() {
  return (
    <section data-testid="route-metadata-project-settings">
      <h4>项目设置</h4>
      <p>项目名称来自 parent loader data，“设置”来自当前 child route 的 handle。</p>
    </section>
  )
}

/** 呈现工作区的 sibling 账单页面。 */
function BillingPage() {
  return (
    <article className="route-metadata-card" data-testid="route-metadata-billing">
      <p>sibling route</p>
      <h3>账单与订阅</h3>
      <span>项目 route 未匹配，因此项目面包屑不会出现在这里。</span>
    </article>
  )
}

/** 创建一次性内存 Router，确保每次挂载都有独立订阅与 history。 */
export function createRouteMetadataAndBreadcrumbsDemo() {
  const routes: RouteObject[] = [
    {
      id: 'route-metadata-root',
      path: '/',
      Component: DemoShell,
      handle: {
        breadcrumb: {
          label: '工作台',
          to: '/',
        },
      } satisfies BreadcrumbHandle,
      children: [
        {
          id: 'route-metadata-workspace',
          path: 'workspace',
          Component: WorkspaceLayout,
          handle: {
            breadcrumb: {
              label: '工作区',
              to: '/workspace',
            },
          } satisfies BreadcrumbHandle,
          children: [
            {
              id: 'route-metadata-workspace-index',
              index: true,
              Component: WorkspaceOverview,
              handle: {
                breadcrumb: {
                  label: '概览',
                },
              } satisfies BreadcrumbHandle,
            },
            {
              id: 'route-metadata-projects-layout',
              path: 'projects',
              Component: ProjectsLayout,
              children: [
                {
                  id: 'route-metadata-project',
                  path: ':projectId',
                  loader: projectLoader,
                  Component: ProjectLayout,
                  handle: {
                    breadcrumb: {
                      label: readProjectBreadcrumbLabel,
                      to: (match) => match.pathname,
                    },
                  } satisfies BreadcrumbHandle,
                  children: [
                    {
                      id: 'route-metadata-project-index',
                      index: true,
                      Component: ProjectOverview,
                      handle: {
                        breadcrumb: {
                          label: '项目总览',
                        },
                      } satisfies BreadcrumbHandle,
                    },
                    {
                      id: 'route-metadata-project-settings',
                      path: 'settings',
                      Component: ProjectSettings,
                      handle: {
                        breadcrumb: {
                          label: '设置',
                        },
                      } satisfies BreadcrumbHandle,
                    },
                  ],
                },
              ],
            },
            {
              id: 'route-metadata-billing',
              path: 'billing',
              Component: BillingPage,
              handle: {
                breadcrumb: {
                  label: '账单',
                },
              } satisfies BreadcrumbHandle,
            },
          ],
        },
      ],
    },
  ]

  const router = createMemoryRouter(routes, {
    initialEntries: ['/workspace/projects/alpha/settings'],
  })

  return function RouteMetadataAndBreadcrumbsDemo() {
    useEffect(() => () => router.dispose(), [router])
    return <RouterProvider router={router} />
  }
}
