import { type ComponentType, useEffect, useRef, useState } from 'react'
import {
  createMemoryRouter,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigation,
  useRevalidator,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type RouteObject,
  type ShouldRevalidateFunctionArgs,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './revalidation-demo.css'

type InventoryItem = {
  id: number
  name: string
  stock: number
}

type InventoryData = {
  items: InventoryItem[]
  revision: number
  loaderCalls: number
}

type SummaryData = {
  totalUnits: number
  lowStockNames: string[]
  revision: number
  loaderCalls: number
}

type MutationResult = {
  scope: 'inventory' | 'preferences'
  message: string
  actionCalls: number
}

type RevalidationDecision = {
  reason: string
  defaultDecision: boolean
  finalDecision: boolean
}

const initialInventory: readonly InventoryItem[] = [
  { id: 1, name: '机械键盘', stock: 5 },
  { id: 2, name: '人体工学鼠标', stock: 3 },
  { id: 3, name: '显示器支架', stock: 2 },
]

/** 提供可取消的观察延时，并在请求中止时释放计时器。 */
function waitForRequest(signal: AbortSignal, delay: number): Promise<void> {
  return new Promise((resolve, reject) => {
    /** 结束已经取消的延时任务。 */
    function handleAbort() {
      window.clearTimeout(timer)
      reject(new DOMException('Request aborted', 'AbortError'))
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, delay)

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}

/** 只在状态变化时追加记录，并限制观察序列长度。 */
function appendState(trace: string[], state: string): string[] {
  if (trace.at(-1) === state) return trace
  return [...trace.slice(-6), state]
}

/** 为每次宿主挂载创建独立的库存模型、计数与内存路由。 */
export function createRevalidationDemo(): ComponentType {
  let inventory = initialInventory.map((item) => ({ ...item }))
  let revision = 1
  let inventoryLoaderCalls = 0
  let summaryLoaderCalls = 0
  let actionCalls = 0
  let lastDecision: RevalidationDecision = {
    reason: '等待第一次重验证判定',
    defaultDecision: false,
    finalDecision: false,
  }

  /** 恢复库存、版本与调用计数，保证每轮观察从同一状态开始。 */
  function resetServerState() {
    inventory = initialInventory.map((item) => ({ ...item }))
    revision = 1
    inventoryLoaderCalls = 0
    summaryLoaderCalls = 0
    actionCalls = 0
    lastDecision = {
      reason: '等待第一次重验证判定',
      defaultDecision: false,
      finalDecision: false,
    }
  }

  /** 返回当前库存快照，并为后续重验证保留可观察的加载窗口。 */
  async function inventoryLoader({ request }: LoaderFunctionArgs): Promise<InventoryData> {
    inventoryLoaderCalls += 1
    if (inventoryLoaderCalls > 1) await waitForRequest(request.signal, 520)

    return {
      items: inventory.map((item) => ({ ...item })),
      revision,
      loaderCalls: inventoryLoaderCalls,
    }
  }

  /** 返回由 fetcher.load 独立读取的库存摘要。 */
  async function summaryLoader({ request }: LoaderFunctionArgs): Promise<SummaryData> {
    summaryLoaderCalls += 1
    await waitForRequest(request.signal, 460)

    return {
      totalUnits: inventory.reduce((total, item) => total + item.stock, 0),
      lowStockNames: inventory.filter((item) => item.stock <= 2).map((item) => item.name),
      revision,
      loaderCalls: summaryLoaderCalls,
    }
  }

  /** 根据提交意图修改库存或只保存与库存无关的显示偏好。 */
  async function inventoryAction({ request }: ActionFunctionArgs): Promise<MutationResult> {
    actionCalls += 1
    const formData = await request.formData()
    const intent = formData.get('intent')

    await waitForRequest(request.signal, 560)

    if (intent === 'preferences') {
      return {
        scope: 'preferences',
        message: '显示密度已保存；它不影响库存 loader 的数据依赖。',
        actionCalls,
      }
    }

    inventory = inventory.map((item) =>
      item.id === 1 ? { ...item, stock: Math.max(0, item.stock - 1) } : item,
    )
    revision += 1

    return {
      scope: 'inventory',
      message: '库存 action 已完成，页面与已加载摘要会自动重新验证。',
      actionCalls,
    }
  }

  /** 只跳过已确认与库存无关的偏好提交，其余情况沿用 Router 默认判断。 */
  function shouldRevalidate({
    actionResult,
    defaultShouldRevalidate,
  }: ShouldRevalidateFunctionArgs): boolean {
    const result = actionResult as MutationResult | undefined

    if (result?.scope === 'preferences') {
      lastDecision = {
        reason: '偏好 action 不改变库存数据',
        defaultDecision: defaultShouldRevalidate,
        finalDecision: false,
      }
      return false
    }

    lastDecision = {
      reason: '没有命中安全跳过条件，沿用默认值',
      defaultDecision: defaultShouldRevalidate,
      finalDecision: defaultShouldRevalidate,
    }
    return defaultShouldRevalidate
  }

  /** 呈现自动、手动与选择性重验证的完整观察台。 */
  function InventoryWorkspace() {
    const data = useLoaderData<typeof inventoryLoader>()
    const mutationFetcher = useFetcher<typeof inventoryAction>()
    const preferencesFetcher = useFetcher<typeof inventoryAction>()
    const [summaryVersion, setSummaryVersion] = useState(0)
    const summaryFetcher = useFetcher<typeof summaryLoader>({
      key: `revalidation-summary-${summaryVersion}`,
    })
    const navigation = useNavigation()
    const revalidator = useRevalidator()
    const location = useLocation()
    const [serverRevision, setServerRevision] = useState(revision)
    const [mutationTrace, setMutationTrace] = useState<string[]>(['idle'])
    const [manualTrace, setManualTrace] = useState<string[]>(['idle'])
    const [summaryTrace, setSummaryTrace] = useState<string[]>(['idle'])
    const isMutating = mutationFetcher.state !== 'idle'
    const isSavingPreferences = preferencesFetcher.state !== 'idle'
    const isRevalidating = revalidator.state === 'loading'
    const isLoadingSummary = summaryFetcher.state === 'loading'
    const isBusy =
      navigation.state !== 'idle' ||
      isMutating ||
      isSavingPreferences ||
      isRevalidating ||
      isLoadingSummary

    useEffect(() => {
      setMutationTrace((currentTrace) => appendState(currentTrace, mutationFetcher.state))
    }, [mutationFetcher.state])

    useEffect(() => {
      setManualTrace((currentTrace) => appendState(currentTrace, revalidator.state))
    }, [revalidator.state])

    useEffect(() => {
      setSummaryTrace((currentTrace) => appendState(currentTrace, summaryFetcher.state))
    }, [summaryFetcher.state])

    useEffect(() => {
      if (mutationFetcher.state === 'idle' && mutationFetcher.data?.scope === 'inventory') {
        setServerRevision(revision)
      }
    }, [mutationFetcher.data, mutationFetcher.state])

    /** 首次读取摘要，并让 Router 记住这个 fetcher.load 目标。 */
    function handleLoadSummary() {
      summaryFetcher.load('/inventory/summary')
    }

    /** 模拟 Router 外部写入，只改变数据源而不主动刷新 loader data。 */
    function handleExternalWrite() {
      inventory = inventory.map((item) =>
        item.id === 3 ? { ...item, stock: item.stock + 2 } : item,
      )
      revision += 1
      setServerRevision(revision)
    }

    /** 请求 Router 在当前 location 上手动重新验证 loader 数据。 */
    function handleManualRevalidation() {
      void revalidator.revalidate()
    }

    /** 清除 Fetcher 数据和状态轨迹，并重新提交初始库存快照。 */
    function handleResetDemo() {
      resetServerState()
      mutationFetcher.reset()
      preferencesFetcher.reset()
      summaryFetcher.reset()
      setSummaryVersion((currentVersion) => currentVersion + 1)
      setServerRevision(revision)
      setMutationTrace(['idle'])
      setManualTrace(['idle'])
      setSummaryTrace(['idle'])
      void router.navigate('/inventory', { replace: true })
    }

    return (
      <section className="revalidation-demo" data-testid="revalidation-demo">
        <header className="revalidation-heading">
          <div>
            <p>Data Router Revalidation</p>
            <h2>库存同步观察台</h2>
            <span>对比 action 自动刷新、外部变化手动刷新，以及安全跳过的 loader 判定。</span>
          </div>
          <button
            type="button"
            className="revalidation-reset"
            data-testid="revalidation-reset"
            onClick={handleResetDemo}
            disabled={isBusy}
          >
            重置演示
          </button>
        </header>

        <dl className="revalidation-observer" aria-label="路由与数据版本观察结果">
          <div>
            <dt>current location</dt>
            <dd data-testid="revalidation-location">{location.pathname + location.search}</dd>
          </div>
          <div>
            <dt>navigation</dt>
            <dd data-testid="revalidation-navigation-state">{navigation.state}</dd>
          </div>
          <div>
            <dt>revalidator</dt>
            <dd data-testid="revalidation-state">{revalidator.state}</dd>
          </div>
          <div>
            <dt>page / server revision</dt>
            <dd data-testid="revalidation-revisions">
              {data.revision} / {serverRevision}
            </dd>
          </div>
          <div>
            <dt>page loader calls</dt>
            <dd data-testid="revalidation-page-loader-count">{data.loaderCalls}</dd>
          </div>
          <div>
            <dt>summary loader calls</dt>
            <dd data-testid="revalidation-summary-loader-count">
              {summaryFetcher.data?.loaderCalls ?? 0}
            </dd>
          </div>
          <div>
            <dt>action calls</dt>
            <dd data-testid="revalidation-action-count">{actionCalls}</dd>
          </div>
        </dl>

        <section className="revalidation-decision" aria-live="polite">
          <div>
            <span>最近一次 shouldRevalidate</span>
            <strong data-testid="revalidation-decision-reason">{lastDecision.reason}</strong>
          </div>
          <p data-testid="revalidation-decision-values">
            default: {String(lastDecision.defaultDecision)} / final:{' '}
            {String(lastDecision.finalDecision)}
          </p>
        </section>

        <div className="revalidation-workflows">
          <section className="revalidation-panel" aria-busy={isMutating}>
            <div className="revalidation-panel-heading">
              <div>
                <p>Automatic</p>
                <h3>库存 action</h3>
              </div>
              <strong data-testid="revalidation-mutation-state">{mutationFetcher.state}</strong>
            </div>
            <p>Fetcher 提交成功后，页面 loader 与已加载的摘要会自动重新验证。</p>
            <mutationFetcher.Form method="post">
              <input type="hidden" name="intent" value="decrement" />
              <button type="submit" disabled={isBusy}>
                {isMutating ? '同步库存中' : '售出 1 个机械键盘'}
              </button>
            </mutationFetcher.Form>
            <span className="revalidation-trace" data-testid="revalidation-mutation-trace">
              {mutationTrace.join(' -> ')}
            </span>
            <small>{mutationFetcher.data?.message ?? '等待库存提交。'}</small>
          </section>

          <section className="revalidation-panel" aria-busy={isSavingPreferences}>
            <div className="revalidation-panel-heading">
              <div>
                <p>Selective</p>
                <h3>安全跳过</h3>
              </div>
              <strong data-testid="revalidation-preferences-state">
                {preferencesFetcher.state}
              </strong>
            </div>
            <p>偏好 action 不改变库存，路由明确返回 false，loader 计数保持不变。</p>
            <preferencesFetcher.Form method="post">
              <input type="hidden" name="intent" value="preferences" />
              <button type="submit" disabled={isBusy}>
                {isSavingPreferences ? '保存中' : '保存紧凑显示偏好'}
              </button>
            </preferencesFetcher.Form>
            <span className="revalidation-trace">
              {preferencesFetcher.state === 'idle' ? '等待提交或已完成' : '正在处理偏好 action'}
            </span>
            <small>{preferencesFetcher.data?.message ?? '仅在依赖关系明确时跳过。'}</small>
          </section>

          <section className="revalidation-panel" aria-busy={isRevalidating}>
            <div className="revalidation-panel-heading">
              <div>
                <p>Manual</p>
                <h3>外部变化</h3>
              </div>
              <strong>{revalidator.state}</strong>
            </div>
            <p>先只改内存数据源，再手动同步；加载期间旧页面快照仍然可读。</p>
            <div className="revalidation-actions">
              <button type="button" onClick={handleExternalWrite} disabled={isBusy}>
                模拟外部补货
              </button>
              <button type="button" onClick={handleManualRevalidation} disabled={isBusy}>
                {isRevalidating ? '重新验证中' : '手动重新验证'}
              </button>
            </div>
            <span className="revalidation-trace" data-testid="revalidation-manual-trace">
              {manualTrace.join(' -> ')}
            </span>
            <small>页面版本与数据源版本不同时，当前 loader data 处于 stale 状态。</small>
          </section>
        </div>

        <div className="revalidation-results">
          <section className="revalidation-inventory">
            <div>
              <p>Route loader data</p>
              <h3>当前库存快照</h3>
            </div>
            <ul data-testid="revalidation-inventory-items">
              {data.items.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <strong>{item.stock} 件</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="revalidation-summary" aria-busy={isLoadingSummary}>
            <div className="revalidation-summary-heading">
              <div>
                <p>Remembered fetcher.load</p>
                <h3>库存摘要</h3>
              </div>
              <button type="button" onClick={handleLoadSummary} disabled={isBusy}>
                {isLoadingSummary ? '读取中' : '加载摘要'}
              </button>
            </div>
            <span className="revalidation-trace" data-testid="revalidation-summary-trace">
              {summaryTrace.join(' -> ')}
            </span>
            {summaryFetcher.data ? (
              <dl>
                <div>
                  <dt>summary revision</dt>
                  <dd data-testid="revalidation-summary-revision">
                    {summaryFetcher.data.revision}
                  </dd>
                </div>
                <div>
                  <dt>total units</dt>
                  <dd>{summaryFetcher.data.totalUnits}</dd>
                </div>
                <div>
                  <dt>low stock</dt>
                  <dd>{summaryFetcher.data.lowStockNames.join('、') || '无'}</dd>
                </div>
              </dl>
            ) : (
              <p>先加载一次，后续 action 或手动 revalidation 才会重新读取这个 href。</p>
            )}
          </section>
        </div>
      </section>
    )
  }

  const routes: RouteObject[] = [
    {
      id: 'revalidation-inventory',
      path: '/inventory',
      loader: inventoryLoader,
      action: inventoryAction,
      shouldRevalidate,
      Component: InventoryWorkspace,
    },
    {
      id: 'revalidation-summary',
      path: '/inventory/summary',
      loader: summaryLoader,
      shouldRevalidate,
    },
  ]
  const router = createMemoryRouter(routes, { initialEntries: ['/inventory'] })

  /** 把独立 Router 交给 Provider，并在真实宿主卸载后释放。 */
  function RevalidationDemo() {
    const isMounted = useRef(false)

    useEffect(() => {
      isMounted.current = true

      return () => {
        isMounted.current = false

        // StrictMode 会立即重跑 effect；真实卸载后才释放本次 Router。
        queueMicrotask(() => {
          if (!isMounted.current) router.dispose()
        })
      }
    }, [])

    return <RouterProvider router={router} />
  }

  return RevalidationDemo
}
