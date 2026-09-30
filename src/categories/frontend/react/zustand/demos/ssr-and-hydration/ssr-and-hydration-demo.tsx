import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { type ComponentType, useSyncExternalStore } from 'react'

import './ssr-and-hydration-demo.css'

const AUTO_KEY = 'react-zustand-ssr-and-hydration-auto'
const SKIP_KEY = 'react-zustand-ssr-and-hydration-skip'
const MANUAL_KEY = 'react-zustand-ssr-and-hydration-manual'

const STORED_THEME = JSON.stringify({
  state: { theme: '深色' },
  version: 0,
})

type ThemeStore = {
  theme: string
}

type PersistApi = {
  persist: {
    rehydrate: () => Promise<void> | void
    hasHydrated: () => boolean
    onHydrate: (listener: (state: ThemeStore) => void) => () => void
    onFinishHydration: (listener: (state: ThemeStore) => void) => () => void
  }
}

const storageListeners = new Set<() => void>()

/** 通知水合标记重新读取。 */
function emitHydrationChange() {
  storageListeners.forEach((listener) => listener())
}

/** 订阅水合完成和开始。 */
function subscribeHydration(onStoreChange: () => void) {
  storageListeners.add(onStoreChange)
  return () => {
    storageListeners.delete(onStoreChange)
  }
}

const pageStorage: StateStorage = {
  /** 读取当前存储项。 */
  getItem: (name) => localStorage.getItem(name),
  /** 写入存储项。 */
  setItem: (name, value) => {
    localStorage.setItem(name, value)
  },
  /** 删除存储项。 */
  removeItem: (name) => {
    localStorage.removeItem(name)
  },
}

localStorage.setItem(AUTO_KEY, STORED_THEME)
localStorage.setItem(SKIP_KEY, STORED_THEME)
localStorage.setItem(MANUAL_KEY, STORED_THEME)

const useAutoStore = create<ThemeStore>()(
  persist(() => ({ theme: '浅色' }), {
    name: AUTO_KEY,
    storage: createJSONStorage(() => pageStorage),
    partialize: (state) => ({ theme: state.theme }),
  }),
)

const useSkipStore = create<ThemeStore>()(
  persist(() => ({ theme: '浅色' }), {
    name: SKIP_KEY,
    skipHydration: true,
    storage: createJSONStorage(() => pageStorage),
    partialize: (state) => ({ theme: state.theme }),
  }),
)

const useManualStore = create<ThemeStore>()(
  persist(() => ({ theme: '浅色' }), {
    name: MANUAL_KEY,
    skipHydration: true,
    storage: createJSONStorage(() => pageStorage),
    partialize: (state) => ({ theme: state.theme }),
  }),
)

/** 读取 persist 是否已经水合完成。 */
function useHasHydrated(store: PersistApi) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const unsubscribeHydrate = store.persist.onHydrate(() => {
        emitHydrationChange()
        onStoreChange()
      })
      const unsubscribeFinish = store.persist.onFinishHydration(() => {
        emitHydrationChange()
        onStoreChange()
      })
      const unsubscribeStorage = subscribeHydration(onStoreChange)
      return () => {
        unsubscribeHydrate()
        unsubscribeFinish()
        unsubscribeStorage()
      }
    },
    () => store.persist.hasHydrated(),
    () => false,
  )
}

/** 把布尔水合标记写成是或否。 */
function formatHydrated(hydrated: boolean) {
  return hydrated ? '是' : '否'
}

/** 展示创建时立刻水合，第一帧已经是存储值。 */
function AutoPane() {
  const theme = useAutoStore((state) => state.theme)
  const hydrated = useHasHydrated(useAutoStore)

  return (
    <section className="ssr-hydration-pane" data-testid="auto-pane">
      <h3>立即水合</h3>
      <p>
        主题 <strong data-testid="auto-theme">{theme}</strong>
      </p>
      <p>
        已水合 <strong data-testid="auto-hydrated">{formatHydrated(hydrated)}</strong>
      </p>
    </section>
  )
}

/** 展示跳过水合后仍停留在初始浅色。 */
function SkipPane() {
  const theme = useSkipStore((state) => state.theme)
  const hydrated = useHasHydrated(useSkipStore)

  return (
    <section className="ssr-hydration-pane" data-testid="skip-pane">
      <h3>跳过水合</h3>
      <p>
        主题 <strong data-testid="skip-theme">{theme}</strong>
      </p>
      <p>
        已水合 <strong data-testid="skip-hydrated">{formatHydrated(hydrated)}</strong>
      </p>
    </section>
  )
}

/** 展示挂载后再调用 rehydrate 才会读到存储。 */
function ManualPane() {
  const theme = useManualStore((state) => state.theme)
  const hydrated = useHasHydrated(useManualStore)

  return (
    <section className="ssr-hydration-pane" data-testid="manual-pane">
      <h3>挂载后水合</h3>
      <p>
        主题 <strong data-testid="manual-theme">{theme}</strong>
      </p>
      <p>
        已水合 <strong data-testid="manual-hydrated">{formatHydrated(hydrated)}</strong>
      </p>
      <button
        type="button"
        data-testid="manual-rehydrate"
        onClick={() => {
          void useManualStore.persist.rehydrate()
        }}
      >
        挂载后水合
      </button>
    </section>
  )
}

/** 对照立即水合、跳过水合和挂载后水合。 */
function SsrAndHydrationDemo() {
  return (
    <section className="ssr-hydration-demo" data-testid="ssr-and-hydration-demo">
      <header className="ssr-hydration-heading">
        <p>Zustand persist skipHydration</p>
        <h2>首屏先用初始值，挂载后再读存储</h2>
        <span>
          三份存储里都是深色。左侧创建时立刻水合。中间跳过水合，主题仍是浅色。右侧点挂载后水合才变成深色。
        </span>
      </header>

      <div className="ssr-hydration-panes">
        <AutoPane />
        <SkipPane />
        <ManualPane />
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 SSR 与 Hydration 观察组件。 */
export function createSsrAndHydrationDemo(): ComponentType {
  return SsrAndHydrationDemo
}
