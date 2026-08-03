<script setup lang="ts">
import { computed, createApp, defineComponent, h, inject, onBeforeUnmount, ref } from 'vue'
import type { App, InjectionKey, Plugin } from 'vue'

type AppId = 'app-a' | 'app-b'
type PluginKind = 'object' | 'function'
type HostState = '未运行' | '运行中' | '已卸载'

interface LessonPluginOptions {
  appId: AppId
  label: string
  onInstall: (appId: AppId) => void
  onCleanup: (appId: AppId) => void
}

interface LessonService {
  appId: AppId
  label: string
}

interface AppCounts {
  'app-a': number
  'app-b': number
}

const lessonServiceKey = Symbol('lesson-service') as InjectionKey<LessonService>
const pluginKind = ref<PluginKind>('object')
const appAHost = ref<HTMLElement | null>(null)
const appBHost = ref<HTMLElement | null>(null)
const hostStates = ref<Record<AppId, HostState>>({ 'app-a': '未运行', 'app-b': '未运行' })
const installCounts = ref<AppCounts>({ 'app-a': 0, 'app-b': 0 })
const cleanupCounts = ref<AppCounts>({ 'app-a': 0, 'app-b': 0 })
const appsRunning = ref(false)

let appA: App<Element> | null = null
let appB: App<Element> | null = null

/** 为当前应用提供课程服务并登记同应用的卸载清理。 */
function installLessonService(app: App, options: LessonPluginOptions): void {
  options.onInstall(options.appId)
  app.provide(lessonServiceKey, { appId: options.appId, label: options.label })
  app.onUnmount(() => options.onCleanup(options.appId))
}

const objectPlugin: Plugin<[LessonPluginOptions]> = {
  /** 通过对象插件的 install 方法安装课程服务。 */
  install(app, options) {
    installLessonService(app, options)
  },
}

/** 通过函数插件安装同一份课程服务。 */
const functionPlugin: Plugin<[LessonPluginOptions]> = (app, options) => {
  installLessonService(app, options)
}

const PluginConsumer = defineComponent({
  name: 'PluginInstallationScopeConsumer',
  /** 注入当前子应用的服务并渲染公开结果。 */
  setup() {
    const service = inject(lessonServiceKey)
    if (!service) throw new Error('课程插件尚未安装')

    return () =>
      h(
        'section',
        {
          class: 'plugin-consumer',
          'data-testid': 'plugin-consumer',
          'data-app-id': service.appId,
        },
        [h('strong', service.label), h('span', `注入标识：${service.appId}`)],
      )
  },
})

/** 当前模式使用的稳定插件身份。 */
const activePlugin = computed(() => (pluginKind.value === 'object' ? objectPlugin : functionPlugin))

/** 当前安装次数的可读汇总。 */
const installationSummary = computed(
  () =>
    `A 安装 ${installCounts.value['app-a']} 次，B 安装 ${installCounts.value['app-b']} 次，总计 ${installCounts.value['app-a'] + installCounts.value['app-b']} 次`,
)

/** 当前清理次数的可读汇总。 */
const cleanupSummary = computed(
  () => `A 清理 ${cleanupCounts.value['app-a']} 次，B 清理 ${cleanupCounts.value['app-b']} 次`,
)

/** 同一应用重复安装的可观察结论。 */
const dedupeResult = computed(() =>
  installCounts.value['app-a'] === 0
    ? '等待运行：应用 A 会对同一插件身份调用两次 use。'
    : '应用 A 调用了两次 use，但同一插件身份只安装 1 次。',
)

/** 记录指定应用的一次插件安装。 */
function recordInstall(appId: AppId): void {
  installCounts.value = {
    ...installCounts.value,
    [appId]: installCounts.value[appId] + 1,
  }
}

/** 记录指定应用的一次插件清理。 */
function recordCleanup(appId: AppId): void {
  cleanupCounts.value = {
    ...cleanupCounts.value,
    [appId]: cleanupCounts.value[appId] + 1,
  }
}

/** 生成当前应用独有的插件安装选项。 */
function createPluginOptions(appId: AppId, label: string): LessonPluginOptions {
  return {
    appId,
    label,
    onInstall: recordInstall,
    onCleanup: recordCleanup,
  }
}

/** 释放当前仍存活的两个子应用。 */
function releaseChildApps(): void {
  appA?.unmount()
  appB?.unmount()
  appA = null
  appB = null
  appsRunning.value = false
}

/** 清空当前轮次的安装与清理计数。 */
function resetCounts(): void {
  installCounts.value = { 'app-a': 0, 'app-b': 0 }
  cleanupCounts.value = { 'app-a': 0, 'app-b': 0 }
}

/** 选择插件形状，并把仍在运行的上一轮实验完整释放。 */
function selectPluginKind(kind: PluginKind): void {
  if (pluginKind.value === kind) return
  releaseChildApps()
  resetCounts()
  hostStates.value = { 'app-a': '未运行', 'app-b': '未运行' }
  pluginKind.value = kind
}

/** 用同一插件身份创建两个隔离子应用并执行固定安装序列。 */
function runInstallationExperiment(): void {
  if (!appAHost.value || !appBHost.value) return

  releaseChildApps()
  resetCounts()

  const plugin = activePlugin.value
  const optionsA = createPluginOptions('app-a', '课程应用 A')
  const optionsB = createPluginOptions('app-b', '课程应用 B')
  const nextAppA = createApp(PluginConsumer)
  const nextAppB = createApp(PluginConsumer)

  nextAppA.use(plugin, optionsA)
  nextAppA.use(plugin, optionsA)
  nextAppB.use(plugin, optionsB)
  nextAppA.mount(appAHost.value)
  nextAppB.mount(appBHost.value)

  appA = nextAppA
  appB = nextAppB
  appsRunning.value = true
  hostStates.value = { 'app-a': '运行中', 'app-b': '运行中' }
}

/** 卸载两个子应用并保留本轮可观察的清理次数。 */
function unmountApps(): void {
  if (!appsRunning.value) return
  releaseChildApps()
  hostStates.value = { 'app-a': '已卸载', 'app-b': '已卸载' }
}

onBeforeUnmount(releaseChildApps)
</script>

<template>
  <article class="plugin-installation-scope-lab-demo">
    <header class="lab-header">
      <p class="eyebrow">Plugin scope lab</p>
      <h3>同一插件，每个应用各安装一次</h3>
      <p class="lab-description">
        应用 A 对同一插件身份调用两次 use，应用 B 调用一次；比较安装、注入与清理结果。
      </p>
    </header>

    <div class="plugin-kind" data-testid="plugin-kind" aria-label="插件形状">
      <button
        type="button"
        :aria-pressed="pluginKind === 'object'"
        @click="selectPluginKind('object')"
      >
        对象插件
      </button>
      <button
        type="button"
        :aria-pressed="pluginKind === 'function'"
        @click="selectPluginKind('function')"
      >
        函数插件
      </button>
    </div>

    <div class="lab-actions">
      <button
        type="button"
        class="primary-action"
        data-testid="run-installation"
        @click="runInstallationExperiment"
      >
        运行安装实验
      </button>
      <button
        type="button"
        data-testid="unmount-apps"
        :disabled="!appsRunning"
        @click="unmountApps"
      >
        卸载两个应用
      </button>
    </div>

    <div class="application-hosts">
      <section class="application-host" data-testid="plugin-app-a-host" aria-live="polite">
        <div class="host-heading">
          <strong>应用 A</strong>
          <span>{{ hostStates['app-a'] }}</span>
        </div>
        <div ref="appAHost" class="consumer-mount"></div>
        <p v-if="hostStates['app-a'] !== '运行中'" class="host-placeholder">
          {{ hostStates['app-a'] }}
        </p>
      </section>

      <section class="application-host" data-testid="plugin-app-b-host" aria-live="polite">
        <div class="host-heading">
          <strong>应用 B</strong>
          <span>{{ hostStates['app-b'] }}</span>
        </div>
        <div ref="appBHost" class="consumer-mount"></div>
        <p v-if="hostStates['app-b'] !== '运行中'" class="host-placeholder">
          {{ hostStates['app-b'] }}
        </p>
      </section>
    </div>

    <section class="experiment-results" aria-label="实验结果">
      <p data-testid="installation-summary" role="status" aria-live="polite">
        {{ installationSummary }}
      </p>
      <p data-testid="cleanup-summary" role="status" aria-live="polite">
        {{ cleanupSummary }}
      </p>
      <p data-testid="dedupe-result">{{ dedupeResult }}</p>
    </section>
  </article>
</template>

<style scoped>
.plugin-installation-scope-lab-demo {
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-sunken);
  overflow: hidden;
}

.lab-header h3,
.lab-header p,
.application-host p,
.experiment-results p {
  margin: 0;
}

.eyebrow {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.lab-header h3 {
  margin-top: 0.35rem;
}

.lab-description {
  margin-top: 0.75rem !important;
  color: var(--color-text-secondary);
  line-height: 1.65;
}

.plugin-kind,
.lab-actions,
.application-hosts {
  display: flex;
  flex-wrap: wrap;
}

.plugin-kind,
.lab-actions {
  margin-top: 1rem;
}

.plugin-kind button,
.lab-actions button {
  min-width: 9rem;
  min-height: 44px;
  padding: 0.65rem 1rem;
  margin: 0.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
  white-space: normal;
}

.plugin-kind button[aria-pressed='true'],
.primary-action {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.plugin-kind button:focus-visible,
.lab-actions button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.lab-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.application-hosts {
  margin: 1rem -0.35rem 0;
}

.application-host {
  flex: 1 1 14rem;
  min-width: 0;
  min-height: 10rem;
  padding: 1rem;
  margin: 0.35rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.host-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.host-heading span {
  margin-left: 0.75rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.consumer-mount {
  min-width: 0;
}

.application-host :deep(.plugin-consumer) {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 0.9rem;
  margin-top: 0.9rem;
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg-sunken);
  overflow-wrap: anywhere;
}

.application-host :deep(.plugin-consumer span) {
  margin-top: 0.45rem;
  color: var(--color-text-secondary);
}

.host-placeholder {
  min-height: 3rem;
  padding: 0.9rem;
  margin-top: 0.9rem !important;
  color: var(--color-text-secondary);
  background: var(--color-bg-sunken);
}

.experiment-results {
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.experiment-results p {
  overflow-wrap: anywhere;
}

.experiment-results p + p {
  margin-top: 0.6rem;
}

@media (max-width: 560px) {
  .plugin-installation-scope-lab-demo {
    padding: 0.9rem;
  }

  .plugin-kind button,
  .lab-actions button {
    flex: 1 1 100%;
    min-width: 0;
  }

  .application-host {
    flex-basis: 100%;
  }
}
</style>
