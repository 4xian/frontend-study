import { type ComponentType } from 'react'
import {
  createMemoryRouter,
  Link,
  useLoaderData,
  useLocation,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './loader-data-loading-demo.css'

const projects = [
  {
    id: 'atlas',
    name: 'Atlas 控制台',
    owner: '平台体验组',
    status: '准备验收',
    summary: '统一查看环境状态、发布窗口和运行指标。',
  },
  {
    id: 'harbor',
    name: 'Harbor 发布中心',
    owner: '交付工程组',
    status: '持续迭代',
    summary: '把版本、变更说明和发布审批放在同一条路由数据链中。',
  },
] as const

const projectLinks = [
  { to: '/projects/atlas', label: 'Atlas', note: '返回第一条项目记录' },
  { to: '/projects/harbor', label: 'Harbor', note: '参数变化后重新选择数据' },
  { to: '/projects/unknown', label: '未知 ID', note: '返回普通空数据' },
] as const

/** 按本次匹配参数选择项目，并返回 route component 需要的普通对象。 */
function projectLoader({ params, request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url)

  return {
    project: projects.find((item) => item.id === params.projectId),
    requestedId: params.projectId ?? '',
    requestedPathname: requestUrl.pathname,
  }
}

/** 消费当前 route 的 loader data，并明确呈现找到记录或普通空态。 */
function ProjectPage() {
  const { project, requestedId, requestedPathname } = useLoaderData<typeof projectLoader>()
  const location = useLocation()

  return (
    <section className="loader-data-loading-workbench" data-testid="loader-data-loading-workbench">
      <header className="loader-data-loading-heading">
        <p>loader to component</p>
        <h2>路由数据观察台</h2>
        <span>每次导航先由同一条 route 的 loader 选择数据，再渲染当前结果。</span>
      </header>

      <nav className="loader-data-loading-navigation" aria-label="选择项目数据">
        {projectLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-current={location.pathname === item.to ? 'page' : undefined}
          >
            <strong>{item.label}</strong>
            <span>{item.note}</span>
          </Link>
        ))}
      </nav>

      <ol className="loader-data-loading-pipeline" aria-label="Loader 数据路径">
        <li>
          <span>1</span>
          <div>
            <strong>匹配 route</strong>
            <code>/projects/:projectId</code>
          </div>
        </li>
        <li>
          <span>2</span>
          <div>
            <strong>执行 loader</strong>
            <code>params + request</code>
          </div>
        </li>
        <li>
          <span>3</span>
          <div>
            <strong>组件读取</strong>
            <code>useLoaderData</code>
          </div>
        </li>
      </ol>

      <section className="loader-data-loading-request" aria-labelledby="loader-request-title">
        <div>
          <p>Loader inputs</p>
          <h3 id="loader-request-title">本次路由输入</h3>
        </div>
        <dl>
          <div>
            <dt>request pathname</dt>
            <dd data-testid="loader-request-pathname">{requestedPathname}</dd>
          </div>
          <div>
            <dt>params.projectId</dt>
            <dd data-testid="loader-requested-id">{requestedId || 'undefined'}</dd>
          </div>
        </dl>
      </section>

      <section className="loader-data-loading-result" aria-live="polite">
        <p>useLoaderData result</p>
        {project ? (
          <article data-testid="loader-project-result">
            <div className="loader-data-loading-result-heading">
              <div>
                <span>找到项目</span>
                <h3>{project.name}</h3>
              </div>
              <strong>{project.status}</strong>
            </div>
            <p>{project.summary}</p>
            <dl>
              <div>
                <dt>项目 ID</dt>
                <dd>{project.id}</dd>
              </div>
              <div>
                <dt>负责人</dt>
                <dd>{project.owner}</dd>
              </div>
            </dl>
          </article>
        ) : (
          <article className="loader-data-loading-empty" data-testid="loader-project-empty">
            <span>普通空数据</span>
            <h3>没有找到“{requestedId}”项目</h3>
            <p>route 仍然正常渲染；本课不把未知业务 ID 改成 redirect 或 Route Error。</p>
          </article>
        )}
      </section>
    </section>
  )
}

const routes = [
  {
    id: 'project-detail',
    path: '/projects/:projectId',
    loader: projectLoader,
    Component: ProjectPage,
  },
] satisfies RouteObject[]

/** 为每次宿主挂载创建拥有独立 loader data 与内存 history 的 Demo。 */
export function createLoaderDataLoadingDemo(): ComponentType {
  const router = createMemoryRouter(routes, {
    initialEntries: [projectLinks[0].to],
  })

  /** 挂载本课独立的 Data Router。 */
  function LoaderDataLoadingDemo() {
    return (
      <section className="loader-data-loading-demo" data-testid="loader-data-loading-demo">
        <RouterProvider router={router} />
      </section>
    )
  }

  return LoaderDataLoadingDemo
}
