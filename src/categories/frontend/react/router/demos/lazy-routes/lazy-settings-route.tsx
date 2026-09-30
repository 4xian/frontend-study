import { isRouteErrorResponse, useLoaderData, useRouteError } from 'react-router'

export type SettingsData = {
  owner: string
  loadedAt: string
}

/** 呈现由另一个 lazy route module 提供的设置页面。 */
export function Component() {
  const data = useLoaderData<SettingsData>()

  return (
    <article className="lazy-routes-card" data-testid="lazy-routes-settings">
      <p>Lazy route module</p>
      <h3>设置中心</h3>
      <span>设置 route 的代码不会随着报告 route 一起进入当前页面。</span>
      <dl>
        <div>
          <dt>负责人</dt>
          <dd>{data.owner}</dd>
        </div>
        <div>
          <dt>数据返回时间</dt>
          <dd>{data.loadedAt}</dd>
        </div>
      </dl>
    </article>
  )
}

/** 呈现 settings loader 失败时由 lazy route 提供的最近错误边界。 */
export function ErrorBoundary() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : '未知设置错误'

  return (
    <article className="lazy-routes-card" data-testid="lazy-routes-error">
      <p>Lazy ErrorBoundary</p>
      <h3>设置加载失败</h3>
      <span>{message}</span>
    </article>
  )
}
