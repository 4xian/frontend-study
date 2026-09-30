import { useState, type ComponentType } from 'react'
import { createMemoryRouter, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './route-objects-demo.css'

type RouteSample = 'component' | 'element'

/** 展示由 Component 字段保存的页面组件。 */
function ComponentPage() {
  return (
    <article className="route-objects-page">
      <span>当前页面</span>
      <h3>Component 样本已渲染</h3>
      <p>路由对象保存的是组件类型 ComponentPage。</p>
    </article>
  )
}

/** 展示由 element 字段保存且带有 props 的 React element。 */
function ElementPage({ audience }: { audience: string }) {
  return (
    <article className="route-objects-page">
      <span>当前页面</span>
      <h3>element 样本已渲染</h3>
      <p>这个 element 在配置处收到 audience: {audience}。</p>
    </article>
  )
}

const componentRoute = {
  id: 'component-page',
  path: '/',
  Component: ComponentPage,
} satisfies RouteObject

const componentRoutes = [componentRoute] satisfies RouteObject[]

const elementRoute = {
  id: 'element-page',
  path: '/',
  element: <ElementPage audience="本科生" />,
} satisfies RouteObject

const elementRoutes = [elementRoute] satisfies RouteObject[]

/** 为当前宿主挂载创建两个稳定的内存路由观察样本。 */
export function createRouteObjectsDemo(): ComponentType {
  const componentRouter = createMemoryRouter(componentRoutes, { initialEntries: ['/'] })
  const elementRouter = createMemoryRouter(elementRoutes, { initialEntries: ['/'] })

  /** 切换并观察 Component 与 element 两种路由对象写法。 */
  function RouteObjectsDemo() {
    const [sample, setSample] = useState<RouteSample>('component')
    const isComponentSample = sample === 'component'
    const route = isComponentSample ? componentRoute : elementRoute
    const router = isComponentSample ? componentRouter : elementRouter
    const renderField = isComponentSample ? 'Component' : 'element'

    return (
      <section className="route-objects-demo" data-testid="route-objects-demo">
        <header className="route-objects-heading">
          <p>Route Object field observer</p>
          <h2>同一种配置，两种渲染字段</h2>
        </header>

        <div className="route-objects-switch" role="group" aria-label="选择路由对象样本">
          <button
            type="button"
            aria-pressed={isComponentSample}
            onClick={() => setSample('component')}
          >
            Component 样本
          </button>
          <button
            type="button"
            aria-pressed={!isComponentSample}
            onClick={() => setSample('element')}
          >
            element 样本
          </button>
        </div>

        <dl className="route-objects-fields" aria-label="当前路由对象字段">
          <div>
            <dt>id</dt>
            <dd>{route.id}</dd>
          </div>
          <div>
            <dt>path</dt>
            <dd>{route.path}</dd>
          </div>
          <div>
            <dt>渲染字段</dt>
            <dd>{renderField}</dd>
          </div>
        </dl>

        <div className="route-objects-viewport">
          <RouterProvider key={sample} router={router} />
        </div>

        <p className="route-objects-note">
          样本切换只更换观察对象，两个 memory router 都保持在自己的根路径。
        </p>
      </section>
    )
  }

  return RouteObjectsDemo
}
