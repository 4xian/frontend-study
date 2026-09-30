import { useMemo, useState, type ComponentType } from 'react'
import { matchRoutes, type RouteObject } from 'react-router'

import './route-matching-demo.css'

const routes = [
  { id: 'home', path: '/' },
  { id: 'courses', path: '/courses' },
  { id: 'react-course', path: '/courses/react' },
  { id: 'api-docs', path: '/API/Docs', caseSensitive: true },
] satisfies RouteObject[]

const pathnamePresets = [
  '/',
  '/courses',
  '/courses/react',
  '/COURSES/REACT',
  '/API/Docs',
  '/api/docs',
  '/courses/react/',
  '/missing',
] as const

/** 根据本地 pathname 展示固定路由集合的匹配结果。 */
function RouteMatchingDemo() {
  const [pathname, setPathname] = useState('/courses/react')
  const matches = useMemo(() => matchRoutes(routes, pathname), [pathname])

  return (
    <section className="route-matching-demo" data-testid="route-matching-demo">
      <header className="route-matching-heading">
        <p>Static route matcher</p>
        <h2>静态路由匹配观察器</h2>
        <span>输入只保存在 Demo 内，不会改变学习站地址。</span>
      </header>

      <div className="route-matching-controls">
        <label htmlFor="route-matching-pathname">pathname</label>
        <input
          id="route-matching-pathname"
          type="text"
          value={pathname}
          spellCheck={false}
          onChange={(event) => setPathname(event.target.value)}
        />
        <div className="route-matching-presets" role="group" aria-label="pathname 预设">
          {pathnamePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-pressed={pathname === preset}
              onClick={() => setPathname(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <section className="route-matching-routes" aria-labelledby="route-matching-routes-title">
        <h3 id="route-matching-routes-title">固定 RouteObject</h3>
        <ul>
          {routes.map((route) => (
            <li key={route.id}>
              <code>{route.path}</code>
              <span>{route.id}</span>
              {route.caseSensitive ? <strong>区分大小写</strong> : null}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="route-matching-result"
        aria-labelledby="route-matching-result-title"
        aria-live="polite"
      >
        <div className="route-matching-result-heading">
          <h3 id="route-matching-result-title">匹配结果</h3>
          <strong data-testid="route-matching-status">
            {matches === null ? '未匹配' : '已匹配'}
          </strong>
        </div>

        {matches === null ? (
          <p className="route-matching-empty">
            <code>matchRoutes</code> 返回 <code>null</code>
          </p>
        ) : (
          <ol className="route-matching-matches">
            {matches.map((match) => (
              <li key={match.route.id ?? match.pathname}>
                <dl>
                  <div>
                    <dt>route.id</dt>
                    <dd>{match.route.id ?? '未设置'}</dd>
                  </div>
                  <div>
                    <dt>route.path</dt>
                    <dd>{match.route.path ?? '未设置'}</dd>
                  </div>
                  <div>
                    <dt>pathname</dt>
                    <dd>{match.pathname}</dd>
                  </div>
                  <div>
                    <dt>pathnameBase</dt>
                    <dd>{match.pathnameBase}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  )
}

/** 为 React Demo 宿主提供路由匹配观察组件。 */
export function createRouteMatchingDemo(): ComponentType {
  return RouteMatchingDemo
}
