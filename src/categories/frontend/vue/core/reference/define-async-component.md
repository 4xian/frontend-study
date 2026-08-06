---
id: vue.core.reference.application.define-async-component
type: reference
title: defineAsyncComponent()
summary: 用 loader 延迟加载组件，并正确处理 loading、错误、超时、重试与 Suspense 边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.application.define-component
  - vue.core.reference.built-ins.suspense
  - vue.core.reference.built-ins.keep-alive
tags:
  - defineAsyncComponent
  - loader
  - loadingComponent
  - errorComponent
  - Suspense
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-29
sources:
  - title: Vue 通用 API：defineAsyncComponent
    url: https://cn.vuejs.org/api/general.html#defineasynccomponent
  - title: Vue 异步组件指南
    url: https://cn.vuejs.org/guide/components/async.html
  - title: Vue 3.5.40 apiAsyncComponent.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts
  - title: Vue 3.5.40 异步组件官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiAsyncComponent.spec.ts
group: application
signature: |-
  function defineAsyncComponent(
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
  }
anchors:
  - 概述
  - 加载与错误状态
  - 重试与 Suspense
  - Vue 3.5 版本能力
  - 易错使用提示
  - 最小源码实现
---

# defineAsyncComponent()

## 概述

`defineAsyncComponent()` 接收 loader 函数或选项对象，返回一个异步组件外壳。只有外壳真正被渲染时，Vue 才调用 loader；与动态 `import()` 配合时，打包器可以把真实组件拆成按需加载的独立 chunk。加载结果会缓存在该外壳定义上，多次挂载同一个定义不会重复请求。

~~~~ts
const AsyncReport = defineAsyncComponent(() => import('./ReportPanel.vue'))
~~~~

## 加载与错误状态

`loadingComponent` 默认延迟 200ms 显示，避免快速请求造成闪烁；`timeout` 默认未设置，不会自动超时。loader reject 或 timeout 后，配置的 `errorComponent` 会收到 `error` prop。错误仍进入 Vue 的应用错误处理流程，因此用户可见错误界面与日志上报应分别安排。

:::demo{id="vue.core.reference.application.define-async-component.async-component-demo" playground="true"}
每次操作创建新的异步组件定义，真实演示 delay、loading、成功与失败分支
:::

~~~~ts
const AsyncReport = defineAsyncComponent({
  loader: () => import('./ReportPanel.vue'),
  loadingComponent: LoadingPanel,
  errorComponent: LoadError,
  delay: 200,
  timeout: 10_000,
})
~~~~

## 重试与 Suspense

`onError` 必须调用 `retry()` 或 `fail()`，返回布尔值不会结束等待。`suspensible` 默认 true；位于 Suspense 内时，边界接管 `loadingComponent`、`delay` 和 `timeout`，但 Vue 3.5.40 在 loader reject 后仍可渲染异步组件自己的 `errorComponent`。需要完整使用本地加载状态时设置 `suspensible: false`。

~~~~ts
const AsyncReport = defineAsyncComponent({
  loader: () => import('./ReportPanel.vue'),
  /** 对临时网络错误最多重试两次。 */
  onError(error, retry, fail, attempts) {
    if (error instanceof TypeError && attempts <= 2) retry()
    else fail()
  },
})
~~~~

## Vue 3.5 版本能力

Vue 3.5+ 的 `hydrate` 选项只用于服务端渲染后的懒水合策略，例如 `hydrateOnVisible()`。它决定服务器 HTML 何时开始接管交互，不等同于客户端组件何时下载，也不影响普通 CSR 项目的 loader 懒加载语义。

## 易错使用提示

:::pitfalls
### 把 import() Promise 直接传入

**触发条件：** 把 import() Promise 直接传入

**原因：** API 需要返回 Promise 的 loader 函数或包含 loader 的选项对象；直接执行 import 会立刻请求。

**后果：** 失去渲染时才加载的语义，绕过类型检查时还会因 loader 不是函数而失败。

**错误示例：**

~~~~ts
const AdminPanel = defineAsyncComponent(import('./AdminPanel.vue'))
~~~~

**正确写法：**

~~~~ts
const AdminPanel = defineAsyncComponent(() => import('./AdminPanel.vue'))
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待 loading 立即出现或期待默认超时

**触发条件：** 期待 loading 立即出现或期待默认超时

**原因：** loading 默认延迟 200ms，timeout 默认 undefined；两者都需要按体验显式配置。

**后果：** 前 200ms 可能只有空占位；loader 永不 settle 且未设 timeout 时，页面会一直等待。

**错误示例：**

~~~~ts
defineAsyncComponent({
  loader: () => import('./Report.vue'),
  loadingComponent: LoadingPanel,
})
~~~~

**正确写法：**

~~~~ts
defineAsyncComponent({
  loader: () => import('./Report.vue'),
  loadingComponent: LoadingPanel,
  delay: 0,
  errorComponent: LoadError,
  timeout: 10_000,
})
~~~~

**验证方式：** 对照正确写法验证结果。

### loader 失败时没有提供可见错误状态

**触发条件：** loader 失败时没有提供可见错误状态

**原因：** reject 会进入应用错误处理流程；只有配置 errorComponent 才会在异步组件位置渲染错误 UI。

**后果：** 日志可能收到错误，但用户只看到空占位，也没有失败原因或重试入口。

**错误示例：**

~~~~ts
const Settings = defineAsyncComponent(() => import('./Settings.vue'))
~~~~

**正确写法：**

~~~~ts
const Settings = defineAsyncComponent({
  loader: () => import('./Settings.vue'),
  errorComponent: SettingsLoadError,
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 onError 中返回布尔值

**触发条件：** 在 onError 中返回布尔值

**原因：** onError 不是判定函数；只有调用 retry 或 fail 才会让 Vue 创建的等待 Promise 继续 settle。

**后果：** 两个回调都不调用时，组件永久 pending，loading 或 Suspense fallback 不会退出。

**错误示例：**

~~~~ts
onError(error, retry, fail, attempts) {
  return attempts <= 3
}
~~~~

**正确写法：**

~~~~ts
onError(error, retry, fail, attempts) {
  if (error instanceof TypeError && attempts <= 3) retry()
  else fail()
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 Suspense 内期待本地 loading、delay 和 timeout 生效

**触发条件：** 在 Suspense 内期待本地 loading、delay 和 timeout 生效

**原因：** 默认 suspensible 模式由边界控制加载状态；errorComponent 在 Vue 3.5.40 的 reject 分支仍可渲染。

**后果：** 页面显示 Suspense fallback，本地 timeout 不触发；错误组件是否存在则仍决定 reject 后的可见反馈。

**错误示例：**

~~~~ts
defineAsyncComponent({
  loader: loadPanel,
  loadingComponent: LocalLoading,
  delay: 0,
  timeout: 3000,
})
~~~~

**正确写法：**

~~~~ts
defineAsyncComponent({
  loader: loadPanel,
  loadingComponent: LocalLoading,
  errorComponent: LocalError,
  delay: 0,
  timeout: 3000,
  suspensible: false,
})
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 最小源码实现

外壳维护共享的 pending 请求和已解析组件。普通客户端分支用 loaded、error、delayed 三个 ref 驱动渲染；Suspense 分支直接返回 loader Promise。retry 会清空 pending 请求并重新调用 loader，成功结果则缓存到外壳定义。

~~~~ts
// 精简自 vuejs/core v3.5.40 apiAsyncComponent.ts
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
}
~~~~
