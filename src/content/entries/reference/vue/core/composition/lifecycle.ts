/**
 * 知识点：生命周期钩子（onMounted / onUpdated / onUnmounted / 渲染调试钩子等）
 * 查证来源（2026-08-02）：
 * - https://cn.vuejs.org/api/composition-api-lifecycle.html（钩子签名、时序、SSR 与错误捕获）
 * - https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#component-debugging-hooks（组件渲染调试事件）
 * - https://cn.vuejs.org/guide/essentials/lifecycle.html（同步注册约束）
 * - https://cn.vuejs.org/guide/reusability/composables.html（script setup 顶层 await 例外）
 * - https://cn.vuejs.org/guide/built-ins/keep-alive.html（缓存树钩子的完整调用边界）
 * - https://cn.vuejs.org/guide/scaling-up/ssr.html（SSR 生命周期边界）
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts
 * 查证工具：Tavily、Vue 官方中文文档、GitHub vuejs/core v3.5.40 源码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.composition.lifecycle',
  type: 'reference',
  title: '生命周期钩子',
  summary: '在组件挂载、更新、卸载、缓存切换、错误捕获与服务端预取等阶段注册回调',
  ecosystem: 'vue',
  module: 'core',
  collection: 'composition',
  related: [
    'vue.core.reference.composition.template-refs',
    'vue.core.reference.built-ins.keep-alive',
    'vue.core.reference.built-ins.suspense',
    'vue.core.reference.application.next-tick',
  ],
  tags: [
    '生命周期',
    'onMounted',
    'onUpdated',
    'onUnmounted',
    'onRenderTracked',
    'onRenderTriggered',
    'DebuggerEvent',
    'KeepAlive',
    'SSR',
  ],
  sources: [
    {
      title: 'Vue 组合式 API：生命周期钩子',
      url: 'https://cn.vuejs.org/api/composition-api-lifecycle.html',
    },
    {
      title: 'Vue onRenderTracked()',
      url: 'https://cn.vuejs.org/api/composition-api-lifecycle.html#onrendertracked',
    },
    {
      title: 'Vue 深入响应式系统：组件调试钩子',
      url: 'https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#component-debugging-hooks',
    },
    {
      title: 'Vue 生命周期指南',
      url: 'https://cn.vuejs.org/guide/essentials/lifecycle.html',
    },
    {
      title: 'Vue 组合式函数使用限制',
      url: 'https://cn.vuejs.org/guide/reusability/composables.html#usage-restrictions',
    },
    {
      title: 'Vue KeepAlive 缓存实例生命周期',
      url: 'https://cn.vuejs.org/guide/built-ins/keep-alive.html#lifecycle-of-cached-instance',
    },
    {
      title: 'Vue SSR 组件生命周期钩子',
      url: 'https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks',
    },
    {
      title: 'Vue 3.5.40 apiLifecycle.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiLifecycle.ts',
    },
    {
      title: 'Vue 3.5.40 renderer.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts',
    },
    {
      title: 'Vue 3.5.40 KeepAlive.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-02',
  anchors: [
    '概述',
    '六个核心钩子的签名',
    '六个核心钩子的时机',
    '注册时机的约束',
    'onRenderTracked()',
    'onRenderTriggered()',
    '易错使用提示',
    'SSR 与 KeepAlive 边界',
    '错误捕获',
    '最小源码实现',
  ],
})

export default defineReference({
  meta,
  signature: `function onMounted(callback: () => void, target?: ComponentInternalInstance | null): void
function onRenderTracked(callback: DebuggerHook, target?: ComponentInternalInstance | null): void
function onRenderTriggered(callback: DebuggerHook, target?: ComponentInternalInstance | null): void`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '每个组件实例都会经历创建、挂载、更新和卸载。组合式 API 用 `onXxx()` 在对应阶段注册回调：挂载前后使用 `onBeforeMount` / `onMounted`，更新前后使用 `onBeforeUpdate` / `onUpdated`，卸载前后使用 `onBeforeUnmount` / `onUnmounted`。',
    },
    { type: 'heading', content: '六个核心钩子的签名' },
    {
      type: 'code',
      lang: 'ts',
      content: `type LifecycleCallback = () => void
type LifecycleTarget = ComponentInternalInstance | null

function onBeforeMount(callback: LifecycleCallback, target?: LifecycleTarget): void
function onMounted(callback: LifecycleCallback, target?: LifecycleTarget): void
function onBeforeUpdate(callback: LifecycleCallback, target?: LifecycleTarget): void
function onUpdated(callback: LifecycleCallback, target?: LifecycleTarget): void
function onBeforeUnmount(callback: LifecycleCallback, target?: LifecycleTarget): void
function onUnmounted(callback: LifecycleCallback, target?: LifecycleTarget): void`,
    },
    { type: 'heading', content: '六个核心钩子的时机' },
    {
      type: 'table',
      headers: ['钩子', '调用时机', '典型用途'],
      rows: [
        ['onBeforeMount', '首次 DOM 渲染开始前，DOM 节点尚未创建', '挂载前准备'],
        ['onMounted', '自身 DOM 已插入父容器，所有同步子组件已挂载', '访问 DOM、启动客户端副作用'],
        ['onBeforeUpdate', '响应式状态变化后、组件 DOM 更新前', '读取更新前的 DOM 状态'],
        ['onUpdated', '本组件 DOM 更新后，且晚于子组件的 updated', '读取更新后的 DOM'],
        ['onBeforeUnmount', '卸载开始前，组件实例仍保持完整功能', '执行卸载前操作'],
        [
          'onUnmounted',
          '子组件已卸载，组件作用域内的响应式 effect 已停止',
          '清理计时器、DOM 监听和连接',
        ],
      ],
    },
    {
      type: 'text',
      content:
        '`onMounted` 只等待同步子组件，不等待异步组件或 `<Suspense>` 树；只有应用根容器本身位于 document 中时，才能保证组件 DOM 也已进入 document。`onUnmounted` 自动停止的是渲染 effect 以及 setup 中创建的 computed 和 watcher，计时器、DOM 事件监听、服务器连接等仍需手工清理。',
    },
    {
      type: 'demo',
      id: 'vue.core.reference.composition.lifecycle.lifecycle-hooks-demo',
      description: '挂载、更新和卸载一个子组件，观察六个核心钩子的调用顺序',
      playground: true,
    },
    { type: 'heading', content: '注册时机的约束' },
    {
      type: 'text',
      content:
        '生命周期钩子通常必须在 `setup()` 的同步调用栈中注册，Vue 才能把回调关联到当前组件实例。钩子可以写在外部组合式函数中，只要该函数仍由 setup 同步调用。普通 `async setup()` 在恢复执行时已失去该上下文；`<script setup>` 的顶层 await 是明确例外，编译器会在异步操作后恢复当前实例。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 普通 setup：同步注册
onMounted(() => startFeature())

// 错误：定时回调运行时已经没有当前组件实例
setTimeout(() => {
  onMounted(() => startLateFeature())
}, 100)

// <script setup> 顶层 await：编译器会恢复当前实例
const data = await loadData()
onMounted(() => useData(data))`,
    },
    { type: 'heading', content: 'onRenderTracked()' },
    {
      type: 'code',
      lang: 'ts',
      content: `type DebuggerHook = (event: DebuggerEvent) => void

// 注册组件渲染依赖追踪调试钩子
function onRenderTracked(
  callback: DebuggerHook,
  target?: ComponentInternalInstance | null,
): void`,
    },
    {
      type: 'text',
      content:
        '`onRenderTracked()` 在组件渲染期间读取响应式依赖并被渲染 effect 追踪时调用。事件的 `type` 可能是 `get`、`has` 或 `iterate`，适合用来回答“这次渲染为什么依赖了这个属性”。该钩子仅在开发环境可用，服务端渲染期间不会调用。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `onRenderTracked((event) => {
  console.debug('render tracked', event.type, event.key)
  debugger
})`,
    },
    { type: 'heading', content: 'onRenderTriggered()' },
    {
      type: 'code',
      lang: 'ts',
      content: `type DebuggerHook = (event: DebuggerEvent) => void

// 注册组件渲染依赖触发调试钩子
function onRenderTriggered(
  callback: DebuggerHook,
  target?: ComponentInternalInstance | null,
): void`,
    },
    {
      type: 'text',
      content:
        '`onRenderTriggered()` 在响应式依赖发生变化并触发组件渲染 effect 时调用，适合定位“哪次写操作让组件准备更新”。事件的 `type` 可能是 `set`、`add`、`delete` 或 `clear`。它同样仅在开发环境可用，服务端渲染期间不会调用。',
    },
    {
      type: 'table',
      headers: ['DebuggerEvent 字段', '含义'],
      rows: [
        ['effect', '本次追踪或触发关联的响应式 effect'],
        ['target', '被追踪或修改的原始响应式目标对象'],
        ['type', '追踪操作或触发操作的类型'],
        ['key', '相关属性或集合键；部分集合操作可能没有 key'],
        ['newValue', 'set 或 add 等操作的新值；并非所有事件都有'],
        ['oldValue', 'set 或 delete 等操作的旧值；并非所有事件都有'],
        ['oldTarget', '集合 clear 前的旧集合快照；仅相关事件可能提供'],
      ],
    },
    {
      type: 'text',
      content:
        'tracked 与 triggered 事件并非一一对应：一次渲染可以读取多个依赖，而一次状态修改也可能触发多个 effect。调试钩子报告的是依赖追踪与触发过程，不会改变 Vue 对组件更新的调度和批处理。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `onRenderTriggered((event) => {
  console.debug('render triggered', {
    type: event.type,
    key: event.key,
    oldValue: event.oldValue,
    newValue: event.newValue,
  })
  debugger
})`,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '在异步恢复后才注册生命周期钩子',
          description:
            '生命周期 API 依赖当前 active component instance。`setTimeout()`、Promise 回调或普通 `async setup()` 的 await 续体通常已离开 setup 的同步调用栈，Vue 无法再把钩子关联到原实例。',
          consequence:
            '开发环境警告“没有 active component instance”，钩子没有登记，挂载或卸载时不会执行。',
          wrong: {
            lang: 'ts',
            content: 'setTimeout(() => {\n  onMounted(startClientFeature)\n}, 100)',
          },
          correct: {
            lang: 'ts',
            content:
              'const settings = ref<Settings>()\nonMounted(startClientFeature)\nvoid loadSettings().then((value) => (settings.value = value))',
          },
        },
        {
          title: '认为父组件 `onMounted()` 已等待所有异步子树且一定进入 document',
          description:
            '`onMounted()` 只保证同步子组件已经挂载；不包含异步组件或 Suspense 子树。组件 DOM 只有在应用根容器本身位于 document 时才保证 in-document。',
          consequence:
            '异步子组件 ref 仍为 null，调用方法时报错；挂在脱离 document 的容器时，几何或焦点操作没有预期结果。',
          wrong: {
            lang: 'ts',
            content: 'onMounted(() => {\n  asyncChild.value.measure()\n})',
          },
          correct: {
            lang: 'ts',
            content:
              'function handleChildReady(child: ChildPublicApi) {\n  child.measure()\n}\n\nonMounted(() => {\n  if (root.value?.isConnected) measureRoot(root.value)\n})',
          },
        },
        {
          title: '把 KeepAlive 钩子只当作“缓存切换”通知',
          description:
            '误以为 `onActivated()` 不会在首次挂载调用，或 `onDeactivated()` 不会在最终卸载调用。官方还说明，这两个钩子同时作用于缓存树中的后代组件。',
          consequence:
            '同一订阅初始化两次、最终卸载时漏清理，或后代组件重复执行本以为只属于缓存根节点的逻辑。',
          wrong: {
            lang: 'ts',
            content:
              'onMounted(() => subscribe())\nonActivated(() => subscribe())\nonUnmounted(() => unsubscribe())',
          },
          correct: {
            lang: 'ts',
            content:
              'let stopSubscription: (() => void) | undefined\n\nonActivated(() => {\n  stopSubscription ??= subscribe()\n})\n\nonDeactivated(() => {\n  stopSubscription?.()\n  stopSubscription = undefined\n})',
          },
        },
        {
          title: '在 SSR 中等待 `onMounted()` 加载数据',
          description:
            '服务端渲染不会调用 beforeMount、mounted、beforeUpdate、updated、beforeUnmount 和 unmounted 这些客户端生命周期钩子。',
          consequence:
            '服务端输出缺少数据，客户端水合后才发起请求，容易出现空内容或服务端与客户端结果不一致。',
          wrong: {
            lang: 'ts',
            content: 'onMounted(async () => {\n  article.value = await loadArticle()\n})',
          },
          correct: {
            lang: 'ts',
            content:
              'onServerPrefetch(async () => {\n  article.value = await loadArticle()\n})\n\nonMounted(() => {\n  startBrowserOnlyFeature()\n})',
          },
        },
        {
          title: '在 `onUpdated()` 中继续修改本组件状态',
          description:
            '`onUpdated()` 会在本组件 DOM 更新后执行。若回调再修改会影响渲染的状态，就会立即排队下一次更新。',
          consequence: '组件反复渲染并进入无限更新循环，浏览器卡顿且 Vue 报告递归更新错误。',
          wrong: {
            lang: 'ts',
            content: 'onUpdated(() => {\n  count.value++\n})',
          },
          correct: {
            lang: 'ts',
            content:
              'function increment() {\n  count.value++\n}\n\n// 只需等特定状态的 DOM 时，在修改后就地等待\nawait nextTick()\nmeasureResult()',
          },
        },
        {
          title: '以为组件卸载会自动清理所有外部资源',
          description:
            '组件 scope 会停止 setup 中创建的渲染 effect、computed 和 watcher，但浏览器计时器、手工 DOM 监听、WebSocket 等不属于 Vue 的资源不会自动停止。',
          consequence:
            '组件离开后回调仍执行，反复进入页面会累积多份监听与连接，造成重复逻辑和资源泄漏。',
          wrong: {
            lang: 'ts',
            content:
              "onMounted(() => {\n  window.addEventListener('resize', updateLayout)\n  setInterval(refreshData, 5000)\n})",
          },
          correct: {
            lang: 'ts',
            content:
              "let timer: ReturnType<typeof setInterval>\n\nonMounted(() => {\n  window.addEventListener('resize', updateLayout)\n  timer = setInterval(refreshData, 5000)\n})\n\nonUnmounted(() => {\n  window.removeEventListener('resize', updateLayout)\n  clearInterval(timer)\n})",
          },
        },
        {
          title: '混淆 tracked 与 triggered 的含义',
          description:
            '`onRenderTracked()` 记录渲染读取并订阅了哪些依赖，`onRenderTriggered()` 记录哪次依赖变化触发了渲染 effect；两类事件不会一一对应。',
          consequence:
            '把依赖读取误判为状态写入，或只看一次 triggered 就断定组件只依赖一个属性，导致定位方向错误。',
          wrong: {
            lang: 'ts',
            content:
              "onRenderTracked((event) => {\n  console.log('修改组件状态的来源', event.key)\n})",
          },
          correct: {
            lang: 'ts',
            content:
              "onRenderTracked((event) => console.log('渲染读取', event.key))\nonRenderTriggered((event) => console.log('更新触发', event.key))",
          },
        },
        {
          title: '在渲染调试钩子中修改参与渲染的状态',
          description:
            '调试钩子运行在依赖追踪或触发链路中。若回调又修改组件渲染所依赖的状态，会干扰正在观察的过程并继续触发更新。',
          consequence: '调试输出被额外写操作污染，严重时形成递归更新，无法再还原原始触发原因。',
          wrong: {
            lang: 'ts',
            content: 'onRenderTriggered(() => {\n  count.value++\n})',
          },
          correct: {
            lang: 'ts',
            content:
              "onRenderTriggered((event) => {\n  console.debug('只读检查', event.type, event.key)\n  debugger\n})",
          },
        },
        {
          title: '依赖渲染调试钩子在生产环境或 SSR 中执行',
          description:
            '`onRenderTracked()` 和 `onRenderTriggered()` 是仅开发环境可用的调试 API，服务端渲染期间也不会调用。',
          consequence: '放在钩子中的业务逻辑、日志上报或状态初始化在线上或 SSR 路径中完全不执行。',
          wrong: {
            lang: 'ts',
            content: 'onRenderTriggered(() => sendRequiredAuditLog())',
          },
          correct: {
            lang: 'ts',
            content:
              'watch(source, () => sendRequiredAuditLog())\n\n// 渲染调试钩子只用于本地诊断\nonRenderTriggered((event) => console.debug(event))',
          },
        },
        {
          title: '把 DebuggerEvent 的 target 和 key 当作稳定业务接口',
          description:
            '`target` 是用于诊断的原始响应式目标，`key` 还会随对象、数组与集合操作而变化；这些字段描述内部依赖事件，不是业务事件契约。',
          consequence:
            '长期保存原始 target 会绕开代理边界；业务逻辑还会与 Vue 的调试事件形态耦合，难以维护。',
          wrong: {
            lang: 'ts',
            content: 'onRenderTracked((event) => storedTargets.add(event.target))',
          },
          correct: {
            lang: 'ts',
            content:
              "onRenderTracked((event) => {\n  console.debug('临时诊断', event.type, event.key)\n})",
          },
        },
      ],
    },
    { type: 'heading', content: 'SSR 与 KeepAlive 边界' },
    {
      type: 'text',
      content:
        '服务端渲染不会调用 onBeforeMount、onMounted、onBeforeUpdate、onUpdated、onBeforeUnmount 和 onUnmounted；需要在服务端渲染前等待异步数据时使用 `onServerPrefetch()`。DOM 相关副作用应放进 onMounted，确保只在客户端执行。',
    },
    {
      type: 'text',
      content:
        '`onActivated` / `onDeactivated` 用于 `<KeepAlive>` 缓存树。onActivated 在首次挂载和每次重新插入 DOM 时调用；onDeactivated 在移入缓存和最终卸载时调用。这两个钩子也会作用于缓存根组件的后代。源码会包装失活分支检查，并把钩子登记到祖先 KeepAlive root，因此它们并非六个核心钩子的简单别名。',
    },
    { type: 'heading', content: '错误捕获' },
    {
      type: 'text',
      content:
        '`onErrorCaptured` 捕获后代组件在渲染、事件处理、生命周期、setup、侦听器、自定义指令和过渡钩子中抛出的错误。回调收到 `(err, instance, info)`；开发环境的 info 是错误来源字符串，生产环境则是缩短代码。错误默认从下向上经过各级捕获钩子并送达 `app.config.errorHandler`，返回 false 可停止继续传播。若捕获钩子自身抛错，新错误和原错误都会送达应用级处理器。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { onErrorCaptured, ref } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err, _instance, info) => {
  error.value = err as Error
  console.error(info)
  return false // 已处理：阻止其他捕获钩子和全局 errorHandler 再收到原错误
})`,
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        '六个核心钩子由同一个 `createHook(type)` 工厂生成。它在客户端 setup 中把回调交给 `injectHook`，后者暂停依赖追踪、恢复目标实例并统一处理回调错误，再把包装后的函数加入实例对应的钩子数组。SSR setup 中除 SERVER_PREFETCH 外不会登记这些钩子。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/core v3.5.40 packages/runtime-core/src/apiLifecycle.ts
// 省略暂停依赖追踪、恢复实例上下文与异步错误处理包装
export function injectHook(
  type: LifecycleHooks,
  hook: Function,
  target: ComponentInternalInstance | null = currentInstance,
) {
  if (!target) {
    console.warn('生命周期注入 API 只能在 setup() 执行期间使用')
    return
  }

  const hooks = target[type] || (target[type] = [])
  const wrappedHook = (...args: unknown[]) => hook(...args)
  hooks.push(wrappedHook)
}

const createHook =
  (lifecycle: LifecycleHooks) =>
  (hook: () => void, target: ComponentInternalInstance | null = currentInstance) => {
    if (!isInSSRComponentSetup || lifecycle === LifecycleHooks.SERVER_PREFETCH) {
      injectHook(lifecycle, hook, target)
    }
  }

export const onMounted = createHook(LifecycleHooks.MOUNTED)
export const onUpdated = createHook(LifecycleHooks.UPDATED)
export const onUnmounted = createHook(LifecycleHooks.UNMOUNTED)`,
    },
    {
      type: 'text',
      content:
        '`onRenderTracked` 与 `onRenderTriggered` 也由 `createHook()` 注册，分别写入组件实例的 RENDER_TRACKED 与 RENDER_TRIGGERED 钩子数组。renderer 仅在开发分支把组件渲染 effect 的 `onTrack` / `onTrigger` 转发给这些数组，因此它们不是生产运行时能力。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 注册渲染依赖追踪钩子
export const onRenderTracked = createHook<DebuggerHook>(LifecycleHooks.RENDER_TRACKED)

// 注册渲染依赖触发钩子
export const onRenderTriggered = createHook<DebuggerHook>(LifecycleHooks.RENDER_TRIGGERED)

if (__DEV__) {
  effect.onTrack = instance.rtc
    ? (event) => invokeArrayFns(instance.rtc, event)
    : undefined
  effect.onTrigger = instance.rtg
    ? (event) => invokeArrayFns(instance.rtg, event)
    : undefined
}`,
    },
  ],
})
