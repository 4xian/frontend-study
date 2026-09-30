import { create, type StateCreator } from 'zustand'
import { createJSONStorage, devtools, persist, type StateStorage } from 'zustand/middleware'
import { type ComponentType, useState, useSyncExternalStore } from 'react'

import './client-state-platform-demo.css'

const STORAGE_KEY = 'react-zustand-client-state-platform'

const OLD_STORAGE = JSON.stringify({
  state: { themeName: '深色' },
  version: 0,
})

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
  /** 删除存储项。 */
  removeItem: (name) => {
    localStorage.removeItem(name)
    emitStorageChange()
  },
}

type ThemeSlice = {
  theme: string
  toggleTheme: () => void
}

type SessionSlice = {
  session: number
  bumpSession: () => void
}

type CommandSlice = {
  resetSession: () => void
}

type PlatformStore = ThemeSlice & SessionSlice & CommandSlice

type PlatformMutators = [['zustand/devtools', never], ['zustand/persist', unknown]]

type LegacyTheme = {
  themeName?: string
  theme?: string
}

/** 把 version 0 的 themeName 改成当前的 theme。 */
function migrateTheme(persisted: unknown, version: number) {
  if (version === 0) {
    const data = persisted as LegacyTheme
    return { theme: data.themeName ?? '浅色' }
  }
  return persisted as { theme: string }
}

localStorage.setItem(STORAGE_KEY, OLD_STORAGE)

/** 构造主题切片，只返回主题字段和切换命令。 */
const createThemeSlice: StateCreator<PlatformStore, PlatformMutators, [], ThemeSlice> = (
  set,
  get,
) => ({
  theme: '浅色',
  /** 在浅色和深色之间切换主题。 */
  toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
})

/** 构造会话切片，只返回当前页计数。 */
const createSessionSlice: StateCreator<PlatformStore, PlatformMutators, [], SessionSlice> = (
  set,
  get,
) => ({
  session: 0,
  /** 增加只留在内存里的会话计数。 */
  bumpSession: () => set({ session: get().session + 1 }),
})

/** 构造命令切片，只浅合并会话计数。 */
const createCommandSlice: StateCreator<PlatformStore, PlatformMutators, [], CommandSlice> = (
  set,
) => ({
  /** 只把会话计数写回 0，不改主题。 */
  resetSession: () => set({ session: 0 }),
})

const usePlatformStore = create<PlatformStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createThemeSlice(...args),
        ...createSessionSlice(...args),
        ...createCommandSlice(...args),
      }),
      {
        name: STORAGE_KEY,
        version: 1,
        storage: createJSONStorage(() => pageStorage),
        partialize: (state) => ({ theme: state.theme }),
        migrate: migrateTheme,
      },
    ),
    { name: 'ClientPlatform', enabled: true },
  ),
)

/** 读取当前存储项的原始字符串。 */
function readStorageRaw() {
  return localStorage.getItem(STORAGE_KEY) ?? ''
}

/** 从主题派生展示文案。 */
function formatMode(theme: string) {
  return theme === '深色' ? '深色模式' : '浅色模式'
}

/** 展示已水合的主题和派生结果。 */
function ThemePane() {
  const theme = usePlatformStore((state) => state.theme)

  return (
    <article className="platform-pane" data-testid="theme-pane">
      <h3>主题</h3>
      <p>
        当前 <strong data-testid="platform-theme">{theme}</strong>
      </p>
      <p>
        派生 <strong data-testid="platform-derived">{formatMode(theme)}</strong>
      </p>
    </article>
  )
}

/** 展示未写入存储的会话计数。 */
function SessionPane() {
  const session = usePlatformStore((state) => state.session)

  return (
    <article className="platform-pane" data-testid="session-pane">
      <h3>会话</h3>
      <p>
        计数 <strong data-testid="platform-session">{session}</strong>
      </p>
    </article>
  )
}

/** 展示 partialize 和迁移之后的存储 JSON。 */
function StoragePane() {
  const raw = useSyncExternalStore(subscribeStorage, readStorageRaw, () => '')

  return (
    <article className="platform-pane platform-storage-pane" data-testid="storage-pane">
      <h3>存储 JSON</h3>
      <pre data-testid="platform-storage">{raw || '空'}</pre>
    </article>
  )
}

/** 帮助开合留在组件内。 */
function HelpPane() {
  const [open, setOpen] = useState(false)

  return (
    <article className="platform-pane" data-testid="help-pane">
      <h3>说明</h3>
      <p data-testid="platform-help">{open ? '说明已打开' : '说明已收起'}</p>
      <div className="platform-actions">
        <button
          type="button"
          data-testid="platform-toggle-help"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '收起说明' : '打开说明'}
        </button>
      </div>
    </article>
  )
}

/** 只选择切换主题 Action。 */
function ThemeButton() {
  const toggleTheme = usePlatformStore((state) => state.toggleTheme)

  return (
    <button type="button" data-testid="platform-toggle-theme" onClick={toggleTheme}>
      切换主题
    </button>
  )
}

/** 只选择增加会话 Action。 */
function SessionButton() {
  const bumpSession = usePlatformStore((state) => state.bumpSession)

  return (
    <button type="button" data-testid="platform-bump-session" onClick={bumpSession}>
      增加会话
    </button>
  )
}

/** 只选择重置会话 Action。 */
function ResetButton() {
  const resetSession = usePlatformStore((state) => state.resetSession)

  return (
    <button type="button" data-testid="platform-reset-session" onClick={resetSession}>
      重置会话
    </button>
  )
}

/** 对照主题、会话、存储和组件说明。 */
function ClientStatePlatformDemo() {
  return (
    <section className="platform-demo" data-testid="client-state-platform-demo">
      <header className="platform-heading">
        <p>Zustand 客户端状态平台</p>
        <h2>一份 Store 收齐切片、迁移和部分持久化</h2>
        <span>
          旧的 themeName 会迁成深色。增加会话不改存储。重置会话只清计数，打开过的说明不会被关掉。
        </span>
      </header>

      <div className="platform-panes">
        <ThemePane />
        <SessionPane />
        <StoragePane />
        <HelpPane />
      </div>

      <div className="platform-actions">
        <ThemeButton />
        <SessionButton />
        <ResetButton />
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供客户端状态平台观察组件。 */
export function createClientStatePlatformDemo(): ComponentType {
  return ClientStatePlatformDemo
}
