---
id: vue.core.reference.application.create-ssr-app
type: reference
title: createSSRApp()
summary: 创建用于服务端渲染与客户端激活的应用实例，保留 createApp() 的配置方式并让客户端 mount() 接管既有 HTML
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.application.create-app
  - vue.core.reference.composition.use-id
  - vue.core.learn.advanced.ssr-hydration
tags:
  - createSSRApp
  - SSR
  - hydration
  - 服务端渲染
  - 应用实例
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-02
sources:
  - title: Vue 应用实例 API：createSSRApp
    url: https://cn.vuejs.org/api/application.html#createssrapp
  - title: Vue SSR 指南：基础教程与客户端激活
    url: https://cn.vuejs.org/guide/scaling-up/ssr.html#basic-tutorial
  - title: Vue SSR 指南：跨请求状态污染
    url: https://cn.vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution
  - title: Vue 3.5.40 runtime-dom SSR 应用入口
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/index.ts
  - title: Vue 3.5.40 server-renderer 官方测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/server-renderer/__tests__/render.spec.ts
group: application
signature: |-
  function createSSRApp(
    rootComponent: Component,
    rootProps?: Record<string, unknown> | null,
  ): App<Element>
anchors:
  - 概述
  - 服务端渲染与客户端激活
  - 每个请求创建独立应用
  - 易错使用提示
  - 源码推导与适用场景
---

# createSSRApp()

## 一、概述

`createSSRApp()` 从 Vue 3.0 起可用，用于创建 SSR 应用实例。它接收的根组件、根 props 以及挂载前的 `use()`、`provide()` 和 `app.config` 配置方式都与 `createApp()` 相同；关键差别发生在浏览器端的 `mount()`：它会激活服务端已经输出的 HTML，而不是清空容器后重新渲染。

:::tip
`createSSRApp()` 只是应用入口。服务端仍要使用 `vue/server-renderer` 的渲染 API，客户端仍要加载入口脚本；数据序列化、路由就绪和 hydration mismatch 也需要应用或 SSR 框架单独处理。
:::

## 二、服务端渲染与客户端激活

服务端把新建的 app 交给 `renderToString()` 或流式 renderer 生成 HTML；浏览器使用同一个应用工厂重新创建 app，再对包含该 HTML 的容器调用 `mount()`。两端必须产生相同的组件结构与初始状态，客户端才能复用已有 DOM 并绑定响应性和事件。

~~~~ts
// app.ts
import { createSSRApp } from 'vue'
import App from './App.vue'

/** 为一次服务端渲染或一次客户端激活创建全新的应用。 */
export function createMyApp() {
  const app = createSSRApp(App)
  app.provide('apiBaseUrl', '/api')
  return app
}

// entry-server.ts
import { renderToString } from 'vue/server-renderer'

/** 为当前请求生成应用 HTML。 */
export async function render() {
  return renderToString(createMyApp())
}

// entry-client.ts
createMyApp().mount('#app')
~~~~

| 阶段 | createSSRApp() 的职责 | 仍需应用负责 |
| --- | --- | --- |
| 服务端 | 创建可交给 server renderer 的 app | 按请求准备状态并调用 renderer |
| 传输 | 没有自动序列化能力 | 安全嵌入初始状态与资源链接 |
| 客户端 | 让 mount() 进入 hydration | 用一致结构和状态创建 app |

## 三、每个请求创建独立应用

SSR 服务进程通常会复用同一份模块。如果把 app、router、store 或用户状态放在模块顶层，后续请求可能读到前一位用户留下的数据。应用工厂应在每个请求中创建这些有状态对象；浏览器端同样调用该工厂，但只创建当前页面所需的客户端实例。

~~~~ts
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

/** 为单个 SSR 请求隔离应用与状态容器。 */
export function createMyApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia)
  return { app, pinia }
}
~~~~

## 四、易错使用提示

:::pitfalls
### 服务端已有 HTML，客户端却使用 createApp()

**触发条件：** 服务端已有 HTML，客户端却使用 createApp()

**原因：** `createApp()` 的 DOM 挂载会清空容器并执行普通客户端渲染，不能接管服务端已经生成的节点。

**后果：** 已有 HTML 被替换，失去 hydration 的复用价值，还可能出现闪烁、状态重置或第三方节点丢失。

**错误示例：**

~~~~ts
// entry-client.ts
import { createApp } from 'vue'

createApp(App).mount('#app')
~~~~

**正确写法：**

~~~~ts
// entry-client.ts
import { createSSRApp } from 'vue'

createSSRApp(App).mount('#app')
~~~~

**验证方式：** 对照正确写法验证结果。

### 在服务端模块顶层复用单个应用实例

**触发条件：** 在服务端模块顶层复用单个应用实例

**原因：** 模块会被多个请求共享，而 app context、插件、provide 和状态容器都可能保存请求相关数据。

**后果：** 不同请求之间发生状态串用，轻则页面内容错误，重则泄露其他用户的数据。

**错误示例：**

~~~~ts
const sharedApp = createSSRApp(App)

/** 错误地复用模块级应用。 */
export function getApp() {
  return sharedApp
}
~~~~

**正确写法：**

~~~~ts
/** 为每个请求创建独立应用。 */
export function createMyApp() {
  return createSSRApp(App)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 createSSRApp() 当成完整 SSR 流程

**触发条件：** 把 createSSRApp() 当成完整 SSR 流程

**原因：** 该 API 只创建应用实例，不会自行调用 server renderer、输出响应、同步状态或加载客户端入口。

**后果：** 服务端可能只得到一个 app 对象却没有 HTML，或浏览器拿到静态 HTML 后没有事件与响应性。

**错误示例：**

~~~~ts
/** 错误地把应用实例当成最终 HTML。 */
export function render() {
  return createSSRApp(App)
}
~~~~

**正确写法：**

~~~~ts
/** 使用 server renderer 生成最终 HTML。 */
export async function render() {
  const app = createSSRApp(App)
  return renderToString(app)
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 五、源码推导与适用场景

:::steps
### 同一公开参数形状

Vue 3.5.40 把 `createApp` 与 `createSSRApp` 都声明为 `CreateAppFunction<Element>`。可以复用同一个应用工厂和挂载前配置流程，不需要为 SSR 发明另一套 app 接口。

### 浏览器挂载选择 hydration

runtime-dom 的 SSR 包装器把 `mount()` 交给 hydration renderer，说明它适用于“服务端先输出 HTML，浏览器再接管现有 DOM”的页面；纯客户端 SPA 应继续使用 `createApp()`。

### renderer 是独立能力

server-renderer 官方测试把 `createSSRApp(App)` 作为参数交给 `renderToString()`。因此 app 是 renderer 的输入而不是替代品；流式渲染、响应写入和请求错误处理仍属于服务端入口。
:::
