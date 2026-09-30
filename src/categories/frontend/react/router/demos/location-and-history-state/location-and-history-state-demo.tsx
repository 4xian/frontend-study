import { type ComponentType } from 'react'
import {
  createMemoryRouter,
  useLocation,
  useNavigate,
  useNavigationType,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './location-and-history-state-demo.css'

type OrderHistoryState = {
  source: string
  notice: string
}

const initialEntry = {
  pathname: '/orders/41',
  search: '?from=list',
  hash: '#summary',
  state: {
    source: '订单列表',
    notice: '返回时继续查看这笔订单',
  } satisfies OrderHistoryState,
}

/** 把受控 Demo 的 history state 转换为可展示数据。 */
function readOrderHistoryState(value: unknown): OrderHistoryState | null {
  if (!value || typeof value !== 'object') return null
  const state = value as Partial<OrderHistoryState>
  if (typeof state.source !== 'string' || typeof state.notice !== 'string') return null
  return { source: state.source, notice: state.notice }
}

/** 实时展示当前 Location、entry state 与 history action。 */
function LocationObserver() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const navigate = useNavigate()
  const historyState = readOrderHistoryState(location.state)

  /** Push 一条 pathname 相同但 state 不同的新记录。 */
  async function pushRecommendedOrder(): Promise<void> {
    await navigate('/orders/41?from=recommendation#summary', {
      state: {
        source: '推荐卡片',
        notice: '返回时保留推荐来源',
      } satisfies OrderHistoryState,
    })
  }

  /** Replace 当前记录，并写入属于替换后 entry 的 state。 */
  async function replaceWithSearchResult(): Promise<void> {
    await navigate('/orders/43?from=search#details', {
      replace: true,
      state: {
        source: '搜索结果',
        notice: '当前 entry 已替换',
      } satisfies OrderHistoryState,
    })
  }

  /** Push 一条没有自定义 state 的记录。 */
  async function pushStateLessOrder(): Promise<void> {
    await navigate('/orders/44#summary')
  }

  /** 在当前受控内存 history 中后退一项。 */
  async function moveBack(): Promise<void> {
    await navigate(-1)
  }

  /** 在当前受控内存 history 中前进一项。 */
  async function moveForward(): Promise<void> {
    await navigate(1)
  }

  return (
    <section className="location-history-workbench" data-testid="location-history-workbench">
      <header className="location-history-heading">
        <p>Location observer</p>
        <h2>订单历史记录观察台</h2>
        <span>每次导航都会更新当前 Location；外层学习站地址保持不变。</span>
      </header>

      <section className="location-history-action" aria-labelledby="location-history-action-title">
        <div>
          <p>History action</p>
          <h3 id="location-history-action-title">本次如何到达</h3>
        </div>
        <strong data-testid="location-navigation-type" aria-live="polite">
          {navigationType}
        </strong>
        <span>POP 只表示在已有 history 中切换，不表示固定的后退方向。</span>
      </section>

      <section className="location-history-fields" aria-labelledby="location-history-fields-title">
        <h3 id="location-history-fields-title">当前 Location</h3>
        <dl aria-live="polite">
          <div>
            <dt>pathname</dt>
            <dd data-testid="location-pathname">{location.pathname}</dd>
          </div>
          <div>
            <dt>search</dt>
            <dd data-testid="location-search">{location.search || '（空）'}</dd>
          </div>
          <div>
            <dt>hash</dt>
            <dd data-testid="location-hash">{location.hash || '（空）'}</dd>
          </div>
          <div>
            <dt>key</dt>
            <dd data-testid="location-key">{location.key}</dd>
          </div>
        </dl>
      </section>

      <section className="location-history-state" aria-labelledby="location-history-state-title">
        <h3 id="location-history-state-title">当前 entry 的 state</h3>
        {historyState ? (
          <dl data-testid="location-state-present" aria-live="polite">
            <div>
              <dt>source</dt>
              <dd>{historyState.source}</dd>
            </div>
            <div>
              <dt>notice</dt>
              <dd>{historyState.notice}</dd>
            </div>
          </dl>
        ) : (
          <p data-testid="location-state-empty" aria-live="polite">
            null（这条 entry 没有自定义 state）
          </p>
        )}
      </section>

      <section
        className="location-history-controls"
        aria-labelledby="location-history-controls-title"
      >
        <h3 id="location-history-controls-title">改变内存 history</h3>
        <div>
          <button type="button" data-testid="location-push" onClick={pushRecommendedOrder}>
            Push 同路径推荐
          </button>
          <button type="button" data-testid="location-replace" onClick={replaceWithSearchResult}>
            Replace 搜索结果
          </button>
          <button type="button" data-testid="location-push-empty" onClick={pushStateLessOrder}>
            Push 无 state 订单
          </button>
          <button type="button" data-testid="location-back" onClick={moveBack}>
            后退一项
          </button>
          <button type="button" data-testid="location-forward" onClick={moveForward}>
            前进一项
          </button>
        </div>
      </section>

      <footer>
        state 与 key 属于当前 history entry；复制这里只显示的 pathname、search 和
        hash，不会一并复制它们。
      </footer>
    </section>
  )
}

const routes = [
  {
    id: 'order',
    path: '/orders/:orderId',
    Component: LocationObserver,
  },
] satisfies RouteObject[]

/** 为每次宿主挂载创建拥有独立 history entries 的 Location Demo。 */
export function createLocationAndHistoryStateDemo(): ComponentType {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  })

  /** 挂载本课独立的内存 Router。 */
  function LocationAndHistoryStateDemo() {
    return (
      <section className="location-history-demo" data-testid="location-history-demo">
        <RouterProvider router={router} />
      </section>
    )
  }

  return LocationAndHistoryStateDemo
}
