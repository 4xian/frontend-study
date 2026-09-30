import { create } from 'zustand'
import {
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector,
  type StateStorage,
} from 'zustand/middleware'
import { type ComponentType, useEffect, useState, useSyncExternalStore } from 'react'

import './middleware-composition-demo.css'

const STORAGE_KEY = 'react-zustand-middleware-composition-demo'

const storageListeners = new Set<() => void>()

/** 通知存储面板重新读取当前存储项。 */
function emitStorageChange() {
  storageListeners.forEach((listener) => listener())
}

/** 订阅当前页面内的存储写入和删除。 */
function subscribeStorage(onStoreChange: () => void) {
  storageListeners.add(onStoreChange)
  return () => {
    storageListeners.delete(onStoreChange)
  }
}

const pageStorage: StateStorage = {
  /** 读取当前存储项。 */
  getItem: (name) => localStorage.getItem(name),
  /** 写入存储项，并通知存储面板。 */
  setItem: (name, value) => {
    localStorage.setItem(name, value)
    emitStorageChange()
  },
  /** 删除存储项，并通知存储面板。 */
  removeItem: (name) => {
    localStorage.removeItem(name)
    emitStorageChange()
  },
}

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
  const win = window as Window & {
    __REDUX_DEVTOOLS_EXTENSION__?: DemoDevtoolsConnector
  }
  const previous = win.__REDUX_DEVTOOLS_EXTENSION__
  win.__REDUX_DEVTOOLS_EXTENSION__ = {
    /** 建立演示连接，并在存在真实扩展时转发。 */
    connect: (options) => {
      const real = previous?.connect(options)
      return {
        /** 转发初始化状态。 */
        init(state) {
          real?.init(state)
        },
        /** 记录 action 名称，并转发给真实扩展。 */
        send(action, state) {
          real?.send(action, state)
          if (action && typeof action === 'object' && 'type' in action) {
            actionTypes.push(String((action as DevtoolsAction).type))
            emitLogChange()
          }
        },
        /** 转发扩展订阅。 */
        subscribe(fn) {
          return real?.subscribe(fn) ?? (() => {})
        },
        /** 转发断开连接。 */
        unsubscribe() {
          real?.unsubscribe?.()
        },
      }
    },
  }
}

installDemoDevtools()

type PreferenceStore = {
  theme: string
  draft: number
  ticks: number
  toggleTheme: () => void
  bumpDraft: () => void
  tick: () => void
}

const usePreferenceStore = create<PreferenceStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          theme: '浅色',
          draft: 0,
          ticks: 0,
          /** 切换主题，写入存储，并在时间线上记为 preference/toggleTheme。 */
          toggleTheme: () =>
            set(
              { theme: get().theme === '浅色' ? '深色' : '浅色' },
              undefined,
              'preference/toggleTheme',
            ),
          /** 增加只留在内存里的草稿计数。 */
          bumpDraft: () => set({ draft: get().draft + 1 }, undefined, 'preference/bumpDraft'),
          /** 增加与偏好无关的计数。 */
          tick: () => set({ ticks: get().ticks + 1 }, undefined, 'preference/tick'),
        }),
        {
          name: STORAGE_KEY,
          storage: createJSONStorage(() => pageStorage),
          partialize: (state) => ({ theme: state.theme }),
        },
      ),
    ),
    {
      name: 'PreferenceStore',
      anonymousActionType: 'anonymous',
      enabled: true,
    },
  ),
)

/** 读取当前存储项的原始字符串。 */
function readStorageRaw(): string {
  return localStorage.getItem(STORAGE_KEY) ?? ''
}

/** 展示 partialize 之后写入存储的 JSON，只保留主题。 */
function StoragePane() {
  const raw = useSyncExternalStore(subscribeStorage, readStorageRaw, () => '')

  return (
    <section className="middleware-pane" data-testid="storage-pane">
      <h3>存储 JSON</h3>
      <pre data-testid="composed-storage">{raw || '空'}</pre>
    </section>
  )
}

/** 只订阅主题切片，草稿和无关计数变化时不追加。 */
function ThemeSelectorLog() {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    return usePreferenceStore.subscribe(
      (state) => state.theme,
      (theme, previousTheme) => {
        setLines((current) => [...current, `${previousTheme}→${theme}`])
      },
    )
  }, [])

  return (
    <section className="middleware-pane" data-testid="theme-log-pane">
      <h3>主题选择</h3>
      <p className="middleware-count">
        通知 <strong data-testid="theme-log-count">{lines.length}</strong>
      </p>
      <pre data-testid="theme-log">{lines.join('\n') || '空'}</pre>
    </section>
  )
}

/** 展示已经 send 到演示连接的 action 类型。 */
function ActionLogPane() {
  const log = useSyncExternalStore(subscribeLog, readActionLog, () => '')

  return (
    <section className="middleware-pane" data-testid="action-log-pane">
      <h3>时间线名称</h3>
      <pre data-testid="action-log">{log || '空'}</pre>
    </section>
  )
}

/** 对照三个中间件叠在同一份 Store 上：存储只留主题，切片订阅过滤无关写入，set 第三参数进入时间线。 */
function MiddlewareCompositionDemo() {
  const theme = usePreferenceStore((state) => state.theme)
  const draft = usePreferenceStore((state) => state.draft)
  const ticks = usePreferenceStore((state) => state.ticks)
  const hydrated = usePreferenceStore.persist.hasHydrated()

  return (
    <section className="middleware-demo" data-testid="middleware-composition-demo">
      <header className="middleware-heading">
        <p>Zustand 中间件组合</p>
        <h2>devtools 包住 subscribeWithSelector，再包住 persist</h2>
        <span>
          切换主题后，存储 JSON 只留下主题，主题日志追加一条，时间线出现
          preference/toggleTheme。增加草稿或无关计数时，存储和主题日志都不动。
        </span>
      </header>

      <p className="middleware-status">
        主题 <strong data-testid="composed-theme">{theme}</strong>
        草稿 <strong data-testid="composed-draft">{draft}</strong>
        无关计数 <strong data-testid="composed-ticks">{ticks}</strong>
        已水合 <strong data-testid="composed-hydrated">{hydrated ? '是' : '否'}</strong>
      </p>

      <div className="middleware-panes">
        <StoragePane />
        <ThemeSelectorLog />
        <ActionLogPane />
      </div>

      <div className="middleware-actions">
        <button
          type="button"
          data-testid="toggle-theme"
          onClick={() => usePreferenceStore.getState().toggleTheme()}
        >
          切换主题
        </button>
        <button
          type="button"
          data-testid="bump-draft"
          onClick={() => usePreferenceStore.getState().bumpDraft()}
        >
          增加草稿
        </button>
        <button
          type="button"
          data-testid="bump-ticks"
          onClick={() => usePreferenceStore.getState().tick()}
        >
          增加无关计数
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供中间件组合观察组件。 */
export function createMiddlewareCompositionDemo(): ComponentType {
  return MiddlewareCompositionDemo
}
