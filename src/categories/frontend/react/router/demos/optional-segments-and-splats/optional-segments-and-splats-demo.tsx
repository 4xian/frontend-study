import { type ComponentType } from 'react'
import {
  createMemoryRouter,
  generatePath,
  Link,
  matchRoutes,
  useLocation,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './optional-segments-and-splats-demo.css'

const pathCases = [
  { label: '默认报表', to: generatePath('/:lang?/reports', {}), note: '省略 :lang?' },
  {
    label: '中文报表',
    to: generatePath('/:lang?/reports', { lang: 'zh' }),
    note: 'lang = zh',
  },
  { label: '项目概览', to: '/projects/aurora', note: '省略 edit?' },
  {
    label: '项目编辑',
    to: generatePath('/projects/:projectId/edit?', { projectId: 'aurora' }),
    note: '保留 edit?',
  },
  { label: '文件根目录', to: generatePath('/files/*', { '*': '' }), note: 'splat 为空' },
  { label: '新建文件', to: '/files/new', note: '静态候选' },
  { label: '负责人文件', to: '/files/iris', note: '动态候选' },
  {
    label: '深层文档',
    to: generatePath('/files/*', { '*': 'guides/router/setup.md' }),
    note: '多段 splat',
  },
] as const

/** 展示当前内存地址对应的胜出路由、路径基准与捕获结果。 */
function MatchObserver() {
  const location = useLocation()
  const match = matchRoutes(routes, location.pathname)!.at(-1)!
  const captures = [
    { label: 'lang', value: match.params.lang ?? '未出现' },
    { label: 'projectId / owner', value: match.params.projectId ?? match.params.owner ?? '未出现' },
    { label: 'splat "*"', value: match.params['*'] || '空' },
  ]

  return (
    <section className="optional-splat-workbench" data-testid="optional-splat-workbench">
      <header className="optional-splat-heading">
        <p>Optional segment and splat observer</p>
        <h2>路径候选观察台</h2>
        <span>所有 Link 只更新内存 Router，学习站外层地址不会改变。</span>
      </header>

      <nav className="optional-splat-navigation" aria-label="可选段与通配路由示例">
        {pathCases.map((pathCase) => (
          <Link
            key={pathCase.to}
            to={pathCase.to}
            aria-current={location.pathname === pathCase.to ? 'page' : undefined}
          >
            <strong>{pathCase.label}</strong>
            <span>
              {pathCase.note}：{pathCase.to}
            </span>
          </Link>
        ))}
      </nav>

      <section
        className="optional-splat-result"
        aria-labelledby="optional-splat-result-title"
        aria-live="polite"
      >
        <div className="optional-splat-result-heading">
          <p>Winning branch</p>
          <h3 id="optional-splat-result-title">当前匹配结果</h3>
        </div>

        <dl className="optional-splat-match-fields">
          <div>
            <dt>Demo pathname</dt>
            <dd data-testid="optional-splat-pathname">{location.pathname}</dd>
          </div>
          <div>
            <dt>route.id</dt>
            <dd data-testid="optional-splat-route-id">{match.route.id}</dd>
          </div>
          <div>
            <dt>route.path</dt>
            <dd data-testid="optional-splat-route-pattern">{match.route.path}</dd>
          </div>
          <div>
            <dt>pathnameBase</dt>
            <dd data-testid="optional-splat-pathname-base">{match.pathnameBase}</dd>
          </div>
        </dl>

        <section
          className="optional-splat-captures"
          aria-labelledby="optional-splat-captures-title"
        >
          <h3 id="optional-splat-captures-title">捕获位置</h3>
          <dl>
            {captures.map((capture) => (
              <div key={capture.label}>
                <dt>{capture.label}</dt>
                <dd data-testid={`optional-splat-${capture.label.replaceAll(/[^a-z*]/g, '-')}`}>
                  {capture.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </section>

      <p className="optional-splat-ranking-note">
        <strong>候选提示：</strong> Demo 故意先声明 splat，再声明动态和静态文件路由；
        <code>/files/new</code> 仍由更具体的静态 route 胜出。
      </p>
    </section>
  )
}

const routes = [
  { id: 'files', path: '/files/*', Component: MatchObserver },
  { id: 'file-owner', path: '/files/:owner', Component: MatchObserver },
  { id: 'files-new', path: '/files/new', Component: MatchObserver },
  { id: 'reports', path: '/:lang?/reports', Component: MatchObserver },
  { id: 'project-editor', path: '/projects/:projectId/edit?', Component: MatchObserver },
] satisfies RouteObject[]

/** 为每次宿主挂载创建拥有独立 location 的可选段与通配路由 Demo。 */
export function createOptionalSegmentsAndSplatsDemo(): ComponentType {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/reports'],
  })

  /** 挂载本批独立的内存 Router。 */
  function OptionalSegmentsAndSplatsDemo() {
    return (
      <section
        className="optional-segments-and-splats-demo"
        data-testid="optional-segments-and-splats-demo"
      >
        <RouterProvider router={router} />
      </section>
    )
  }

  return OptionalSegmentsAndSplatsDemo
}
