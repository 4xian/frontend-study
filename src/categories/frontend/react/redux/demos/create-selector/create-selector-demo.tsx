import {
  configureStore,
  createSelector,
  createSlice,
  type PayloadAction,
  type UnknownAction,
} from '@reduxjs/toolkit'
import { useState, type ComponentType, type ReactElement } from 'react'

import './create-selector-demo.css'

type InventoryFilter = 'all' | 'low-stock'

type InventoryItem = {
  id: string
  name: string
  stock: number
  lowStockThreshold: number
  priceCents: number
}

type InventoryState = {
  items: InventoryItem[]
  filter: InventoryFilter
}

/** 创建一份引用独立、结果确定的库存初始状态。 */
function createInitialInventoryState(): InventoryState {
  return {
    items: [
      { id: 'keyboard', name: '机械键盘', stock: 8, lowStockThreshold: 3, priceCents: 69900 },
      { id: 'mouse', name: '无线鼠标', stock: 2, lowStockThreshold: 3, priceCents: 32900 },
      { id: 'headset', name: '监听耳机', stock: 0, lowStockThreshold: 2, priceCents: 89900 },
    ],
    filter: 'all',
  }
}

const inventorySlice = createSlice({
  name: 'createSelectorInventory',
  initialState: createInitialInventoryState(),
  reducers: {
    /** 更新库存列表当前使用的筛选条件。 */
    filterChanged: (state, action: PayloadAction<InventoryFilter>) => {
      state.filter = action.payload
    },
    /** 为指定商品增加库存，触发相关输入变化。 */
    stockReceived: (state, action: PayloadAction<{ id: string; amount: number }>) => {
      const item = state.items.find((candidate) => candidate.id === action.payload.id)
      if (item) item.stock += action.payload.amount
    },
    /** 用全新引用恢复库存演示的初始状态。 */
    inventoryReset: () => createInitialInventoryState(),
  },
})

const activitySlice = createSlice({
  name: 'createSelectorActivity',
  initialState: { refreshCount: 0 },
  reducers: {
    /** 记录一次与库存查询无关的界面刷新。 */
    refreshRecorded: (state) => {
      state.refreshCount += 1
    },
    /** 恢复无关活动计数。 */
    activityReset: () => ({ refreshCount: 0 }),
  },
})

/** 为缓存观察台创建隔离的 Redux store。 */
function createDemoStore() {
  return configureStore({
    reducer: {
      inventory: inventorySlice.reducer,
      activity: activitySlice.reducer,
    },
  })
}

type DemoStore = ReturnType<typeof createDemoStore>
type RootState = ReturnType<DemoStore['getState']>

/** 读取库存商品原始数组，不执行派生计算。 */
const selectInventoryItems = (state: RootState) => state.inventory.items

/** 读取当前库存筛选条件。 */
const selectInventoryFilter = (state: RootState) => state.inventory.filter

/** 根据商品数组和筛选条件计算可见商品。 */
function filterVisibleItems(items: InventoryItem[], filter: InventoryFilter): InventoryItem[] {
  if (filter === 'all') return items
  return items.filter((item) => item.stock <= item.lowStockThreshold)
}

/** 缓存由商品数组和筛选条件共同决定的可见商品结果。 */
const selectVisibleItems = createSelector(
  [selectInventoryItems, selectInventoryFilter],
  filterVisibleItems,
)

/** 基于可见商品继续派生汇总信息。 */
function summarizeVisibleItems(items: InventoryItem[]) {
  return {
    itemCount: items.length,
    totalUnits: items.reduce((total, item) => total + item.stock, 0),
    inventoryValueCents: items.reduce((total, item) => total + item.stock * item.priceCents, 0),
  }
}

/** 组合可见商品 Selector，并缓存汇总对象。 */
const selectVisibleSummary = createSelector([selectVisibleItems], summarizeVisibleItems)

/** 用普通 Selector 返回新数组，作为结果引用对照组。 */
function selectVisibleItemsWithoutMemoization(state: RootState): InventoryItem[] {
  return filterVisibleItems(selectInventoryItems(state), selectInventoryFilter(state)).slice()
}

type SelectionSnapshot = {
  label: string
  state: RootState
  memoizedItems: InventoryItem[]
  plainItems: InventoryItem[]
  summary: ReturnType<typeof selectVisibleSummary>
  memoizedReferenceStable?: boolean
  plainReferenceStable?: boolean
  recomputations: number
  dependencyRecomputations: number
  summaryRecomputations: number
}

/** 读取一次完整查询结果，并与上一份结果比较引用身份。 */
function readSelectionSnapshot(
  state: RootState,
  label: string,
  previous?: SelectionSnapshot,
): SelectionSnapshot {
  const memoizedItems = selectVisibleItems(state)
  const plainItems = selectVisibleItemsWithoutMemoization(state)
  const summary = selectVisibleSummary(state)

  return {
    label,
    state,
    memoizedItems,
    plainItems,
    summary,
    memoizedReferenceStable: previous ? previous.memoizedItems === memoizedItems : undefined,
    plainReferenceStable: previous ? previous.plainItems === plainItems : undefined,
    recomputations: selectVisibleItems.recomputations(),
    dependencyRecomputations: selectVisibleItems.dependencyRecomputations(),
    summaryRecomputations: selectVisibleSummary.recomputations(),
  }
}

/** 建立当前挂载实例的初始查询快照。 */
function createInitialSnapshot(store: DemoStore): SelectionSnapshot {
  return readSelectionSnapshot(store.getState(), '初始查询')
}

/** 把引用比较结果转换为容易扫描的中文状态。 */
function formatReferenceStatus(value?: boolean): string {
  if (value === undefined) return '等待下一次更新'
  return value ? '复用同一引用' : '返回新的引用'
}

/** 把分币金额格式化为人民币文本。 */
function formatCurrency(valueCents: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(valueCents / 100)
}

type MetricProps = {
  label: string
  value: string | number
  detail: string
  testId: string
}

/** 展示一项 Selector 诊断指标。 */
function Metric({ label, value, detail, testId }: MetricProps): ReactElement {
  return (
    <div className="create-selector-metric" data-testid={testId}>
      <dt>{label}</dt>
      <dd>{value}</dd>
      <span>{detail}</span>
    </div>
  )
}

/** 运行缓存观察台，并在每次 dispatch 后记录同一组查询证据。 */
function CreateSelectorDemo(): ReactElement {
  const [store] = useState(createDemoStore)
  const [snapshot, setSnapshot] = useState(() => createInitialSnapshot(store))

  /** 派发一个 action，并比较更新前后的 Selector 结果。 */
  function dispatchAndObserve(action: UnknownAction, label: string): void {
    store.dispatch(action)
    setSnapshot((previous) => readSelectionSnapshot(store.getState(), label, previous))
  }

  /** 只更新无关 activity slice，验证缓存结果可以复用。 */
  function recordUnrelatedRefresh(): void {
    dispatchAndObserve(activitySlice.actions.refreshRecorded(), '无关 activity 更新')
  }

  /** 切换库存筛选条件，验证相关输入会触发重新计算。 */
  function toggleFilter(): void {
    const nextFilter = snapshot.state.inventory.filter === 'all' ? 'low-stock' : 'all'
    dispatchAndObserve(
      inventorySlice.actions.filterChanged(nextFilter),
      nextFilter === 'all' ? '切换为全部商品' : '切换为低库存商品',
    )
  }

  /** 增加鼠标库存，验证商品数组变化会触发重新计算。 */
  function restockMouse(): void {
    dispatchAndObserve(
      inventorySlice.actions.stockReceived({ id: 'mouse', amount: 1 }),
      '无线鼠标入库 1 件',
    )
  }

  /** 恢复 Redux state 与诊断计数，重新建立可重复的初始观察点。 */
  function resetDemo(): void {
    selectVisibleItems.resetRecomputations()
    selectVisibleItems.resetDependencyRecomputations()
    selectVisibleSummary.resetRecomputations()
    store.dispatch(inventorySlice.actions.inventoryReset())
    store.dispatch(activitySlice.actions.activityReset())
    setSnapshot((previous) => readSelectionSnapshot(store.getState(), '已重置演示', previous))
  }

  const currentFilter = snapshot.state.inventory.filter

  return (
    <section className="create-selector-demo" data-testid="create-selector-demo">
      <header className="create-selector-header">
        <div>
          <p>Reselect diagnostics</p>
          <h2>createSelector 缓存观察台</h2>
          <span>对比无关状态更新与相关输入变化后的计算次数和结果引用。</span>
        </div>
        <strong data-testid="create-selector-last-action">{snapshot.label}</strong>
      </header>

      <div className="create-selector-controls" aria-label="缓存观察操作">
        <button
          type="button"
          data-testid="create-selector-unrelated"
          onClick={recordUnrelatedRefresh}
        >
          更新无关状态
        </button>
        <button type="button" data-testid="create-selector-filter" onClick={toggleFilter}>
          {currentFilter === 'all' ? '只看低库存' : '显示全部商品'}
        </button>
        <button type="button" data-testid="create-selector-restock" onClick={restockMouse}>
          无线鼠标入库
        </button>
        <button type="button" data-testid="create-selector-reset" onClick={resetDemo}>
          重置演示
        </button>
      </div>

      <dl className="create-selector-metrics">
        <Metric
          label="结果函数计算"
          value={snapshot.recomputations}
          detail="selectVisibleItems.recomputations()"
          testId="create-selector-recomputations"
        />
        <Metric
          label="输入依赖检查"
          value={snapshot.dependencyRecomputations}
          detail="dependencyRecomputations()"
          testId="create-selector-dependency-recomputations"
        />
        <Metric
          label="组合汇总计算"
          value={snapshot.summaryRecomputations}
          detail="selectVisibleSummary.recomputations()"
          testId="create-selector-summary-recomputations"
        />
      </dl>

      <div className="create-selector-comparison" aria-live="polite">
        <div>
          <span>缓存 Selector</span>
          <strong data-testid="create-selector-memo-reference">
            {formatReferenceStatus(snapshot.memoizedReferenceStable)}
          </strong>
        </div>
        <div>
          <span>普通 Selector 对照</span>
          <strong data-testid="create-selector-plain-reference">
            {formatReferenceStatus(snapshot.plainReferenceStable)}
          </strong>
        </div>
        <div>
          <span>无关 activity 次数</span>
          <strong data-testid="create-selector-activity-count">
            {snapshot.state.activity.refreshCount}
          </strong>
        </div>
      </div>

      <div className="create-selector-results">
        <div className="create-selector-result-heading">
          <div>
            <span>当前结果</span>
            <h3>{currentFilter === 'all' ? '全部商品' : '低库存商品'}</h3>
          </div>
          <output data-testid="create-selector-visible-count">
            {snapshot.summary.itemCount} 项
          </output>
        </div>

        <ul data-testid="create-selector-visible-items">
          {snapshot.memoizedItems.map((item) => (
            <li key={item.id}>
              <span>{item.name}</span>
              <strong>{item.stock} 件</strong>
            </li>
          ))}
        </ul>

        <dl className="create-selector-summary">
          <div>
            <dt>可见库存件数</dt>
            <dd>{snapshot.summary.totalUnits}</dd>
          </div>
          <div>
            <dt>可见库存金额</dt>
            <dd>{formatCurrency(snapshot.summary.inventoryValueCents)}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主注册 createSelector 缓存观察台。 */
export function createCreateSelectorDemo(): ComponentType {
  return CreateSelectorDemo
}
