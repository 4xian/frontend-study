import { configureStore, createSlice } from '@reduxjs/toolkit'
import { useState, type ComponentType, type ReactElement } from 'react'
import { Provider, useSelector } from 'react-redux'

import './use-selector-demo.css'

type DemoState = {
  counter: number
  theme: 'light' | 'dark'
  notifications: number
}

const initialDemoState: DemoState = { counter: 0, theme: 'light', notifications: 0 }

const demoSlice = createSlice({
  name: 'selectorDemo',
  initialState: initialDemoState,
  reducers: {
    counterIncremented: (state) => {
      state.counter += 1
    },
    themeToggled: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    notificationAdded: (state) => {
      state.notifications += 1
    },
  },
})

/** 为 useSelector Demo 创建稳定的 Redux store。 */
function createDemoStore() {
  return configureStore({ reducer: demoSlice.reducer })
}

type DemoStore = ReturnType<typeof createDemoStore>
type RootState = ReturnType<DemoStore['getState']>

/** 选择计数器原始值。 */
const selectCounter = (state: RootState) => state.counter

/** 选择当前主题原始值。 */
const selectTheme = (state: RootState) => state.theme

/** 选择通知数量原始值。 */
const selectNotifications = (state: RootState) => state.notifications

type ReaderProps = {
  label: string
  value: string | number
  selector: string
  testId: string
}

/** 显示一个 selector 读者的路径与当前结果。 */
function ReaderCard({ label, value, selector, testId }: ReaderProps): ReactElement {
  return (
    <article className="use-selector-reader" data-testid={testId}>
      <div className="use-selector-reader-heading">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <code>{selector}</code>
    </article>
  )
}

/** 只订阅 counter 的读者。 */
function CounterReader(): ReactElement {
  const counter = useSelector(selectCounter)
  return (
    <ReaderCard
      label="counter"
      value={counter}
      selector="state.counter"
      testId="use-selector-counter-reader"
    />
  )
}

/** 只订阅 theme 的读者。 */
function ThemeReader(): ReactElement {
  const theme = useSelector(selectTheme)
  return (
    <ReaderCard
      label="theme"
      value={theme}
      selector="state.theme"
      testId="use-selector-theme-reader"
    />
  )
}

/** 只订阅 notifications 的读者。 */
function NotificationReader(): ReactElement {
  const notifications = useSelector(selectNotifications)
  return (
    <ReaderCard
      label="notifications"
      value={notifications}
      selector="state.notifications"
      testId="use-selector-notification-reader"
    />
  )
}

type SelectorControlsProps = {
  store: DemoStore
}

/** 通过已有 store dispatch 触发不同字段变化，保持 Demo 聚焦读取行为。 */
function SelectorControls({ store }: SelectorControlsProps): ReactElement {
  /** Dispatch 一个只改变 counter 的 action。 */
  function incrementCounter(): void {
    store.dispatch(demoSlice.actions.counterIncremented())
  }

  /** Dispatch 一个只改变 theme 的 action。 */
  function toggleTheme(): void {
    store.dispatch(demoSlice.actions.themeToggled())
  }

  /** Dispatch 一个只改变 notifications 的 action。 */
  function addNotification(): void {
    store.dispatch(demoSlice.actions.notificationAdded())
  }

  /** Dispatch 一个未知 action，验证状态引用不发生变化。 */
  function dispatchNoop(): void {
    store.dispatch({ type: 'selectorDemo/noop' })
  }

  return (
    <div className="use-selector-controls">
      <button type="button" data-testid="use-selector-increment" onClick={incrementCounter}>
        增加 counter
      </button>
      <button type="button" data-testid="use-selector-toggle-theme" onClick={toggleTheme}>
        切换 theme
      </button>
      <button type="button" data-testid="use-selector-add-notification" onClick={addNotification}>
        增加通知
      </button>
      <button type="button" data-testid="use-selector-noop" onClick={dispatchNoop}>
        空操作
      </button>
    </div>
  )
}

/** 展示多个 useSelector 读者各自返回的当前值。 */
function SelectorDemo({ store }: SelectorControlsProps): ReactElement {
  return (
    <section className="use-selector-demo" data-testid="use-selector-demo">
      <header className="use-selector-heading">
        <p>React Redux Hooks</p>
        <h2>useSelector 选择结果观察器</h2>
        <span>每个读者用一个命名 selector 读取 Provider 中同一份 store。</span>
      </header>

      <SelectorControls store={store} />

      <div className="use-selector-readers">
        <CounterReader />
        <ThemeReader />
        <NotificationReader />
      </div>

      <p className="use-selector-note">点击按钮后，检查对应 selector 返回的值是否随 store 更新。</p>
    </section>
  )
}

/** 为 React Demo 宿主提供独立 store 和 Provider 作用域。 */
function SelectorDemoRoot(): ReactElement {
  const [store] = useState(createDemoStore)
  return (
    <Provider store={store}>
      <SelectorDemo store={store} />
    </Provider>
  )
}

/** 为 React Demo 注册 useSelector 观察组件。 */
export function createUseSelectorDemo(): ComponentType {
  return SelectorDemoRoot
}
