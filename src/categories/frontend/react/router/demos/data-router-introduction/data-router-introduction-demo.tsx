import type { ComponentType } from 'react'
import { createMemoryRouter, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './data-router-introduction-demo.css'

/** 展示根路径匹配后由 RouterProvider 渲染出的首页。 */
function CourseHome() {
  return (
    <main className="data-router-demo-page" data-testid="data-router-demo-page">
      <span>当前地址</span>
      <code>/</code>
      <h3>Data Router 已接管内容区域</h3>
      <p>路由对象负责声明地址与组件的对应关系。</p>
    </main>
  )
}

const routes: RouteObject[] = [
  {
    path: '/',
    Component: CourseHome,
  },
]

/** 在 React 树外创建独立路由，并返回本次宿主挂载使用的 Demo 组件。 */
export function createDataRouterIntroductionDemo(): ComponentType {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] })

  /** 展示一个不接管宿主地址栏的 Data Router。 */
  function DataRouterIntroductionDemo() {
    return (
      <section className="data-router-demo" data-testid="data-router-demo">
        <header className="data-router-demo-heading">
          <p>Route Object → Data Router → RouterProvider</p>
          <h2>最小启动链</h2>
        </header>

        <div className="data-router-demo-flow" aria-label="Data Router 启动链">
          <code>{`{ path: '/', Component }`}</code>
          <strong aria-hidden="true">→</strong>
          <span>createMemoryRouter</span>
          <strong aria-hidden="true">→</strong>
          <span>RouterProvider</span>
        </div>

        <div className="data-router-demo-viewport">
          <RouterProvider router={router} />
        </div>

        <p className="data-router-demo-note">
          课程播放器使用独立的内存历史，因而不会改写学习站自身的地址。
        </p>
      </section>
    )
  }

  return DataRouterIntroductionDemo
}
