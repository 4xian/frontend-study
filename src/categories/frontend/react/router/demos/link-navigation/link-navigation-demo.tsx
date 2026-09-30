import type { ComponentType, ReactNode } from 'react'
import { createMemoryRouter, Link, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './link-navigation-demo.css'

interface LinkNavigationPageProps {
  eyebrow: string
  title: string
  memoryPath: string
  initialHostUrl: string
  children: ReactNode
}

/** 统一展示内存地址、宿主地址与当前路由页面。 */
function LinkNavigationPage({
  eyebrow,
  title,
  memoryPath,
  initialHostUrl,
  children,
}: LinkNavigationPageProps) {
  return (
    <section className="link-navigation-page">
      <div className="link-navigation-addresses" aria-label="路由地址对照">
        <div>
          <span>内存地址</span>
          <code data-testid="link-navigation-memory-path">{memoryPath}</code>
        </div>
        <div>
          <span>宿主初始地址</span>
          <code data-testid="link-navigation-host-initial">{initialHostUrl}</code>
        </div>
        <div>
          <span>宿主当前地址</span>
          <code data-testid="link-navigation-host-current">{window.location.href}</code>
        </div>
      </div>

      <div className="link-navigation-content">
        <p>{eyebrow}</p>
        <h3>{title}</h3>
        {children}
      </div>
    </section>
  )
}

/** 为每次宿主挂载创建独立的 Link 内存路由 Demo。 */
export function createLinkNavigationDemo(): ComponentType {
  const initialHostUrl = window.location.href

  /** 展示初始目录与相对字符串 Link。 */
  function CatalogPage() {
    return (
      <LinkNavigationPage
        eyebrow="第 1 步 · 默认 push"
        title="课程目录"
        memoryPath="/catalog"
        initialHostUrl={initialHostUrl}
      >
        <p>这个 Link 使用相对字符串目标，并渲染真实 href。</p>
        <Link className="link-navigation-link" to="details">
          打开课程详情
        </Link>
      </LinkNavigationPage>
    )
  }

  /** 展示对象目标以及 replace 和 state 的写入语法。 */
  function DetailsPage() {
    return (
      <LinkNavigationPage
        eyebrow="第 2 步 · 替换当前 entry"
        title="课程详情"
        memoryPath="/catalog/details"
        initialHostUrl={initialHostUrl}
      >
        <p>对象目标明确组成 pathname、search 与 hash；state 不进入地址栏。</p>
        <Link
          className="link-navigation-link"
          to={{
            pathname: '/catalog/receipt',
            search: '?from=details',
            hash: '#summary',
          }}
          replace
          state={{ from: '课程详情' }}
        >
          完成并查看结果
        </Link>
      </LinkNavigationPage>
    )
  }

  /** 展示 replace 后的目标，并提供一次后退验证。 */
  function ReceiptPage() {
    return (
      <LinkNavigationPage
        eyebrow="第 3 步 · 验证后退结果"
        title="学习结果"
        memoryPath="/catalog/receipt?from=details#summary"
        initialHostUrl={initialHostUrl}
      >
        <p>详情 entry 已被结果页替换；后退一次应直接返回课程目录。</p>
        <button
          className="link-navigation-back"
          type="button"
          onClick={() => void router.navigate(-1)}
        >
          后退一次（Demo 验证）
        </button>
      </LinkNavigationPage>
    )
  }

  const routes = [
    { id: 'catalog', path: '/catalog', Component: CatalogPage },
    { id: 'details', path: '/catalog/details', Component: DetailsPage },
    { id: 'receipt', path: '/catalog/receipt', Component: ReceiptPage },
  ] satisfies RouteObject[]
  const router = createMemoryRouter(routes, { initialEntries: ['/catalog'] })

  /** 挂载隔离的 RouterProvider，并说明宿主 URL 不参与导航。 */
  function LinkNavigationDemo() {
    return (
      <section className="link-navigation-demo" data-testid="link-navigation-demo">
        <header className="link-navigation-heading">
          <p>Link history observer</p>
          <h2>Link 与内存 history</h2>
          <span>所有路由切换都限制在 Demo 内，外层学习站地址保持不变。</span>
        </header>
        <div className="link-navigation-viewport">
          <RouterProvider router={router} />
        </div>
      </section>
    )
  }

  return LinkNavigationDemo
}
