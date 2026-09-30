import { create, type StateCreator } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { type ComponentType, useRef, useState, useSyncExternalStore } from 'react'

import './preferences-center-demo.css'

const STORAGE_KEY = 'react-zustand-preferences-center-demo'

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

type ThemeSlice = {
  theme: string
  toggleTheme: () => void
}

type DraftSlice = {
  draft: number
  bumpDraft: () => void
}

type SharedSlice = {
  resetPreferences: () => void
  clearSaved: () => void
  tick: () => void
  ticks: number
}

type BoundStore = ThemeSlice & DraftSlice & SharedSlice

type PersistMutators = [['zustand/persist', unknown]]

const initialTheme = '浅色'
const initialDraft = 0

const createThemeSlice: StateCreator<BoundStore, PersistMutators, [], ThemeSlice> = (set, get) => ({
  theme: initialTheme,
  /** 只更新主题片段。 */
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
})

const createDraftSlice: StateCreator<BoundStore, PersistMutators, [], DraftSlice> = (set, get) => ({
  draft: initialDraft,
  /** 只更新草稿片段。 */
  bumpDraft: () => set({ draft: get().draft + 1 }),
})

const createSharedSlice: StateCreator<BoundStore, PersistMutators, [], SharedSlice> = (
  set,
  get,
) => ({
  ticks: 0,
  /** 只把主题和草稿写回初始值，保留 Action 和无关计数。 */
  resetPreferences: () => set({ theme: initialTheme, draft: initialDraft }),
  /** 只删除存储项，不改当前内存里的主题。 */
  clearSaved: () => {
    usePreferenceStore.persist.clearStorage()
  },
  /** 增加与偏好无关的计数。 */
  tick: () => set({ ticks: get().ticks + 1 }),
})

const usePreferenceStore = create<BoundStore>()(
  persist(
    (...a) => ({
      ...createThemeSlice(...a),
      ...createDraftSlice(...a),
      ...createSharedSlice(...a),
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
    <article className="prefs-panel" data-testid="theme-subscriber">
      <span>主题片段</span>
      <strong data-testid="prefs-theme">{theme}</strong>
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
    <article className="prefs-panel" data-testid="draft-subscriber">
      <span>草稿片段</span>
      <strong data-testid="prefs-draft">{draft}</strong>
      <p>
        渲染次数 <b data-testid="draft-render-count">{renderCount.current}</b>
      </p>
    </article>
  )
}

/** 从主题派生是否深色，不把结果写进 Store。 */
function DerivedSubscriber() {
  const theme = usePreferenceStore((state) => state.theme)
  const isDark = theme === '深色'

  return (
    <article className="prefs-panel" data-testid="derived-subscriber">
      <span>派生结果</span>
      <strong data-testid="prefs-derived">{isDark ? '深色模式' : '浅色模式'}</strong>
    </article>
  )
}

/** 展示 partialize 之后写入存储的 JSON。 */
function StorageSubscriber() {
  const theme = usePreferenceStore((state) => state.theme)
  const raw = useSyncExternalStore(subscribeStorage, readStorageRaw, () => '')

  return (
    <article className="prefs-panel prefs-storage-panel" data-testid="storage-subscriber">
      <span>存储 JSON</span>
      <strong data-testid="prefs-storage-theme">{theme}</strong>
      <pre data-testid="prefs-storage">{raw || '空'}</pre>
    </article>
  )
}

/** 帮助开合留在组件内。 */
function HelpToggle() {
  const [open, setOpen] = useState(false)

  return (
    <article className="prefs-panel" data-testid="help-panel">
      <span>组件 State</span>
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? '收起说明' : '打开说明'}
      </button>
      <p data-testid="help-copy">
        {open ? '说明不进 Store，重置偏好也不会关掉它。' : '说明已收起'}
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

/** 只选择重置偏好 Action。 */
function ResetButton() {
  const resetPreferences = usePreferenceStore((state) => state.resetPreferences)

  return (
    <button type="button" onClick={resetPreferences}>
      重置偏好
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
    <p className="prefs-ticks" aria-live="polite">
      无关计数 <strong data-testid="prefs-ticks">{ticks}</strong>
    </p>
  )
}

/** 展示切片合并、主题持久化、草稿留在内存，以及重置不关掉说明。 */
function PreferencesCenterDemo() {
  const tick = usePreferenceStore((state) => state.tick)

  return (
    <section className="prefs-demo" data-testid="preferences-center-demo">
      <header className="prefs-heading">
        <p>Zustand preferences</p>
        <h2>一份 Store 拆成片段，只把主题写入存储</h2>
        <span>
          切换主题后刷新，主题还在；增加草稿后刷新，草稿回到
          0。重置偏好只恢复主题和草稿，说明开关留在组件里。
        </span>
      </header>

      <TicksDisplay />

      <div className="prefs-panels">
        <ThemeSubscriber />
        <DraftSubscriber />
        <DerivedSubscriber />
        <StorageSubscriber />
        <HelpToggle />
      </div>

      <div className="prefs-actions">
        <ThemeButton />
        <DraftButton />
        <ResetButton />
        <ClearStorageButton />
        <button type="button" onClick={tick}>
          增加无关计数
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供偏好设置中心观察组件。 */
export function createPreferencesCenterDemo(): ComponentType {
  return PreferencesCenterDemo
}
