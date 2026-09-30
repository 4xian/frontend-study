import { type ComponentType } from 'react'
import {
  createMemoryRouter,
  Link,
  Outlet,
  useLocation,
  useParams,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './route-params-demo.css'

const pathCases = [
  {
    label: '初始成员',
    to: '/teams/aurora/members/101',
    note: '两个参数都是字符串，转换成功',
  },
  {
    label: '切换团队',
    to: '/teams/ember/members/101',
    note: '只改变 parent 的 teamId',
  },
  {
    label: '切换成员',
    to: '/teams/aurora/members/202',
    note: '只改变 child 的 memberId',
  },
  {
    label: '只命中 parent',
    to: '/teams/aurora',
    note: '没有 child 参数，显示索引内容',
  },
  {
    label: '业务格式无效',
    to: '/teams/aurora/members/not-a-number',
    note: '路由命中，但转换失败',
  },
  {
    label: '编码后的名称',
    to: '/teams/design%20systems/members/303',
    note: 'teamId 解码为空格',
  },
] as const

/** 判断路由参数是否是正整数字符串，并在通过后转换为 number。 */
function parseMemberId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null
  const memberId = Number(value)
  return Number.isSafeInteger(memberId) && memberId > 0 ? memberId : null
}

/** 展示当前匹配链中的 teamId，并为子路由提供出口。 */
function TeamLayout() {
  const { teamId } = useParams<'teamId'>()
  const location = useLocation()

  return (
    <section className="route-params-workbench" data-testid="route-params-workbench">
      <header className="route-params-heading">
        <p>useParams observer</p>
        <h2>当前匹配链的参数</h2>
        <span>Link 只更新内存 Router，学习站外层地址不会改变。</span>
      </header>

      <nav className="route-params-navigation" aria-label="路由参数示例">
        {pathCases.map((pathCase) => (
          <Link
            key={pathCase.to}
            to={pathCase.to}
            aria-current={location.pathname === pathCase.to ? 'page' : undefined}
          >
            <strong>{pathCase.label}</strong>
            <span>{pathCase.note}</span>
          </Link>
        ))}
      </nav>

      <section className="route-params-parent" aria-labelledby="route-params-parent-title">
        <div>
          <p>Parent reader</p>
          <h3 id="route-params-parent-title">父组件读取结果</h3>
        </div>
        <dl>
          <div>
            <dt>内存 pathname</dt>
            <dd data-testid="route-params-pathname">{location.pathname}</dd>
          </div>
          <div>
            <dt>teamId</dt>
            <dd data-testid="route-params-team-id">{teamId ?? 'undefined'}</dd>
          </div>
        </dl>
      </section>

      <section className="route-params-outlet" aria-labelledby="route-params-outlet-title">
        <h3 id="route-params-outlet-title">子路由读取与业务转换</h3>
        <Outlet />
      </section>
    </section>
  )
}

/** 读取父子参数，并把 memberId 的转换放在显式校验之后。 */
function MemberParams() {
  const { teamId, memberId } = useParams<'teamId' | 'memberId'>()
  const parsedMemberId = parseMemberId(memberId)

  return (
    <article className="route-params-result" aria-live="polite">
      <p>members/:memberId</p>
      <dl>
        <div>
          <dt>继承的 teamId</dt>
          <dd data-testid="route-params-child-team-id">{teamId ?? 'undefined'}</dd>
        </div>
        <div>
          <dt>原始 memberId</dt>
          <dd data-testid="route-params-member-id">{memberId ?? 'undefined'}</dd>
        </div>
        <div>
          <dt>业务转换结果</dt>
          <dd data-testid="route-params-member-number">
            {parsedMemberId === null ? '未得到正整数' : parsedMemberId}
          </dd>
        </div>
      </dl>
      <span>路径匹配成功不代表成员存在或当前用户可访问。</span>
    </article>
  )
}

/** 展示只命中 parent 时，Outlet 不会伪造 child 参数。 */
function TeamIndex() {
  return (
    <article className="route-params-result" aria-live="polite">
      <p>index child</p>
      <h3>当前没有成员参数</h3>
      <span>只有 parent 的 teamId 被读取；未命中的 child 不会产生 memberId。</span>
    </article>
  )
}

const routes = [
  {
    id: 'team',
    path: '/teams/:teamId',
    Component: TeamLayout,
    children: [
      {
        id: 'member',
        path: 'members/:memberId',
        Component: MemberParams,
      },
      {
        id: 'team-index',
        index: true,
        Component: TeamIndex,
      },
    ],
  },
] satisfies RouteObject[]

/** 为每次宿主挂载创建拥有独立 location 的路由参数 Demo。 */
export function createRouteParamsDemo(): ComponentType {
  const router = createMemoryRouter(routes, {
    initialEntries: [pathCases[0].to],
  })

  /** 挂载本课独立的内存 Router。 */
  function RouteParamsDemo() {
    return (
      <section className="route-params-demo" data-testid="route-params-demo">
        <RouterProvider router={router} />
      </section>
    )
  }

  return RouteParamsDemo
}
