import type { ComponentType } from 'react'
import { createMemoryRouter, Link, Outlet, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './index-routes-demo.css'

/** 为每次宿主挂载创建独立的索引路由 Demo。 */
export function createIndexRoutesDemo(): ComponentType {
  const initialHostUrl = window.location.href

  /** 渲染带 path 的工作区 parent，并为匹配 child 提供插入位置。 */
  function WorkspaceLayout() {
    return (
      <section className="index-route-workspace" data-testid="index-route-workspace">
        <div className="index-route-addresses" aria-label="路由地址对照">
          <div>
            <span>宿主初始地址</span>
            <code data-testid="index-route-host-initial">{initialHostUrl}</code>
          </div>
          <div>
            <span>宿主当前地址</span>
            <code data-testid="index-route-host-current">{window.location.href}</code>
          </div>
        </div>

        <header className="index-route-workspace-heading">
          <p>Parent route · /workspace</p>
          <h3>团队工作区</h3>
          <span>Parent 保持显示，匹配 child 在下方 Outlet 区域切换。</span>
        </header>

        <nav className="index-route-navigation" aria-label="工作区页面">
          <Link to="/workspace">默认总览</Link>
          <Link to="/workspace/activity">最近活动</Link>
        </nav>

        <section
          className="index-route-outlet"
          data-testid="index-route-outlet"
          aria-labelledby="index-route-outlet-title"
        >
          <div className="index-route-outlet-heading">
            <p>Outlet</p>
            <h3 id="index-route-outlet-title">Parent URL 的 child 插入点</h3>
          </div>
          <Outlet />
        </section>
      </section>
    )
  }

  /** 显示 parent URL 上由 Index Route 提供的默认内容。 */
  function WorkspaceHome() {
    return (
      <article className="index-route-view index-route-view-default" data-route-view="index">
        <p>Index Route · parent URL</p>
        <h3>工作区总览</h3>
        <span>
          当前示例地址：<code>/workspace</code>
        </span>
      </article>
    )
  }

  /** 显示带普通 path 的 sibling child 内容。 */
  function ActivityPage() {
    return (
      <article className="index-route-view index-route-view-activity" data-route-view="activity">
        <p>Path child · activity</p>
        <h3>最近活动</h3>
        <span>
          当前示例地址：<code>/workspace/activity</code>
        </span>
      </article>
    )
  }

  const routes = [
    {
      id: 'workspace',
      path: '/workspace',
      Component: WorkspaceLayout,
      children: [
        { id: 'workspace-index', index: true, Component: WorkspaceHome },
        { id: 'workspace-activity', path: 'activity', Component: ActivityPage },
      ],
    },
  ] satisfies RouteObject[]
  const router = createMemoryRouter(routes, { initialEntries: ['/workspace'] })

  /** 挂载隔离的 RouterProvider，并保持学习站 URL 不变。 */
  function IndexRoutesDemo() {
    return (
      <section className="index-routes-demo" data-testid="index-routes-demo">
        <header className="index-routes-demo-heading">
          <p>Index route observer</p>
          <h2>Parent URL 也可以拥有明确的默认 child</h2>
          <span>内存 Router 负责 Demo 导航，外层学习站地址不参与匹配。</span>
        </header>
        <div className="index-routes-viewport">
          <RouterProvider router={router} />
        </div>
      </section>
    )
  }

  return IndexRoutesDemo
}
