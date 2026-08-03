/**
 * 知识点：defineAsyncComponent()
 * 查证来源（2026-07-29）：
 * - https://cn.vuejs.org/api/general.html#defineasynccomponent
 * - https://cn.vuejs.org/guide/components/async.html
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiAsyncComponent.spec.ts
 * 查证工具：Tavily（套餐用量上限，已回退）、Vue 官方文档、源码与官方测试
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.application.define-async-component',
  type: 'reference',
  title: 'defineAsyncComponent()',
  summary: '用 loader 延迟加载组件，并正确处理 loading、错误、超时、重试与 Suspense 边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'application',
  related: [
    'vue.core.reference.application.define-component',
    'vue.core.reference.built-ins.suspense',
    'vue.core.reference.built-ins.keep-alive',
  ],
  tags: ['defineAsyncComponent', 'loader', 'loadingComponent', 'errorComponent', 'Suspense'],
  sources: [
    {
      title: 'Vue 通用 API：defineAsyncComponent',
      url: 'https://cn.vuejs.org/api/general.html#defineasynccomponent',
    },
    {
      title: 'Vue 异步组件指南',
      url: 'https://cn.vuejs.org/guide/components/async.html',
    },
    {
      title: 'Vue 3.5.40 apiAsyncComponent.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts',
    },
    {
      title: 'Vue 3.5.40 异步组件官方测试',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiAsyncComponent.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-29',
  anchors: [
    '概述',
    '加载与错误状态',
    '重试与 Suspense',
    'Vue 3.5 版本能力',
    '易错使用提示',
    '最小源码实现',
  ],
})

export default defineReference({
  meta,
  signature: `function defineAsyncComponent(
  source: AsyncComponentLoader | AsyncComponentOptions
): Component

interface AsyncComponentOptions {
  loader: AsyncComponentLoader
  loadingComponent?: Component
  errorComponent?: Component
  delay?: number
  timeout?: number
  suspensible?: boolean
  hydrate?: HydrationStrategy
  onError?: (error: Error, retry: () => void, fail: () => void, attempts: number) => void
}`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '`defineAsyncComponent()` 接收 loader 函数或选项对象，返回一个异步组件外壳。只有外壳真正被渲染时，Vue 才调用 loader；与动态 `import()` 配合时，打包器可以把真实组件拆成按需加载的独立 chunk。加载结果会缓存在该外壳定义上，多次挂载同一个定义不会重复请求。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: "const AsyncReport = defineAsyncComponent(() => import('./ReportPanel.vue'))",
    },
    { type: 'heading', content: '加载与错误状态' },
    {
      type: 'text',
      content:
        '`loadingComponent` 默认延迟 200ms 显示，避免快速请求造成闪烁；`timeout` 默认未设置，不会自动超时。loader reject 或 timeout 后，配置的 `errorComponent` 会收到 `error` prop。错误仍进入 Vue 的应用错误处理流程，因此用户可见错误界面与日志上报应分别安排。',
    },
    {
      type: 'demo',
      id: 'vue.core.reference.application.define-async-component.async-component-demo',
      description: '每次操作创建新的异步组件定义，真实演示 delay、loading、成功与失败分支',
      playground: true,
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const AsyncReport = defineAsyncComponent({
  loader: () => import('./ReportPanel.vue'),
  loadingComponent: LoadingPanel,
  errorComponent: LoadError,
  delay: 200,
  timeout: 10_000,
})`,
    },
    { type: 'heading', content: '重试与 Suspense' },
    {
      type: 'text',
      content:
        '`onError` 必须调用 `retry()` 或 `fail()`，返回布尔值不会结束等待。`suspensible` 默认 true；位于 Suspense 内时，边界接管 `loadingComponent`、`delay` 和 `timeout`，但 Vue 3.5.40 在 loader reject 后仍可渲染异步组件自己的 `errorComponent`。需要完整使用本地加载状态时设置 `suspensible: false`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const AsyncReport = defineAsyncComponent({
  loader: () => import('./ReportPanel.vue'),
  /** 对临时网络错误最多重试两次。 */
  onError(error, retry, fail, attempts) {
    if (error instanceof TypeError && attempts <= 2) retry()
    else fail()
  },
})`,
    },
    { type: 'heading', content: 'Vue 3.5 版本能力' },
    {
      type: 'text',
      content:
        'Vue 3.5+ 的 `hydrate` 选项只用于服务端渲染后的懒水合策略，例如 `hydrateOnVisible()`。它决定服务器 HTML 何时开始接管交互，不等同于客户端组件何时下载，也不影响普通 CSR 项目的 loader 懒加载语义。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把 import() Promise 直接传入',
          description:
            'API 需要返回 Promise 的 loader 函数或包含 loader 的选项对象；直接执行 import 会立刻请求。',
          consequence: '失去渲染时才加载的语义，绕过类型检查时还会因 loader 不是函数而失败。',
          wrong: {
            lang: 'ts',
            content: "const AdminPanel = defineAsyncComponent(import('./AdminPanel.vue'))",
          },
          correct: {
            lang: 'ts',
            content: "const AdminPanel = defineAsyncComponent(() => import('./AdminPanel.vue'))",
          },
        },
        {
          title: '期待 loading 立即出现或期待默认超时',
          description: 'loading 默认延迟 200ms，timeout 默认 undefined；两者都需要按体验显式配置。',
          consequence:
            '前 200ms 可能只有空占位；loader 永不 settle 且未设 timeout 时，页面会一直等待。',
          wrong: {
            lang: 'ts',
            content:
              "defineAsyncComponent({\n  loader: () => import('./Report.vue'),\n  loadingComponent: LoadingPanel,\n})",
          },
          correct: {
            lang: 'ts',
            content:
              "defineAsyncComponent({\n  loader: () => import('./Report.vue'),\n  loadingComponent: LoadingPanel,\n  delay: 0,\n  errorComponent: LoadError,\n  timeout: 10_000,\n})",
          },
        },
        {
          title: 'loader 失败时没有提供可见错误状态',
          description:
            'reject 会进入应用错误处理流程；只有配置 errorComponent 才会在异步组件位置渲染错误 UI。',
          consequence: '日志可能收到错误，但用户只看到空占位，也没有失败原因或重试入口。',
          wrong: {
            lang: 'ts',
            content: "const Settings = defineAsyncComponent(() => import('./Settings.vue'))",
          },
          correct: {
            lang: 'ts',
            content:
              "const Settings = defineAsyncComponent({\n  loader: () => import('./Settings.vue'),\n  errorComponent: SettingsLoadError,\n})",
          },
        },
        {
          title: '在 onError 中返回布尔值',
          description:
            'onError 不是判定函数；只有调用 retry 或 fail 才会让 Vue 创建的等待 Promise 继续 settle。',
          consequence:
            '两个回调都不调用时，组件永久 pending，loading 或 Suspense fallback 不会退出。',
          wrong: {
            lang: 'ts',
            content: 'onError(error, retry, fail, attempts) {\n  return attempts <= 3\n}',
          },
          correct: {
            lang: 'ts',
            content:
              'onError(error, retry, fail, attempts) {\n  if (error instanceof TypeError && attempts <= 3) retry()\n  else fail()\n}',
          },
        },
        {
          title: '在 Suspense 内期待本地 loading、delay 和 timeout 生效',
          description:
            '默认 suspensible 模式由边界控制加载状态；errorComponent 在 Vue 3.5.40 的 reject 分支仍可渲染。',
          consequence:
            '页面显示 Suspense fallback，本地 timeout 不触发；错误组件是否存在则仍决定 reject 后的可见反馈。',
          wrong: {
            lang: 'ts',
            content:
              'defineAsyncComponent({\n  loader: loadPanel,\n  loadingComponent: LocalLoading,\n  delay: 0,\n  timeout: 3000,\n})',
          },
          correct: {
            lang: 'ts',
            content:
              'defineAsyncComponent({\n  loader: loadPanel,\n  loadingComponent: LocalLoading,\n  errorComponent: LocalError,\n  delay: 0,\n  timeout: 3000,\n  suspensible: false,\n})',
          },
        },
      ],
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        '外壳维护共享的 pending 请求和已解析组件。普通客户端分支用 loaded、error、delayed 三个 ref 驱动渲染；Suspense 分支直接返回 loader Promise。retry 会清空 pending 请求并重新调用 loader，成功结果则缓存到外壳定义。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/core v3.5.40 apiAsyncComponent.ts
/** 创建带请求去重和结果缓存的异步组件外壳。 */
export function defineAsyncComponent(source: AsyncComponentLoader | AsyncComponentOptions) {
  if (isFunction(source)) source = { loader: source }
  const { loader, loadingComponent, errorComponent, delay = 200, timeout, onError } = source
  let pendingRequest: Promise<ConcreteComponent> | null = null
  let resolvedComponent: ConcreteComponent | undefined

  /** 执行 loader，并按 onError 的决定重试或失败。 */
  function load(): Promise<ConcreteComponent> {
    if (pendingRequest) return pendingRequest
    pendingRequest = loader().catch((error) => {
      if (!onError) throw error
      return new Promise((resolve, reject) => {
        onError(error, () => { pendingRequest = null; resolve(load()) }, reject, 1)
      })
    })
    return pendingRequest.then((component) => (resolvedComponent = component))
  }

  return defineComponent({
    /** 建立异步组件的本地加载状态。 */
    setup() {
      const loaded = ref(false)
      const error = ref<Error>()
      const delayed = ref(!!delay)
      if (delay) setTimeout(() => (delayed.value = false), delay)
      if (timeout != null) startTimeout(timeout, error)
      load().then(() => (loaded.value = true)).catch((reason) => (error.value = reason))

      return () => {
        if (loaded.value && resolvedComponent) return createInnerComp(resolvedComponent)
        if (error.value && errorComponent) return createVNode(errorComponent, { error: error.value })
        if (loadingComponent && !delayed.value) return createVNode(loadingComponent)
        return null
      }
    },
  })
}`,
    },
  ],
})
