import type { ComponentType } from 'react'
import { useState } from 'react'
import { createMemoryRouter, Link, Outlet, type RouteObject, useLocation } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './layout-routes-demo.css'

interface LayoutChildPageProps {
  eyebrow: string
  title: string
  summary: string
  routeName: string
}

/** 渲染当前进入布局 Outlet 的唯一 child 页面。 */
function LayoutChildPage({ eyebrow, title, summary, routeName }: LayoutChildPageProps) {
  return (
    <article
      className="layout-route-child"
      data-testid="layout-route-child"
      data-child-route={routeName}
    >
      <p>{eyebrow}</p>
      <h3>{title}</h3>
      <span>{summary}</span>
    </article>
  )
}

/** 为每次宿主挂载创建独立的布局路由 Demo。 */
export function createLayoutRoutesDemo(): ComponentType {
  const initialHostUrl = window.location.href

  /** 渲染不贡献 URL segment 的工作区共享布局。 */
  function WorkspaceLayout() {
    const location = useLocation()
    const [draft, setDraft] = useState('')

    return (
      <section className="layout-route-shell" data-testid="layout-route-shell">
        <div className="layout-route-addresses" aria-label="路由地址对照">
          <div>
            <span>内存地址</span>
            <code data-testid="layout-route-memory-path">{location.pathname}</code>
          </div>
          <div>
            <span>宿主初始地址</span>
            <code data-testid="layout-route-host-initial">{initialHostUrl}</code>
          </div>
          <div>
            <span>宿主当前地址</span>
            <code data-testid="layout-route-host-current">{window.location.href}</code>
          </div>
        </div>

        <header className="layout-route-shell-heading">
          <p>Pathless layout · no URL segment</p>
          <h3>团队工作区</h3>
          <span>这个共享层只包裹自己的 inbox 与 reports children。</span>
        </header>

        <nav className="layout-route-navigation" aria-label="工作区页面">
          <Link to="/inbox">收件箱</Link>
          <Link to="/reports">报告</Link>
          <Link to="/help">布局外帮助</Link>
        </nav>

        <label className="layout-route-draft">
          <span>布局层草稿</span>
          <input
            data-testid="layout-route-draft"
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            placeholder="输入内容后切换 child"
          />
        </label>

        <section
          className="layout-route-outlet"
          data-testid="layout-route-outlet"
          aria-labelledby="layout-route-outlet-title"
        >
          <div className="layout-route-outlet-heading">
            <p>Outlet</p>
            <h3 id="layout-route-outlet-title">匹配 child 的插入点</h3>
          </div>
          <Outlet />
        </section>
      </section>
    )
  }

  /** 渲染 inbox child route。 */
  function InboxPage() {
    return (
      <LayoutChildPage
        eyebrow="Child route · /inbox"
        title="团队收件箱"
        summary="地址没有 workspace 或 layout segment，但匹配分支仍包含共享布局。"
        routeName="inbox"
      />
    )
  }

  /** 渲染 reports child route。 */
  function ReportsPage() {
    return (
      <LayoutChildPage
        eyebrow="Child route · /reports"
        title="每周报告"
        summary="切换 child 只替换 Outlet 内容，布局标题、导航与草稿继续保留。"
        routeName="reports"
      />
    )
  }

  /** 渲染布局 children 之外的 sibling 页面。 */
  function HelpPage() {
    const location = useLocation()

    return (
      <section className="layout-route-help" data-testid="layout-route-help">
        <p>Sibling route · outside layout</p>
        <h3>帮助中心</h3>
        <span>
          内存地址：<code data-testid="layout-route-help-path">{location.pathname}</code>
        </span>
        <Link to="/inbox">返回工作区</Link>
      </section>
    )
  }

  const routes = [
    {
      id: 'workspace-layout',
      Component: WorkspaceLayout,
      children: [
        { id: 'inbox', path: 'inbox', Component: InboxPage },
        { id: 'reports', path: 'reports', Component: ReportsPage },
      ],
    },
    { id: 'help', path: 'help', Component: HelpPage },
  ] satisfies RouteObject[]
  const router = createMemoryRouter(routes, { initialEntries: ['/inbox'] })

  /** 挂载隔离的 RouterProvider，并保持学习站 URL 不变。 */
  function LayoutRoutesDemo() {
    return (
      <section className="layout-routes-demo" data-testid="layout-routes-demo">
        <header className="layout-routes-demo-heading">
          <p>Layout route observer</p>
          <h2>共享 UI 层级不必增加 URL segment</h2>
          <span>内存 Router 负责 Demo 导航，外层学习站地址不参与匹配。</span>
        </header>
        <div className="layout-routes-viewport">
          <RouterProvider router={router} />
        </div>
      </section>
    )
  }

  return LayoutRoutesDemo
}
