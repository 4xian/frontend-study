<script setup lang="ts">
import {
  computed,
  createApp,
  defineComponent,
  onBeforeUnmount,
  onUpdated,
  ref,
  shallowRef,
  toRef,
} from 'vue'
import {
  createPinia,
  defineStore,
  disposePinia,
  getActivePinia,
  setActivePinia,
  type Pinia,
  type PiniaPlugin,
  type PiniaPluginContext,
  type StateTree,
} from 'pinia'
import { preserveActivePinia } from '@/content/demos/vue/pinia/preserve-active-pinia'

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    persist?: boolean
  }

  export interface PiniaCustomProperties {
    pluginLabel: string
    incrementPluginState(): void
  }

  export interface PiniaCustomStateProperties<S extends StateTree> {
    pluginState?: number
  }
}

type ColorMode = 'light' | 'dark'

interface PersistedPreferencesV1 {
  version: 1
  data: {
    colorMode: ColorMode
    compact: boolean
  }
}

type DecodeResult =
  { ok: true; value: PersistedPreferencesV1; status: string } | { ok: false; status: string }
type StorageReadResult = { ok: true; value: string | null } | { ok: false }

const persistenceKey = 'vue3-study:vue.pinia.learn.advanced.plugins-persistence:v1'
const hostActivePinia = getActivePinia()
const pluginRuns = ref(0)
const queuedRuns = ref(0)
const installedRuns = ref(0)
const firstCreationRuns = ref(0)
const repeatedUseRuns = ref(0)
const contextIdentity = ref('等待创建 Store')
const persistFlags = ref('等待读取 options')
const decoderStatus = ref('等待读取存储')
const externalPatchStatus = ref('尚未收到外部事件')
const writeCount = ref(0)
const defaultResetResult = ref('尚未运行')
const wrappedResetResult = ref('尚未运行')
const timeline = ref<string[]>([])
const resourceStops: Array<() => void> = []
const preferencesStore = shallowRef<ReturnType<typeof usePreferencesStore>>()
const auditStore = shallowRef<ReturnType<typeof useAuditStore>>()
let miniPinia: Pinia | undefined
let miniApp: ReturnType<typeof createApp> | undefined
let miniAppNode: HTMLElement | undefined
let applyingExternal = false
let storageBaseline: string | null | undefined

/** 判断未知值是否是可读取属性的普通对象。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 解码并完整校验 Demo 专用 v1 envelope。 */
function decodePreferences(raw: string | null): DecodeResult {
  if (raw === null) return { ok: false, status: '无持久化数据：使用默认偏好' }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, status: '损坏 JSON：使用默认偏好' }
  }

  if (!isRecord(parsed)) return { ok: false, status: 'Schema 错误：使用默认偏好' }
  if (parsed.version !== 1) return { ok: false, status: '未知版本：使用默认偏好' }
  if (!isRecord(parsed.data)) return { ok: false, status: 'Schema 错误：使用默认偏好' }
  if (parsed.data.colorMode !== 'light' && parsed.data.colorMode !== 'dark') {
    return { ok: false, status: 'Schema 错误：使用默认偏好' }
  }
  if (typeof parsed.data.compact !== 'boolean') {
    return { ok: false, status: 'Schema 错误：使用默认偏好' }
  }

  return {
    ok: true,
    value: {
      version: 1,
      data: {
        colorMode: parsed.data.colorMode,
        compact: parsed.data.compact,
      },
    },
    status: '已恢复 v1 偏好',
  }
}

/** 安全读取唯一 Demo key，并把浏览器拒绝转成可观察状态。 */
function readDemoStorage(): StorageReadResult {
  try {
    return { ok: true, value: window.localStorage.getItem(persistenceKey) }
  } catch {
    decoderStatus.value = '读取失败：保留内存偏好'
    return { ok: false }
  }
}

/** 安全写入唯一 Demo key，不影响内存中的 Store 操作。 */
function writeDemoStorage(value: string, countWrite = false): boolean {
  try {
    window.localStorage.setItem(persistenceKey, value)
    if (countWrite) writeCount.value++
    return true
  } catch {
    decoderStatus.value = '写入失败：保留内存偏好'
    return false
  }
}

/** 安全删除唯一 Demo key，不清空宿主的其他存储。 */
function removeDemoStorage(): boolean {
  try {
    window.localStorage.removeItem(persistenceKey)
    return true
  } catch {
    decoderStatus.value = '删除失败：保留内存偏好'
    return false
  }
}

/** 捕获挂载前的 Demo key 基线，供卸载时原样恢复。 */
function captureStorageBaseline(): void {
  try {
    storageBaseline = window.localStorage.getItem(persistenceKey)
  } catch {
    storageBaseline = undefined
  }
}

/** 恢复挂载前的 Demo key 基线，不触及任何其他 key。 */
function restoreStorageBaseline(): void {
  if (storageBaseline === undefined) return
  if (storageBaseline === null) removeDemoStorage()
  else writeDemoStorage(storageBaseline)
}

/** 追加最近八条确定性实验事件。 */
function appendEvent(message: string): void {
  timeline.value = [...timeline.value, message].slice(-8)
}

const usePreferencesStore = defineStore('pinia-p04-persisted-preferences', {
  /** 创建只含无敏感显示偏好的 state。 */
  state: () => ({
    colorMode: 'light' as ColorMode,
    compact: false,
  }),
  actions: {
    /** 同时切换两个 allowlist 偏好，触发一次确定性持久化。 */
    togglePreferences(): void {
      this.$patch({
        colorMode: this.colorMode === 'light' ? 'dark' : 'light',
        compact: !this.compact,
      })
    },
  },
  persist: true,
})

const useAuditStore = defineStore('pinia-p04-default-reset-audit', {
  /** 创建用于对照默认 reset 的普通 state。 */
  state: () => ({ count: 0 }),
  persist: false,
})

const MiniAppRoot = defineComponent({
  name: 'PiniaPluginPersistenceMiniApp',
  /** 渲染只提供 Pinia 安装上下文的空根节点。 */
  render() {
    return null
  },
})

/** 创建同时扩展两个 Store、只持久化 allowlist Store 的教学插件。 */
function createPersistencePlugin(
  expectedPinia: Pinia,
  expectedApp: ReturnType<typeof createApp>,
): PiniaPlugin {
  return ({ pinia, app, store, options }: PiniaPluginContext) => {
    pluginRuns.value++
    const identityMatches =
      pinia === expectedPinia &&
      app === expectedApp &&
      (store.$id === 'pinia-p04-persisted-preferences' ||
        store.$id === 'pinia-p04-default-reset-audit') &&
      typeof options === 'object'
    contextIdentity.value = identityMatches
      ? 'pinia ✓ · app ✓ · store ✓ · options ✓'
      : 'context identity 不匹配'
    persistFlags.value = [
      ...persistFlags.value.split(' / ').filter((item) => item.startsWith('persist=')),
      `persist=${Boolean(options.persist)}`,
    ]
      .slice(-2)
      .join(' / ')

    if (!Object.hasOwn(store.$state, 'pluginState')) store.$state.pluginState = 0
    Reflect.set(store, 'pluginState', toRef(store.$state, 'pluginState'))
    const pluginLabel = store.$id

    /** 增加同时连接 Store 与 $state 的插件状态。 */
    function incrementPluginState(): void {
      store.pluginState = (store.pluginState ?? 0) + 1
    }

    if (!options.persist) return { pluginLabel, incrementPluginState }

    const persistedStore = store as ReturnType<typeof usePreferencesStore>
    const stored = readDemoStorage()
    if (stored.ok) {
      const decoded = decodePreferences(stored.value)
      decoderStatus.value = decoded.status
      if (decoded.ok) persistedStore.$patch(decoded.value.data)
      else if (!decoded.status.startsWith('无持久化')) removeDemoStorage()
    }

    const stopSubscription = persistedStore.$subscribe(
      (_mutation, state) => {
        if (applyingExternal) return
        const envelope: PersistedPreferencesV1 = {
          version: 1,
          data: { colorMode: state.colorMode, compact: state.compact },
        }
        writeDemoStorage(JSON.stringify(envelope), true)
      },
      { flush: 'sync' },
    )

    /** 接受同一 storageArea 与 key 的有效外部 v1 事件。 */
    function handleStorage(event: StorageEvent): void {
      let isDemoStorage = false
      try {
        isDemoStorage = event.storageArea === window.localStorage
      } catch {
        externalPatchStatus.value = 'storageArea 不可访问：已忽略'
        return
      }
      if (!isDemoStorage || event.key !== persistenceKey) return

      if (event.newValue === null) {
        applyingExternal = true
        persistedStore.$reset()
        applyingExternal = false
        externalPatchStatus.value = '外部删除：已恢复默认且未回写'
        appendEvent('storage：外部删除 -> 默认偏好')
        return
      }

      const external = decodePreferences(event.newValue)
      if (!external.ok) {
        externalPatchStatus.value = `${external.status}，未应用`
        return
      }
      applyingExternal = true
      persistedStore.$patch(external.value.data)
      applyingExternal = false
      externalPatchStatus.value = '有效 v1：已应用且未回写'
      appendEvent('storage：应用外部 v1 envelope')
    }

    window.addEventListener('storage', handleStorage)
    resourceStops.push(stopSubscription, () => window.removeEventListener('storage', handleStorage))

    const originalReset = persistedStore.$reset.bind(persistedStore)

    /** 包装 Options Store reset，并显式重置 plugin state。 */
    function resetWithPluginState(): void {
      originalReset()
      persistedStore.pluginState = 0
    }

    return { pluginLabel, incrementPluginState, $reset: resetWithPluginState }
  }
}

/** 停止当前实验资源，但在重建时保留待测 storage 内容。 */
function teardownLab(): void {
  for (const stop of resourceStops.splice(0)) stop()
  if (miniApp) preserveActivePinia(() => miniApp?.unmount())
  if (miniPinia) preserveActivePinia(() => disposePinia(miniPinia!))
  miniAppNode?.remove()
  miniApp = undefined
  miniPinia = undefined
  miniAppNode = undefined
  preferencesStore.value = undefined
  auditStore.value = undefined
  setActivePinia(hostActivePinia)
}

/** 按注册、安装、创建两个 Store 的顺序重建隔离实验。 */
function createLab(): void {
  teardownLab()
  pluginRuns.value = 0
  persistFlags.value = '等待读取 options'
  writeCount.value = 0
  const pinia = createPinia()
  const app = createApp(MiniAppRoot)
  const node = document.createElement('div')
  node.hidden = true
  document.body.append(node)

  pinia.use(createPersistencePlugin(pinia, app))
  queuedRuns.value = pluginRuns.value
  preserveActivePinia(() => app.use(pinia))
  installedRuns.value = pluginRuns.value
  preserveActivePinia(() => app.mount(node))
  const currentPreferences = preserveActivePinia(() => usePreferencesStore(pinia))
  const currentAudit = preserveActivePinia(() => useAuditStore(pinia))
  firstCreationRuns.value = pluginRuns.value
  preserveActivePinia(() => usePreferencesStore(pinia))
  preserveActivePinia(() => useAuditStore(pinia))
  repeatedUseRuns.value = pluginRuns.value

  miniPinia = pinia
  miniApp = app
  miniAppNode = node
  preferencesStore.value = currentPreferences
  auditStore.value = currentAudit
  setActivePinia(hostActivePinia)
  appendEvent(`重建：decoder=${decoderStatus.value}`)
}

/** 修改两个 allowlist 偏好并让订阅写入 v1 envelope。 */
function toggleAndPersist(): void {
  preserveActivePinia(() => preferencesStore.value?.togglePreferences())
  appendEvent('用户修改：只保存 colorMode/compact')
}

/** 同时增加两个 Store 的 plugin state，供 reset 对照。 */
function incrementPluginStates(): void {
  preserveActivePinia(() => {
    preferencesStore.value?.incrementPluginState()
    auditStore.value?.incrementPluginState()
  })
  appendEvent('plugin state：两个 Store 均 +1')
}

/** 调用未包装 Store 的默认 reset，观察 plugin state 保留。 */
function runDefaultReset(): void {
  preserveActivePinia(() => auditStore.value?.$reset())
  defaultResetResult.value = `pluginState=${auditStore.value?.pluginState ?? 'missing'}`
  appendEvent(`默认 reset：${defaultResetResult.value}`)
}

/** 调用持久化 Store 的包装 reset，观察 plugin state 归零。 */
function runWrappedReset(): void {
  preserveActivePinia(() => preferencesStore.value?.$reset())
  wrappedResetResult.value = `pluginState=${preferencesStore.value?.pluginState ?? 'missing'}`
  appendEvent(`包装 reset：${wrappedResetResult.value}`)
}

/** 写入指定不可信字符串并重建 Store。 */
function rebuildWithRaw(raw: string): void {
  if (!writeDemoStorage(raw)) return
  createLab()
}

/** 写入损坏 JSON 并验证回退默认值。 */
function rebuildWithBrokenJson(): void {
  rebuildWithRaw('{broken-json')
}

/** 写入未知 envelope 版本并验证拒绝。 */
function rebuildWithUnknownVersion(): void {
  rebuildWithRaw(JSON.stringify({ version: 2, data: { colorMode: 'dark', compact: true } }))
}

/** 写入字段类型错误的 v1 数据并验证拒绝。 */
function rebuildWithInvalidSchema(): void {
  rebuildWithRaw(JSON.stringify({ version: 1, data: { colorMode: 'blue', compact: 'yes' } }))
}

/** 只清除 Demo key，并在抑制写入期间恢复两个 Store。 */
function clearAndReset(): void {
  applyingExternal = true
  const removed = removeDemoStorage()
  preserveActivePinia(() => {
    preferencesStore.value?.$reset()
    auditStore.value?.$reset()
    if (auditStore.value) auditStore.value.pluginState = 0
  })
  applyingExternal = false
  if (removed) decoderStatus.value = '已清空 Demo key 并恢复默认'
  appendEvent(removed ? '清理：内存与 Demo key 已复位' : '清理：内存已复位，Demo key 删除失败')
}

const visiblePreferences = computed(
  () =>
    `${preferencesStore.value?.colorMode ?? 'light'} · ${preferencesStore.value?.compact ? 'compact' : 'comfortable'}`,
)
const visiblePluginState = computed(
  () =>
    `store=${preferencesStore.value?.pluginState ?? 0} · $state=${preferencesStore.value?.$state.pluginState ?? 0}`,
)
const visiblePluginLabel = computed(() => preferencesStore.value?.pluginLabel ?? 'not-created')

captureStorageBaseline()
createLab()

/** 在外层响应式更新后继续恢复宿主 active Pinia。 */
onUpdated(() => setActivePinia(hostActivePinia))

onBeforeUnmount(() => {
  teardownLab()
  restoreStorageBaseline()
  setActivePinia(hostActivePinia)
})
</script>

<template>
  <article class="pinia-demo" aria-label="插件与持久化边界实验">
    <header class="demo-header">
      <p class="eyebrow">L11 · 插件与持久化边界</p>
      <h3>把插件时序与存储协议拆开观察</h3>
      <p>独立 mini-app 只使用一个版本化 Demo key，不读取宿主主题、进度或敏感数据。</p>
    </header>

    <section class="result-panel" aria-label="插件运行结果" aria-live="polite">
      <p data-testid="plugin-checkpoints">
        plugin runs：use={{ queuedRuns }} · install={{ installedRuns }} · first={{
          firstCreationRuns
        }}
        · repeat={{ repeatedUseRuns }}
      </p>
      <p data-testid="plugin-contexts">
        context：{{ contextIdentity }}；options：{{ persistFlags }}
      </p>
      <p data-testid="plugin-state-alias">plugin state：{{ visiblePluginState }}</p>
      <p>plugin metadata：{{ visiblePluginLabel }}</p>
    </section>

    <section class="result-panel" aria-label="持久化结果" aria-live="polite">
      <p data-testid="persistence-state">显示偏好：{{ visiblePreferences }}</p>
      <p data-testid="decoder-status">decoder：{{ decoderStatus }}</p>
      <p data-testid="external-patch-status">storage event：{{ externalPatchStatus }}</p>
      <p data-testid="persistence-write-count">当前实例订阅写入次数：{{ writeCount }}</p>
      <p data-testid="default-reset-result">默认 reset：{{ defaultResetResult }}</p>
      <p data-testid="wrapped-reset-result">包装 reset：{{ wrappedResetResult }}</p>
    </section>

    <section class="controls" aria-label="插件与持久化实验操作">
      <div class="actions">
        <button type="button" @click="toggleAndPersist">修改并保存偏好</button>
        <button type="button" @click="incrementPluginStates">增加插件 state</button>
        <button type="button" @click="runDefaultReset">运行默认 $reset</button>
        <button type="button" @click="runWrappedReset">运行包装 $reset</button>
      </div>
      <div class="actions">
        <button type="button" @click="rebuildWithBrokenJson">写入损坏 JSON 并重建</button>
        <button type="button" @click="rebuildWithUnknownVersion">写入未知版本并重建</button>
        <button type="button" @click="rebuildWithInvalidSchema">写入错误 Schema 并重建</button>
        <button type="button" @click="clearAndReset">清空持久化并重置</button>
      </div>
    </section>

    <p class="boundary-note">
      真实跨标签 storage 事件需要两个同源浏览上下文；本面板只为定向测试暴露 listener seam。
    </p>

    <ol class="timeline" aria-label="最近插件与持久化事件">
      <li v-for="(event, index) in timeline" :key="`${index}-${event}`">{{ event }}</li>
    </ol>
  </article>
</template>

<style scoped>
.pinia-demo {
  width: 100%;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
}

.demo-header p,
.demo-header h3,
.result-panel p,
.boundary-note {
  margin: 0;
}

.eyebrow {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3 {
  margin-top: 4px;
  font-size: var(--font-size-lg);
}

.demo-header p:last-child,
.boundary-note {
  margin-top: 8px;
  color: var(--color-text-secondary);
}

.result-panel {
  margin-top: 12px;
  padding: 14px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg-sunken);
}

.result-panel p {
  overflow-wrap: anywhere;
}

.result-panel p + p {
  margin-top: 6px;
}

.controls {
  margin-top: 12px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
}

.actions + .actions {
  margin-top: 6px;
}

button {
  min-height: 40px;
  margin: 4px 8px 4px 0;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-primary);
  background: var(--color-bg-sunken);
  cursor: pointer;
}

button:hover {
  border-color: var(--color-accent);
}

button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.timeline {
  margin: 12px 0 0;
  padding: 12px 12px 12px 34px;
  background: var(--color-bg-sunken);
}

.timeline li + li {
  margin-top: 5px;
}

@media (max-width: 520px) {
  .pinia-demo {
    padding: 14px;
  }

  button {
    flex: 1 1 180px;
  }
}
</style>
