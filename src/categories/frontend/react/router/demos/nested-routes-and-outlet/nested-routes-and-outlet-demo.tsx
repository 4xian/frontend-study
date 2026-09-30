import type { ComponentType } from 'react'
import { useState } from 'react'
import { createMemoryRouter, NavLink, Outlet, type RouteObject, useLocation } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './nested-routes-and-outlet-demo.css'

interface NestedChildPageProps {
  eyebrow: string
  title: string
  summary: string
  routeName: string
}

/** 渲染 Outlet 当前选中的子页面。 */
function NestedChildPage({ eyebrow, title, summary, routeName }: NestedChildPageProps) {
  return (
    <article
      className="nested-outlet-child"
      data-testid="nested-outlet-child"
      data-child-route={routeName}
    >
      <p>{eyebrow}</p>
      <h3>{title}</h3>
      <span>{summary}</span>
    </article>
  )
}

/** 为每次宿主挂载创建独立的嵌套路由 Demo。 */
export function createNestedRoutesAndOutletDemo(): ComponentType {
  const initialHostUrl = window.location.href

  /** 渲染带有共享界面与 Outlet 插入点的父 route。 */
  function ProjectsLayout() {
    const location = useLocation()
    const [parentCount, setParentCount] = useState(0)

    return (
      <section className="nested-outlet-parent" data-testid="nested-outlet-parent">
        <div className="nested-outlet-addresses" aria-label="路由地址对照">
          <div>
            <span>内存地址</span>
            <code data-testid="nested-outlet-memory-path">{location.pathname}</code>
          </div>
          <div>
            <span>宿主初始地址</span>
            <code data-testid="nested-outlet-host-initial">{initialHostUrl}</code>
          </div>
          <div>
            <span>宿主当前地址</span>
            <code data-testid="nested-outlet-host-current">{window.location.href}</code>
          </div>
        </div>

        <header className="nested-outlet-parent-heading">
          <p>Parent route · /projects</p>
          <h3>项目工作台</h3>
          <span>父 route 提供共享标题、导航和局部状态。</span>
        </header>

        <nav className="nested-outlet-navigation" aria-label="项目子页面">
          <NavLink end to=".">
            仅显示父级
          </NavLink>
          <NavLink end to="overview">
            项目概览
          </NavLink>
          <NavLink end to="activity">
            最近活动
          </NavLink>
        </nav>

        <div className="nested-outlet-parent-state">
          <span>
            父层计数：<strong data-testid="nested-outlet-parent-count">{parentCount}</strong>
          </span>
          <button type="button" onClick={() => setParentCount((count) => count + 1)}>
            增加父层计数
          </button>
        </div>

        <section
          className="nested-outlet-slot"
          data-testid="nested-outlet-slot"
          aria-labelledby="nested-outlet-slot-title"
        >
          <div className="nested-outlet-slot-heading">
            <p>Outlet</p>
            <h3 id="nested-outlet-slot-title">子页面插入点</h3>
          </div>
          <Outlet />
        </section>
      </section>
    )
  }

  /** 渲染 overview 子 route。 */
  function ProjectOverviewPage() {
    return (
      <NestedChildPage
        eyebrow="Child route · overview"
        title="项目概览"
        summary="这个子页面渲染在父组件的 Outlet 位置。"
        routeName="overview"
      />
    )
  }

  /** 渲染 activity 子 route。 */
  function ProjectActivityPage() {
    return (
      <NestedChildPage
        eyebrow="Child route · activity"
        title="最近活动"
        summary="切换 child 只替换 Outlet 区域，父层界面与计数继续保留。"
        routeName="activity"
      />
    )
  }

  const routes = [
    {
      id: 'projects',
      path: 'projects',
      Component: ProjectsLayout,
      children: [
        { id: 'project-overview', path: 'overview', Component: ProjectOverviewPage },
        { id: 'project-activity', path: 'activity', Component: ProjectActivityPage },
      ],
    },
  ] satisfies RouteObject[]
  const router = createMemoryRouter(routes, { initialEntries: ['/projects/overview'] })

  /** 挂载隔离的 RouterProvider，并保持学习站 URL 不变。 */
  function NestedRoutesAndOutletDemo() {
    return (
      <section className="nested-outlet-demo" data-testid="nested-outlet-demo">
        <header className="nested-outlet-demo-heading">
          <p>Nested route observer</p>
          <h2>父 route 与 child route 同时渲染</h2>
          <span>内存 Router 负责 Demo 导航，外层学习站地址不参与匹配。</span>
        </header>
        <div className="nested-outlet-viewport">
          <RouterProvider router={router} />
        </div>
      </section>
    )
  }

  return NestedRoutesAndOutletDemo
}
