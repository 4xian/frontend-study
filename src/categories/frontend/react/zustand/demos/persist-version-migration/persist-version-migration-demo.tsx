import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { type ComponentType, useSyncExternalStore } from 'react'

import './persist-version-migration-demo.css'

const MIGRATE_KEY = 'react-zustand-persist-version-migration-migrate'
const NO_MIGRATE_KEY = 'react-zustand-persist-version-migration-nomigrate'
const CURRENT_KEY = 'react-zustand-persist-version-migration-current'

const OLD_STORAGE = JSON.stringify({
  state: { themeName: '深色' },
  version: 0,
})
const CURRENT_STORAGE = JSON.stringify({
  state: { theme: '深色' },
  version: 1,
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
  /** 删除存储项，并通知存储面板。 */
  removeItem: (name) => {
    localStorage.removeItem(name)
    emitStorageChange()
  },
}

type PreferenceStore = {
  theme: string
  toggleTheme: () => void
}

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

localStorage.setItem(MIGRATE_KEY, OLD_STORAGE)
localStorage.setItem(NO_MIGRATE_KEY, OLD_STORAGE)
localStorage.setItem(CURRENT_KEY, CURRENT_STORAGE)

const useMigrateStore = create<PreferenceStore>()(
  persist(
    (set, get) => ({
      theme: '浅色',
      /** 在浅色和深色之间切换主题。 */
      toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
    }),
    {
      name: MIGRATE_KEY,
      version: 1,
      storage: createJSONStorage(() => pageStorage),
      partialize: (state) => ({ theme: state.theme }),
      migrate: migrateTheme,
    },
  ),
)

const useNoMigrateStore = create<PreferenceStore>()(
  persist(
    (set, get) => ({
      theme: '浅色',
      /** 在浅色和深色之间切换主题。 */
      toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
    }),
    {
      name: NO_MIGRATE_KEY,
      version: 1,
      storage: createJSONStorage(() => pageStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)

const useCurrentStore = create<PreferenceStore>()(
  persist(
    (set, get) => ({
      theme: '浅色',
      /** 在浅色和深色之间切换主题。 */
      toggleTheme: () => set({ theme: get().theme === '浅色' ? '深色' : '浅色' }),
    }),
    {
      name: CURRENT_KEY,
      version: 1,
      storage: createJSONStorage(() => pageStorage),
      partialize: (state) => ({ theme: state.theme }),
      migrate: migrateTheme,
    },
  ),
)

/** 读取指定存储键的原始字符串。 */
function readStorageRaw(name: string) {
  return localStorage.getItem(name) ?? ''
}

/** 把存储 JSON 整理成便于阅读的文本。 */
function formatStorage(raw: string) {
  if (!raw) {
    return '空'
  }
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

/** 写入指定快照后重新水合。 */
function seedAndRehydrate(
  name: string,
  snapshot: string,
  store: {
    persist: { rehydrate: () => Promise<void> | void }
  },
) {
  localStorage.setItem(name, snapshot)
  emitStorageChange()
  void store.persist.rehydrate()
}

/** 展示带 migrate 时旧版 themeName 会变成 theme。 */
function MigratePane() {
  const theme = useMigrateStore((state) => state.theme)
  const raw = useSyncExternalStore(
    subscribeStorage,
    () => readStorageRaw(MIGRATE_KEY),
    () => '',
  )

  return (
    <section className="persist-migrate-pane" data-testid="migrate-pane">
      <h3>有 migrate</h3>
      <p>
        主题 <strong data-testid="migrate-theme">{theme}</strong>
      </p>
      <pre data-testid="migrate-storage">{formatStorage(raw)}</pre>
    </section>
  )
}

/** 展示版本不一致且没有 migrate 时不会采用旧存储。 */
function NoMigratePane() {
  const theme = useNoMigrateStore((state) => state.theme)
  const raw = useSyncExternalStore(
    subscribeStorage,
    () => readStorageRaw(NO_MIGRATE_KEY),
    () => '',
  )

  return (
    <section className="persist-migrate-pane" data-testid="nomigrate-pane">
      <h3>没有 migrate</h3>
      <p>
        主题 <strong data-testid="nomigrate-theme">{theme}</strong>
      </p>
      <pre data-testid="nomigrate-storage">{formatStorage(raw)}</pre>
    </section>
  )
}

/** 展示版本一致时直接恢复，不必走 migrate。 */
function CurrentPane() {
  const theme = useCurrentStore((state) => state.theme)
  const raw = useSyncExternalStore(
    subscribeStorage,
    () => readStorageRaw(CURRENT_KEY),
    () => '',
  )

  return (
    <section className="persist-migrate-pane" data-testid="current-pane">
      <h3>版本一致</h3>
      <p>
        主题 <strong data-testid="current-theme">{theme}</strong>
      </p>
      <pre data-testid="current-storage">{formatStorage(raw)}</pre>
    </section>
  )
}

/** 对照迁移、丢弃旧存储和版本一致恢复。 */
function PersistVersionMigrationDemo() {
  return (
    <section className="persist-migrate-demo" data-testid="persist-version-migration-demo">
      <header className="persist-migrate-heading">
        <p>Zustand persist version</p>
        <h2>旧版 themeName 迁成 theme，没有 migrate 则丢掉旧存储</h2>
        <span>
          左侧写入 version 0 后迁成深色，存储变成 version
          1。中间同样写入旧版但不迁移，主题仍是浅色。右侧写入已经是 version 1 的主题，直接恢复。
        </span>
      </header>

      <div className="persist-migrate-panes">
        <MigratePane />
        <NoMigratePane />
        <CurrentPane />
      </div>

      <div className="persist-migrate-actions">
        <button
          type="button"
          data-testid="seed-migrate"
          onClick={() => seedAndRehydrate(MIGRATE_KEY, OLD_STORAGE, useMigrateStore)}
        >
          写入旧版并迁移
        </button>
        <button
          type="button"
          data-testid="seed-nomigrate"
          onClick={() => seedAndRehydrate(NO_MIGRATE_KEY, OLD_STORAGE, useNoMigrateStore)}
        >
          写入旧版不迁移
        </button>
        <button
          type="button"
          data-testid="seed-current"
          onClick={() => seedAndRehydrate(CURRENT_KEY, CURRENT_STORAGE, useCurrentStore)}
        >
          写入当前版本
        </button>
      </div>
    </section>
  )
}

/** 为 React Demo 宿主提供持久化版本迁移观察组件。 */
export function createPersistVersionMigrationDemo(): ComponentType {
  return PersistVersionMigrationDemo
}
