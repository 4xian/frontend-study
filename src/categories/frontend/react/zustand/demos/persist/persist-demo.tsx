import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { type ComponentType, useRef, useSyncExternalStore } from 'react'

import './persist-demo.css'

const STORAGE_KEY = 'react-zustand-persist-demo'

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

const memoryStorage: StateStorage = {
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => {
    if (localStorage.getItem(name) === value) {
      return
    }
    localStorage.setItem(name, value)
    emitStorageChange()
  },
  removeItem: (name) => {
    localStorage.removeItem(name)
    emitStorageChange()
  },
}

type PreferenceState = {
  theme: string
  draft: number
  ticks: number
}

type PreferenceActions = {
  toggleTheme: () => void
  bumpDraft: () => void
  tick: () => void
  clearSaved: () => void
}

type PreferenceStore = PreferenceState & PreferenceActions

const usePreferenceStore = create<PreferenceStore>()(
  persist(
    (set, get) => ({
      theme: '浅色',
      draft: 0,
      ticks: 0,
      /** 在浅色和深色之间切换主题。 */
      toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
      /** 增加只留在内存里的草稿计数。 */
      bumpDraft: () => set({ draft: get().draft + 1 }),
      /** 增加与偏好无关的计数。 */
      tick: () => set({ ticks: get().ticks + 1 }),
      /** 只删除存储项，不改当前内存里的主题。 */
      clearSaved: () => {
        usePreferenceStore.persist.clearStorage()
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => memoryStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)

/** 读取当前存储项的原始字符串。 */
function readStorageRaw(): string {
  return localStorage.getItem(STORAGE_KEY) ?? ''
}

/** 只选择主题。 */
function ThemeSubscriber() {
  const theme = usePreferenceStore((state) => state.theme)
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="persist-panel" data-testid="theme-subscriber">
      <span>主题</span>
      <strong data-testid="persist-theme">{theme}</strong>
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
    <article className="persist-panel" data-testid="draft-subscriber">
      <span>草稿</span>
      <strong data-testid="persist-draft">{draft}</strong>
      <p>
        渲染次数 <b data-testid="draft-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 展示 partialize 之后写入存储的 JSON。 */
function StorageSubscriber() {
  const theme = usePreferenceStore((state) => state.theme)
  const raw = useSyncExternalStore(subscribeStorage, readStorageRaw, () => '')
  const renderCount = useRef(0)
  renderCount.current += 1

  return (
    <article className="persist-panel persist-storage-panel" data-testid="storage-subscriber">
      <span>存储 JSON</span>
      <strong data-testid="persist-storage-theme">{theme}</strong>
      <pre data-testid="persist-storage">{raw || '空'}</pre>
      <p>
        渲染次数 <b data-testid="storage-render-count">{renderCount.current}</b>
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

/** 只选择清空存储 Action。 */
function ClearStorageButton() {
  const clearSaved = usePreferenceStore((state) => state.clearSaved)

  return (
    <button type="button" onClick={clearSaved}>
      清空存储
    </button>
  )
}

/** 只选择无关计数，避免父组件订阅 ticks 后带动子面板重渲染。 */
function TicksDisplay() {
  const ticks = usePreferenceStore((state) => state.ticks)

  return (
    <p className="persist-ticks" aria-live="polite">
      无关计数 <strong data-testid="persist-ticks">{ticks}</strong>
    </p>
  )
}

/** 展示主题写入存储、草稿留在内存，以及清空存储不重置界面。 */
function PersistDemo() {
  const tick = usePreferenceStore((state) => state.tick)

  return (
    <section className="persist-demo" data-testid="persist-demo">
      <header className="persist-heading">
        <p>Zustand persist</p>
        <h2>主题写入存储，草稿只留在内存</h2>
        <span>
          切换主题后刷新，主题还在；增加草稿后刷新，草稿回到 0。清空存储不会立刻改界面上的主题。
        </span>
      </header>

      <TicksDisplay />

      <div className="persist-panels">
        <ThemeSubscriber />
        <DraftSubscriber />
        <StorageSubscriber />
      </div>

      <div className="persist-actions">
        <ThemeButton />
        <DraftButton />
        <ClearStorageButton />
        <button type="button" onClick={tick}>
          增加无关计数
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供 persist 观察组件。 */
export function createPersistDemo(): ComponentType {
  return PersistDemo
}
