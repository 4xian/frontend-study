import { type ComponentType } from 'react'
import { createMemoryRouter, useLocation, useSearchParams, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './query-params-and-url-state-demo.css'

const initialSearch = '?brand=nike&brand=reebok&q=red+shoes&path=%2Fdocs&empty='
const initialEntry = `/catalog${initialSearch}`
const defaultSearchParams = {
  view: 'cards',
  sort: 'relevance',
} as const

/** 把 null 与空字符串转换为可区分的界面文本。 */
function formatNullableValue(value: string | null): string {
  if (value === null) return 'null（键不存在）'
  return value === '' ? "''（存在但为空）" : value
}

/** 展示当前内存 URL、有效查询参数及标准解析结果。 */
function QueryParamsWorkbench() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams(defaultSearchParams)
  const brands = searchParams.getAll('brand')
  const entries = Array.from(searchParams.entries())

  /** 在保留现有查询状态的同时追加一个同名值。 */
  function appendBrand(): void {
    setSearchParams((previous) => {
      previous.append('brand', 'new balance')
      return previous
    })
  }

  /** 用未编码的逻辑值更新搜索词，并替换当前 history entry。 */
  function updateQuery(): void {
    setSearchParams(
      (previous) => {
        previous.set('q', 'a+b / c')
        return previous
      },
      { replace: true },
    )
  }

  /** 删除空值键，让存在状态从 true 变为 false。 */
  function deleteEmptyValue(): void {
    setSearchParams((previous) => {
      previous.delete('empty')
      return previous
    })
  }

  /** 使用对象输入建立一份新的完整查询列表。 */
  function replaceAllFilters(): void {
    setSearchParams({
      brand: ['nike', 'reebok'],
      q: 'router basics',
    })
  }

  /** 清空查询并证明调用 setter 后默认值不会重新补回。 */
  function clearSearchParams(): void {
    setSearchParams({}, { replace: true })
  }

  /** 恢复初始查询文本，便于重新观察重复值和编码。 */
  function restoreInitialSearch(): void {
    setSearchParams(initialSearch, { replace: true })
  }

  return (
    <section className="query-params-workbench" data-testid="query-params-workbench">
      <header className="query-params-heading">
        <p>useSearchParams observer</p>
        <h2>课程筛选 URL 观察台</h2>
        <span>所有操作只更新内存 Router，学习站外层地址不会改变。</span>
      </header>

      <section className="query-params-location" aria-labelledby="query-params-location-title">
        <div>
          <p>URL snapshot</p>
          <h3 id="query-params-location-title">原始 URL 与有效参数</h3>
        </div>
        <dl>
          <div>
            <dt>内存 location.search</dt>
            <dd data-testid="query-params-location-search">{location.search || '（空）'}</dd>
          </div>
          <div>
            <dt>searchParams.toString()</dt>
            <dd data-testid="query-params-effective-search">
              {searchParams.toString() || '（空）'}
            </dd>
          </div>
        </dl>
        <span>
          首次挂载时，view 与 sort 只出现在 Hook 读取结果中，不会被 defaultInit 写入原始 URL。
        </span>
      </section>

      <section className="query-params-values" aria-labelledby="query-params-values-title">
        <h3 id="query-params-values-title">读取结果</h3>
        <dl aria-live="polite">
          <div>
            <dt>brand 的第一个值</dt>
            <dd data-testid="query-params-brand-first">
              {formatNullableValue(searchParams.get('brand'))}
            </dd>
          </div>
          <div>
            <dt>brand 的全部值</dt>
            <dd data-testid="query-params-brand-all">
              {brands.length ? brands.join(' → ') : '[]'}
            </dd>
          </div>
          <div>
            <dt>q</dt>
            <dd data-testid="query-params-query">{formatNullableValue(searchParams.get('q'))}</dd>
          </div>
          <div>
            <dt>path</dt>
            <dd data-testid="query-params-path">{formatNullableValue(searchParams.get('path'))}</dd>
          </div>
          <div>
            <dt>empty</dt>
            <dd data-testid="query-params-empty">
              has={String(searchParams.has('empty'))}；get=
              {formatNullableValue(searchParams.get('empty'))}
            </dd>
          </div>
          <div>
            <dt>missing</dt>
            <dd data-testid="query-params-missing">
              has={String(searchParams.has('missing'))}；get=
              {formatNullableValue(searchParams.get('missing'))}
            </dd>
          </div>
        </dl>
      </section>

      <section className="query-params-controls" aria-labelledby="query-params-controls-title">
        <h3 id="query-params-controls-title">更新查询状态</h3>
        <div>
          <button type="button" onClick={appendBrand}>
            追加品牌
          </button>
          <button type="button" onClick={updateQuery}>
            更新搜索词
          </button>
          <button type="button" onClick={deleteEmptyValue}>
            删除空值
          </button>
          <button type="button" onClick={replaceAllFilters}>
            替换全部筛选
          </button>
          <button type="button" onClick={clearSearchParams}>
            清空查询
          </button>
          <button type="button" onClick={restoreInitialSearch}>
            恢复初始查询
          </button>
        </div>
      </section>

      <section className="query-params-entries" aria-labelledby="query-params-entries-title">
        <h3 id="query-params-entries-title">按顺序保留的 name-value 列表</h3>
        {entries.length ? (
          <ol data-testid="query-params-entries">
            {entries.map(([name, value], index) => (
              <li key={`${name}-${value}-${index}`}>
                <code>{name}</code>
                <span>{value === '' ? "''" : value}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p data-testid="query-params-entries-empty">当前没有查询参数。</p>
        )}
      </section>
    </section>
  )
}

const routes = [
  {
    id: 'catalog',
    path: '/catalog',
    Component: QueryParamsWorkbench,
  },
] satisfies RouteObject[]

/** 为每次宿主挂载创建拥有独立 URL 状态的查询参数 Demo。 */
export function createQueryParamsAndUrlStateDemo(): ComponentType {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  })

  /** 挂载本课独立的内存 Router。 */
  function QueryParamsAndUrlStateDemo() {
    return (
      <section className="query-params-demo" data-testid="query-params-demo">
        <RouterProvider router={router} />
      </section>
    )
  }

  return QueryParamsAndUrlStateDemo
}
