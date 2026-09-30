import type { ComponentType } from 'react'
import {
  createMemoryRouter,
  generatePath,
  Link,
  Outlet,
  useParams,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './dynamic-segments-demo.css'

const TEAM_PATH = '/teams/:teamId'
const MEMBER_PATH = '/teams/:teamId/members/:memberId'

const teamLinks = [
  {
    label: 'Aurora',
    path: generatePath(TEAM_PATH, { teamId: 'aurora' }),
  },
  {
    label: 'Ember',
    path: generatePath(TEAM_PATH, { teamId: 'ember' }),
  },
  {
    label: 'Design systems',
    path: generatePath(TEAM_PATH, { teamId: 'design systems' }),
  },
] as const

const memberPath = generatePath(MEMBER_PATH, {
  teamId: 'aurora',
  memberId: 'mira',
})

/** 显示动态 parent 的命中值，并为 child 提供 Outlet。 */
function TeamLayout() {
  const { teamId } = useParams()

  return (
    <section className="dynamic-segment-team" data-testid="dynamic-segment-team">
      <header className="dynamic-segment-team-heading">
        <p>Parent pattern · /teams/:teamId</p>
        <h3>
          当前团队：<strong data-testid="dynamic-segment-team-id">{teamId}</strong>
        </h3>
        <span>不同单段值命中同一个 TeamLayout，外层学习站地址保持不变。</span>
      </header>

      <nav className="dynamic-segment-navigation" aria-label="团队与成员示例">
        {teamLinks.map((team) => (
          <Link key={team.path} to={team.path}>
            {team.label}
          </Link>
        ))}
        <Link className="dynamic-segment-member-link" to={memberPath}>
          查看 Aurora / Mira
        </Link>
      </nav>

      <section className="dynamic-segment-outlet" aria-labelledby="dynamic-segment-outlet-title">
        <div className="dynamic-segment-outlet-heading">
          <p>Child outlet</p>
          <h3 id="dynamic-segment-outlet-title">相对 child 的匹配结果</h3>
        </div>
        <Outlet />
      </section>
    </section>
  )
}

/** 显示 child 继承的 parent 参数与自身动态段值。 */
function MemberDetail() {
  const { teamId, memberId } = useParams()

  return (
    <article className="dynamic-segment-member" data-testid="dynamic-segment-member">
      <p>members/:memberId</p>
      <h3>成员详情已命中</h3>
      <dl>
        <div>
          <dt>父级 teamId</dt>
          <dd data-testid="dynamic-segment-member-team-id">{teamId}</dd>
        </div>
        <div>
          <dt>子级 memberId</dt>
          <dd data-testid="dynamic-segment-member-id">{memberId}</dd>
        </div>
      </dl>
    </article>
  )
}

const routes = [
  {
    id: 'team',
    path: TEAM_PATH,
    Component: TeamLayout,
    children: [
      {
        id: 'member',
        path: 'members/:memberId',
        Component: MemberDetail,
      },
    ],
  },
] satisfies RouteObject[]

/** 为每次宿主挂载创建独立的动态路由段 Demo。 */
export function createDynamicSegmentsDemo(): ComponentType {
  const router = createMemoryRouter(routes, {
    initialEntries: [teamLinks[0].path],
  })

  /** 挂载内存 Router，并展示同一模板生成的具体路径。 */
  function DynamicSegmentsDemo() {
    return (
      <section className="dynamic-segments-demo" data-testid="dynamic-segments-demo">
        <header className="dynamic-segments-demo-heading">
          <p>Dynamic segment observer</p>
          <h2>动态路由段观察台</h2>
          <span>路径模板负责匹配，generatePath 负责生成可导航的具体地址。</span>
        </header>

        <section className="dynamic-segment-paths" aria-labelledby="dynamic-segment-paths-title">
          <h3 id="dynamic-segment-paths-title">模板与生成结果</h3>
          <dl>
            <div>
              <dt>parent 模板</dt>
              <dd>
                <code>{TEAM_PATH}</code>
              </dd>
            </div>
            <div>
              <dt>编码后的团队路径</dt>
              <dd>
                <code data-testid="dynamic-segment-encoded-path">{teamLinks[2].path}</code>
              </dd>
            </div>
            <div>
              <dt>parent + child</dt>
              <dd>
                <code data-testid="dynamic-segment-member-path">{memberPath}</code>
              </dd>
            </div>
          </dl>
        </section>

        <div className="dynamic-segments-viewport">
          <RouterProvider router={router} />
        </div>
      </section>
    )
  }

  return DynamicSegmentsDemo
}
