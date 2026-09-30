import { type ComponentType } from 'react'
import {
  createMemoryRouter,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useMatches,
  useRouteLoaderData,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './route-data-reading-and-sharing-demo.css'

const WORKSPACE_ROUTE_ID = 'workspace-root'

const projects = [
  {
    id: 'atlas',
    name: 'Atlas 控制台',
    owner: '平台体验组',
    status: '准备验收',
    summary: '统一查看发布窗口、环境状态和交付风险。',
  },
  {
    id: 'harbor',
    name: 'Harbor 发布中心',
    owner: '交付工程组',
    status: '持续迭代',
    summary: '集中管理版本、变更说明和发布审批。',
  },
] as const

const navigationItems = [
  { to: '/', label: '工作区总览' },
  { to: '/projects/atlas', label: 'Atlas' },
  { to: '/projects/harbor', label: 'Harbor' },
] as const

/** 返回整个工作区分支共享的组织与成员数据。 */
function workspaceLoader() {
  return {
    organization: {
      id: 'northstar-labs',
      name: 'Northstar Labs',
      plan: '团队版',
    },
    viewer: {
      id: 'member-7',
      name: '林晓',
      role: '发布协调员',
    },
    projectTotal: projects.length,
  }
}

/** 返回工作区首页自己拥有的概览数据。 */
function overviewLoader() {
  return {
    healthyProjects: 2,
    reviewQueue: 3,
    nextWindow: '周四 20:00',
  }
}

/** 根据当前 child route 参数返回页面专属项目数据。 */
function projectLoader({ params }: LoaderFunctionArgs) {
  return {
    requestedId: params.projectId ?? '',
    project: projects.find((project) => project.id === params.projectId),
  }
}

/** 把未知 loader data 转为适合观察的顶层字段列表。 */
function getLoaderDataKeys(loaderData: unknown): string[] {
  if (loaderData === null || typeof loaderData !== 'object') return []
  return Object.keys(loaderData)
}

/** 展示当前 Data Router 匹配链与每条 route 的数据字段。 */
function MatchInspector() {
  const matches = useMatches()

  return (
    <section className="route-data-match-panel" aria-labelledby="route-data-match-title">
      <div className="route-data-section-heading">
        <div>
          <p>useMatches</p>
          <h3 id="route-data-match-title">当前匹配链</h3>
        </div>
        <strong data-testid="route-data-match-count">{matches.length} 条</strong>
      </div>

      <ol className="route-data-match-list" data-testid="route-data-match-list">
        {matches.map((match, index) => {
          const dataKeys = getLoaderDataKeys(match.loaderData)

          return (
            <li key={match.id} data-testid={`route-data-match-${match.id}`}>
              <span>{index + 1}</span>
              <div>
                <strong>{match.id}</strong>
                <code>{match.pathname}</code>
                <small>{dataKeys.length > 0 ? dataKeys.join(' · ') : '没有 loader data'}</small>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/** 读取 parent route 自己的数据，并为当前 child 提供共享外壳。 */
function WorkspaceShell() {
  const workspace = useLoaderData<typeof workspaceLoader>()
  const location = useLocation()

  return (
    <section className="route-data-sharing-demo" data-testid="route-data-sharing-demo">
      <header className="route-data-demo-heading">
        <div>
          <p>route data ownership</p>
          <h2 data-testid="route-data-workspace-name">{workspace.organization.name}</h2>
          <span>
            {workspace.organization.plan} · {workspace.projectTotal} 个项目
          </span>
        </div>
        <dl>
          <div>
            <dt>当前成员</dt>
            <dd data-testid="route-data-viewer-name">{workspace.viewer.name}</dd>
          </div>
          <div>
            <dt>职责</dt>
            <dd>{workspace.viewer.role}</dd>
          </div>
        </dl>
      </header>

      <nav className="route-data-navigation" aria-label="选择路由数据视图">
        {navigationItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-current={location.pathname === item.to ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <section className="route-data-location" aria-label="当前内存路由地址">
        <span>当前 location</span>
        <code data-testid="route-data-location">{location.pathname}</code>
      </section>

      <MatchInspector />

      <div className="route-data-outlet" data-testid="route-data-outlet">
        <Outlet />
      </div>
    </section>
  )
}

/** 读取 index route 数据，并通过稳定 parent ID 取得组织名称。 */
function OverviewPage() {
  const overview = useLoaderData<typeof overviewLoader>()
  const workspace = useRouteLoaderData<typeof workspaceLoader>(WORKSPACE_ROUTE_ID)

  return (
    <article className="route-data-overview" data-testid="route-data-overview">
      <div className="route-data-content-heading">
        <div>
          <p>useLoaderData</p>
          <h3>工作区总览</h3>
        </div>
        <span data-testid="route-data-shared-organization">
          {workspace?.organization.name ?? '工作区数据不可用'}
        </span>
      </div>

      <dl className="route-data-summary-list">
        <div>
          <dt>健康项目</dt>
          <dd>{overview.healthyProjects}</dd>
        </div>
        <div>
          <dt>待审核</dt>
          <dd>{overview.reviewQueue}</dd>
        </div>
        <div>
          <dt>发布窗口</dt>
          <dd>{overview.nextWindow}</dd>
        </div>
      </dl>
    </article>
  )
}

/** 同时读取当前 project route 数据与已匹配 parent route 数据。 */
function ProjectPage() {
  const { project, requestedId } = useLoaderData<typeof projectLoader>()
  const workspace = useRouteLoaderData<typeof workspaceLoader>(WORKSPACE_ROUTE_ID)

  if (!project) {
    return (
      <article className="route-data-empty" data-testid="route-data-project-empty">
        <p>useLoaderData</p>
        <h3>没有找到“{requestedId}”项目</h3>
        <span>child route 仍然只读取自己的 loader data。</span>
      </article>
    )
  }

  return (
    <article className="route-data-project" data-testid="route-data-project">
      <div className="route-data-content-heading">
        <div>
          <p>useLoaderData + useRouteLoaderData</p>
          <h3 data-testid="route-data-project-name">{project.name}</h3>
        </div>
        <strong>{project.status}</strong>
      </div>

      <p>{project.summary}</p>

      <dl className="route-data-project-details">
        <div>
          <dt>Child loader</dt>
          <dd>{project.owner}</dd>
        </div>
        <div>
          <dt>Parent route ID</dt>
          <dd>
            <code>{WORKSPACE_ROUTE_ID}</code>
          </dd>
        </div>
        <div>
          <dt>共享组织</dt>
          <dd data-testid="route-data-shared-organization">
            {workspace?.organization.name ?? '工作区数据不可用'}
          </dd>
        </div>
      </dl>
    </article>
  )
}

/** 为每次宿主挂载创建独立的 Data Router 与路由数据观察组件。 */
export function createRouteDataReadingAndSharingDemo(): ComponentType {
  const routes: RouteObject[] = [
    {
      id: WORKSPACE_ROUTE_ID,
      path: '/',
      loader: workspaceLoader,
      Component: WorkspaceShell,
      children: [
        {
          id: 'workspace-overview',
          index: true,
          loader: overviewLoader,
          Component: OverviewPage,
        },
        {
          id: 'workspace-project',
          path: 'projects/:projectId',
          loader: projectLoader,
          Component: ProjectPage,
        },
      ],
    },
  ]
  const router = createMemoryRouter(routes, {
    initialEntries: ['/projects/atlas'],
  })

  /** 把本次创建的 Router 交给 React Router DOM Provider。 */
  function RouteDataReadingAndSharingDemo() {
    return <RouterProvider router={router} />
  }

  return RouteDataReadingAndSharingDemo
}

export default createRouteDataReadingAndSharingDemo()
