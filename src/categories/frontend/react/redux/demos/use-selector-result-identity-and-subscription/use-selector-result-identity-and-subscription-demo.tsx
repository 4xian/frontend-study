import { configureStore, createSlice, type UnknownAction } from '@reduxjs/toolkit'
import { memo, type ReactElement, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Provider, shallowEqual, useSelector } from 'react-redux'
import './use-selector-result-identity-and-subscription-demo.css'

type Theme = 'light' | 'dark'
type Density = 'comfortable' | 'compact'

type Preferences = {
  theme: Theme
  density: Density
}

type DemoState = {
  preferences: Preferences
  activity: {
    refreshCount: number
  }
}

/** 创建一份引用彼此独立的确定初始状态。 */
function createInitialState(): DemoState {
  return {
    preferences: {
      theme: 'light',
      density: 'comfortable',
    },
    activity: {
      refreshCount: 0,
    },
  }
}

const workspaceSlice = createSlice({
  name: 'subscriptionWorkspace',
  initialState: createInitialState(),
  reducers: {
    /** 只记录一次与偏好设置无关的活动。 */
    activityRecorded: (state) => {
      state.activity.refreshCount += 1
    },
    /** 复制偏好对象，但保持其中字段值不变。 */
    preferencesCloned: (state) => {
      state.preferences = { ...state.preferences }
    },
    /** 只切换主题字段。 */
    themeToggled: (state) => {
      state.preferences.theme = state.preferences.theme === 'light' ? 'dark' : 'light'
    },
    /** 在同一个 action 中同时切换主题和密度。 */
    appearanceUpdated: (state) => {
      state.preferences.theme = state.preferences.theme === 'light' ? 'dark' : 'light'
      state.preferences.density =
        state.preferences.density === 'comfortable' ? 'compact' : 'comfortable'
    },
    /** 把演示恢复到确定的初始状态。 */
    demoReset: () => createInitialState(),
  },
})

/** 为当前 Demo 实例创建独立 store。 */
function createDemoStore() {
  return configureStore({ reducer: workspaceSlice.reducer })
}

type DemoStore = ReturnType<typeof createDemoStore>
type RootState = ReturnType<DemoStore['getState']>

type RuntimeStats = {
  directSelectorRuns: number
  shallowSelectorRuns: number
  splitThemeSelectorRuns: number
  splitDensitySelectorRuns: number
  directCommits: number
  shallowCommits: number
  splitCommits: number
}

type SelectorHarness = {
  selectPreferences: (state: RootState) => Preferences
  selectPreferenceFields: (state: RootState) => Preferences
  selectTheme: (state: RootState) => Theme
  selectDensity: (state: RootState) => Density
}

type DemoHarness = {
  store: DemoStore
  stats: RuntimeStats
  selectors: SelectorHarness
  recordDirectCommit: () => void
  recordShallowCommit: () => void
  recordSplitCommit: () => void
}

/** 创建清零后的运行统计。 */
function createRuntimeStats(): RuntimeStats {
  return {
    directSelectorRuns: 0,
    shallowSelectorRuns: 0,
    splitThemeSelectorRuns: 0,
    splitDensitySelectorRuns: 0,
    directCommits: 0,
    shallowCommits: 0,
    splitCommits: 0,
  }
}

/** 创建会记录执行次数的四个 Selector。 */
function createSelectorHarness(stats: RuntimeStats): SelectorHarness {
  return {
    selectPreferences: (state) => {
      stats.directSelectorRuns += 1
      return state.preferences
    },
    selectPreferenceFields: (state) => {
      stats.shallowSelectorRuns += 1
      return {
        theme: state.preferences.theme,
        density: state.preferences.density,
      }
    },
    selectTheme: (state) => {
      stats.splitThemeSelectorRuns += 1
      return state.preferences.theme
    },
    selectDensity: (state) => {
      stats.splitDensitySelectorRuns += 1
      return state.preferences.density
    },
  }
}

/** 创建当前挂载实例使用的 store、Selector 与提交统计器。 */
function createDemoHarness(): DemoHarness {
  const stats = createRuntimeStats()

  /** 记录直接对象 Reader 的一次真实提交。 */
  const recordDirectCommit = () => {
    stats.directCommits += 1
  }

  /** 记录浅比较 Reader 的一次真实提交。 */
  const recordShallowCommit = () => {
    stats.shallowCommits += 1
  }

  /** 记录拆分 Reader 的一次真实提交。 */
  const recordSplitCommit = () => {
    stats.splitCommits += 1
  }

  return {
    store: createDemoStore(),
    stats,
    selectors: createSelectorHarness(stats),
    recordDirectCommit,
    recordShallowCommit,
    recordSplitCommit,
  }
}

type ReaderProps = {
  selectors: SelectorHarness
  recordCommit: () => void
}

/** 使用默认引用比较读取整个偏好对象。 */
const DirectObjectReader = memo(function DirectObjectReader({
  selectors,
  recordCommit,
}: ReaderProps): ReactElement {
  const preferences = useSelector(selectors.selectPreferences)

  useLayoutEffect(() => {
    recordCommit()
  })

  return (
    <article className="selector-identity-reader" data-testid="identity-direct-reader">
      <span className="selector-identity-reader-label">默认 ===</span>
      <h3>直接对象</h3>
      <p>选择 state.preferences，结果身份由 Reducer 是否保留对象引用决定。</p>
      <output data-testid="identity-direct-value">
        {preferences.theme} / {preferences.density}
      </output>
    </article>
  )
})

/** 返回新对象，并用 shallowEqual 比较对象的第一层字段。 */
const ShallowObjectReader = memo(function ShallowObjectReader({
  selectors,
  recordCommit,
}: ReaderProps): ReactElement {
  const preferences = useSelector(selectors.selectPreferenceFields, shallowEqual)

  useLayoutEffect(() => {
    recordCommit()
  })

  return (
    <article className="selector-identity-reader" data-testid="identity-shallow-reader">
      <span className="selector-identity-reader-label">shallowEqual</span>
      <h3>浅比较对象</h3>
      <p>Selector 每次创建对象，但字段值相同时复用上一次选择结果。</p>
      <output data-testid="identity-shallow-value">
        {preferences.theme} / {preferences.density}
      </output>
    </article>
  )
})

/** 用两个独立 useSelector 分别读取原始值。 */
const SplitValueReader = memo(function SplitValueReader({
  selectors,
  recordCommit,
}: ReaderProps): ReactElement {
  const theme = useSelector(selectors.selectTheme)
  const density = useSelector(selectors.selectDensity)

  useLayoutEffect(() => {
    recordCommit()
  })

  return (
    <article className="selector-identity-reader" data-testid="identity-split-reader">
      <span className="selector-identity-reader-label">2 个订阅 Hook</span>
      <h3>拆分原始值</h3>
      <p>同一组件分别选择 theme 与 density，由每个结果独立判断变化。</p>
      <output data-testid="identity-split-value">
        {theme} / {density}
      </output>
    </article>
  )
})

type ReaderObserversProps = {
  harness: DemoHarness
}

/** 隔离三个被观察 Reader，避免父面板刷新干扰提交计数。 */
const ReaderObservers = memo(function ReaderObservers({
  harness,
}: ReaderObserversProps): ReactElement {
  return (
    <div className="selector-identity-readers" aria-label="三种 useSelector 策略">
      <DirectObjectReader selectors={harness.selectors} recordCommit={harness.recordDirectCommit} />
      <ShallowObjectReader
        selectors={harness.selectors}
        recordCommit={harness.recordShallowCommit}
      />
      <SplitValueReader selectors={harness.selectors} recordCommit={harness.recordSplitCommit} />
    </div>
  )
})

type StatsSnapshot = {
  directSelectorRuns: number
  shallowSelectorRuns: number
  splitSelectorRuns: number
  directCommits: number
  shallowCommits: number
  splitCommits: number
}

type Observation = StatsSnapshot & {
  label: string
  state: RootState
}

type PendingObservation = {
  label: string
  before: StatsSnapshot
}

/** 读取累计统计，并合并拆分 Reader 的两次 Selector 调用。 */
function readStats(stats: RuntimeStats): StatsSnapshot {
  return {
    directSelectorRuns: stats.directSelectorRuns,
    shallowSelectorRuns: stats.shallowSelectorRuns,
    splitSelectorRuns: stats.splitThemeSelectorRuns + stats.splitDensitySelectorRuns,
    directCommits: stats.directCommits,
    shallowCommits: stats.shallowCommits,
    splitCommits: stats.splitCommits,
  }
}

/** 计算一次 dispatch 前后的 Selector 与 commit 增量。 */
function subtractStats(after: StatsSnapshot, before: StatsSnapshot): StatsSnapshot {
  return {
    directSelectorRuns: after.directSelectorRuns - before.directSelectorRuns,
    shallowSelectorRuns: after.shallowSelectorRuns - before.shallowSelectorRuns,
    splitSelectorRuns: after.splitSelectorRuns - before.splitSelectorRuns,
    directCommits: after.directCommits - before.directCommits,
    shallowCommits: after.shallowCommits - before.shallowCommits,
    splitCommits: after.splitCommits - before.splitCommits,
  }
}

/** 创建尚未派发 action 时的初始观察结果。 */
function createInitialObservation(harness: DemoHarness): Observation {
  return {
    label: '等待选择一个操作',
    state: harness.store.getState(),
    directSelectorRuns: 0,
    shallowSelectorRuns: 0,
    splitSelectorRuns: 0,
    directCommits: 0,
    shallowCommits: 0,
    splitCommits: 0,
  }
}

type StrategyMetricProps = {
  title: string
  comparison: string
  selectorRuns: number
  commits: number
  testIdPrefix: string
}

/** 展示一种选择策略在最近一次 action 后的运行结果。 */
function StrategyMetric({
  title,
  comparison,
  selectorRuns,
  commits,
  testIdPrefix,
}: StrategyMetricProps): ReactElement {
  return (
    <div className="selector-identity-metric">
      <dt>
        <strong>{title}</strong>
        <span>{comparison}</span>
      </dt>
      <dd>
        <span>
          Selector 执行
          <b data-testid={`${testIdPrefix}-selector-runs`}>{selectorRuns}</b>
        </span>
        <span>
          组件 commit
          <b data-testid={`${testIdPrefix}-commits`}>{commits}</b>
        </span>
      </dd>
    </div>
  )
}

/** 运行结果身份与订阅观察台，并在每次 dispatch 后读取真实增量。 */
function UseSelectorResultIdentityDemo(): ReactElement {
  const [harness] = useState(createDemoHarness)
  const [observationVersion, setObservationVersion] = useState(0)
  const [observation, setObservation] = useState(() => createInitialObservation(harness))
  const pendingObservation = useRef<PendingObservation | null>(null)

  /** 等本轮订阅更新完成提交后，再读取提交与 Selector 增量。 */
  useEffect(() => {
    const pending = pendingObservation.current
    if (!pending) return

    const frameId = window.requestAnimationFrame(() => {
      const delta = subtractStats(readStats(harness.stats), pending.before)
      setObservation({
        label: pending.label,
        state: harness.store.getState(),
        ...delta,
      })
      pendingObservation.current = null
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [harness, observationVersion])

  /** 派发 action，并安排在 React 提交后读取本轮统计。 */
  function dispatchAndObserve(action: UnknownAction, label: string): void {
    pendingObservation.current = {
      label,
      before: readStats(harness.stats),
    }
    harness.store.dispatch(action)
    setObservationVersion((version) => version + 1)
  }

  /** 只更新 activity，观察所有 Selector 检查但不提交 Reader。 */
  function recordUnrelatedActivity(): void {
    dispatchAndObserve(workspaceSlice.actions.activityRecorded(), '更新无关 activity')
  }

  /** 只替换偏好对象引用，观察默认引用比较的差异。 */
  function clonePreferences(): void {
    dispatchAndObserve(workspaceSlice.actions.preferencesCloned(), '克隆偏好对象，字段值不变')
  }

  /** 切换主题，观察三种策略都提交更新。 */
  function toggleTheme(): void {
    dispatchAndObserve(workspaceSlice.actions.themeToggled(), '切换 theme')
  }

  /** 在一次 action 中同时修改两个选择结果。 */
  function updateAppearance(): void {
    dispatchAndObserve(
      workspaceSlice.actions.appearanceUpdated(),
      '同一次 action 修改 theme 与 density',
    )
  }

  /** 恢复初始 Redux state，并保留本轮可观察增量。 */
  function resetDemo(): void {
    dispatchAndObserve(workspaceSlice.actions.demoReset(), '恢复初始状态')
  }

  const { preferences, activity } = observation.state

  return (
    <section className="selector-identity-demo" data-testid="use-selector-identity-demo">
      <header className="selector-identity-header">
        <div>
          <p>Subscription observer</p>
          <h2>结果身份与订阅观察台</h2>
          <span>每次 action 后，对照 Selector 执行次数与组件真实 commit。</span>
        </div>
        <output data-testid="identity-last-action">{observation.label}</output>
      </header>

      <div className="selector-identity-controls" aria-label="订阅观察操作">
        <button
          type="button"
          data-testid="identity-unrelated-action"
          onClick={recordUnrelatedActivity}
        >
          更新无关 activity
        </button>
        <button type="button" data-testid="identity-clone-action" onClick={clonePreferences}>
          克隆偏好对象
        </button>
        <button type="button" data-testid="identity-theme-action" onClick={toggleTheme}>
          切换 theme
        </button>
        <button type="button" data-testid="identity-multi-action" onClick={updateAppearance}>
          同时修改两个字段
        </button>
        <button type="button" data-testid="identity-reset-action" onClick={resetDemo}>
          恢复初始状态
        </button>
      </div>

      <div className="selector-identity-state" aria-live="polite">
        <span>
          theme
          <strong data-testid="identity-theme-state">{preferences.theme}</strong>
        </span>
        <span>
          density
          <strong data-testid="identity-density-state">{preferences.density}</strong>
        </span>
        <span>
          activity
          <strong data-testid="identity-activity-state">{activity.refreshCount}</strong>
        </span>
      </div>

      <Provider store={harness.store}>
        <ReaderObservers harness={harness} />
      </Provider>

      <section className="selector-identity-results" aria-labelledby="identity-result-title">
        <div className="selector-identity-results-heading">
          <div>
            <span>最近一次 action</span>
            <h3 id="identity-result-title">检查与提交增量</h3>
          </div>
          <p>执行不等于 commit；结果比较决定订阅是否推动组件更新。</p>
        </div>
        <dl className="selector-identity-metrics" aria-live="polite">
          <StrategyMetric
            title="直接对象"
            comparison="默认 ==="
            selectorRuns={observation.directSelectorRuns}
            commits={observation.directCommits}
            testIdPrefix="identity-direct"
          />
          <StrategyMetric
            title="浅比较对象"
            comparison="shallowEqual"
            selectorRuns={observation.shallowSelectorRuns}
            commits={observation.shallowCommits}
            testIdPrefix="identity-shallow"
          />
          <StrategyMetric
            title="拆分原始值"
            comparison="两个 useSelector"
            selectorRuns={observation.splitSelectorRuns}
            commits={observation.splitCommits}
            testIdPrefix="identity-split"
          />
        </dl>
      </section>
    </section>
  )
}

/** 向 Vue 中的 React Demo 宿主提供可挂载组件。 */
export function createUseSelectorResultIdentityDemo() {
  return UseSelectorResultIdentityDemo
}
