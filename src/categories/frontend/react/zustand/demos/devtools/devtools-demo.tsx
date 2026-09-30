import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { type ComponentType, useRef, useSyncExternalStore } from 'react'

import './devtools-demo.css'

type DevtoolsAction = {
  type: string
}

const actionTypes: string[] = []
const logListeners = new Set<() => void>()

/** 通知时间线面板重新读取已记录的 action 名称。 */
function emitLogChange() {
  logListeners.forEach((listener) => listener())
}

/** 订阅当前页面内的 DevTools send 记录。 */
function subscribeLog(onStoreChange: () => void) {
  logListeners.add(onStoreChange)
  return () => {
    logListeners.delete(onStoreChange)
  }
}

/** 读取已记录的 action 类型列表。 */
function readActionLog(): string {
  return actionTypes.join('\n')
}

type DemoDevtoolsConnector = {
  connect: (options: unknown) => {
    init: (state: unknown) => void
    send: (action: unknown, state: unknown) => void
    subscribe: (fn: (message: unknown) => void) => () => void
    unsubscribe?: () => void
  }
}

/** 安装演示连接：记录 send 的 type，并在存在真实扩展时转发出去。 */
function installDemoDevtools() {
  if (typeof window === 'undefined') {
    return
  }
  const win = window as Window & {
    __REDUX_DEVTOOLS_EXTENSION__?: DemoDevtoolsConnector
  }
  const previous = win.__REDUX_DEVTOOLS_EXTENSION__
  win.__REDUX_DEVTOOLS_EXTENSION__ = {
    connect: (options) => {
      const real = previous?.connect(options)
      return {
        init(state) {
          real?.init(state)
        },
        send(action, state) {
          real?.send(action, state)
          if (action && typeof action === 'object' && 'type' in action) {
            actionTypes.push(String((action as DevtoolsAction).type))
            emitLogChange()
          }
        },
        subscribe(fn) {
          return real?.subscribe(fn) ?? (() => {})
        },
        unsubscribe() {
          real?.unsubscribe?.()
        },
      }
    },
  }
}

installDemoDevtools()

type PreferenceState = {
  theme: string
  draft: number
  ticks: number
}

type PreferenceActions = {
  toggleTheme: () => void
  bumpDraft: () => void
  tick: () => void
}

type PreferenceStore = PreferenceState & PreferenceActions

const usePreferenceStore = create<PreferenceStore>()(
  devtools(
    (set, get) => ({
      theme: '浅色',
      draft: 0,
      ticks: 0,
      /** 切换主题，并在时间线上记为 preference/toggleTheme。 */
      toggleTheme: () =>
        set(
          { theme: get().theme === '浅色' ? '深色' : '浅色' },
          undefined,
          'preference/toggleTheme',
        ),
      /** 增加草稿，不传第三参数，时间线记为 anonymous。 */
      bumpDraft: () => set({ draft: get().draft + 1 }),
      /** 增加与偏好无关的计数。 */
      tick: () => set({ ticks: get().ticks + 1 }, undefined, 'preference/tick'),
    }),
    {
      name: 'PreferenceStore',
      anonymousActionType: 'anonymous',
    },
  ),
)

/** 只选择主题。 */
function ThemeSubscriber() {
  const theme = usePreferenceStore((state) => state.theme)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="devtools-panel" data-testid="theme-subscriber">
      <span>主题</span>
      <strong data-testid="devtools-theme">{theme}</strong>
      <p>
        渲染次数 <b data-testid="theme-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择草稿计数。 */
function DraftSubscriber() {
  const draft = usePreferenceStore((state) => state.draft)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="devtools-panel" data-testid="draft-subscriber">
      <span>草稿</span>
      <strong data-testid="devtools-draft">{draft}</strong>
      <p>
        渲染次数 <b data-testid="draft-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 展示已经 send 到演示连接的 action 类型。 */
function ActionLogSubscriber() {
  const log = useSyncExternalStore(subscribeLog, readActionLog, () => '')
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="devtools-panel devtools-log-panel" data-testid="log-subscriber">
      <span>时间线</span>
      <strong data-testid="devtools-last-action">{actionTypes.at(-1) || '无'}</strong>
      <pre data-testid="devtools-log">{log || '空'}</pre>
      <p>
        渲染次数 <b data-testid="log-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 只选择切换主题 Action。 */
function ThemeButton() {
  const toggleTheme = usePreferenceStore((state) => state.toggleTheme)

  return (
    <button type="button" onClick={toggleTheme}>
      切换主题
    </button>
  )
}

/** 只选择增加草稿 Action。 */
function DraftButton() {
  const bumpDraft = usePreferenceStore((state) => state.bumpDraft)

  return (
    <button type="button" onClick={bumpDraft}>
      增加草稿
    </button>
  )
}

/** 只选择无关计数，避免父组件订阅 ticks 后带动子面板重渲染。 */
function TicksDisplay() {
  const ticks = usePreferenceStore((state) => state.ticks)

  return (
    <p className="devtools-ticks" aria-live="polite">
      无关计数 <strong data-testid="devtools-ticks">{ticks}</strong>
    </p>
  )
}

/** 展示命名写入进入时间线、未命名写入记为 anonymous。 */
function DevtoolsDemo() {
  const tick = usePreferenceStore((state) => state.tick)

  return (
    <section className="devtools-demo" data-testid="devtools-demo">
      <header className="devtools-heading">
        <p>Zustand devtools</p>
        <h2>给 set 命名，未命名则记为 anonymous</h2>
        <span>切换主题会送出 preference/toggleTheme；增加草稿没有第三参数，送出 anonymous。</span>
      </header>

      <TicksDisplay />

      <div className="devtools-panels">
        <ThemeSubscriber />
        <DraftSubscriber />
        <ActionLogSubscriber />
      </div>

      <div className="devtools-actions">
        <ThemeButton />
        <DraftButton />
        <button type="button" onClick={tick}>
          增加无关计数
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 DevTools 观察组件。 */
export function createDevtoolsDemo(): ComponentType {
  return DevtoolsDemo
}
