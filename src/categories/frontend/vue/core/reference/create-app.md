---
id: vue.core.reference.application.create-app
type: reference
title: createApp()
summary: 创建独立的 Vue 应用实例，在挂载前登记插件、全局资源与应用配置，并通过 mount() 将根组件渲染到容器中
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.application.next-tick
  - vue.core.reference.composition.provide-inject
  - vue.core.reference.components.attrs
tags:
  - createApp
  - App
  - mount
  - unmount
  - 插件
  - 应用实例
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-02
sources:
  - title: Vue 应用 API：createApp 与应用实例
    url: https://cn.vuejs.org/api/application.html#createapp
  - title: Vue 应用 API：app.mount
    url: https://cn.vuejs.org/api/application.html#app-mount
  - title: Vue 应用 API：app.onUnmount
    url: https://cn.vuejs.org/api/application.html#app-onunmount
  - title: Vue 应用 API：app.version
    url: https://cn.vuejs.org/api/application.html#app-version
  - title: Vue 通用 API：version
    url: https://cn.vuejs.org/api/general.html#version
  - title: Vue 应用指南：创建应用与多个应用实例
    url: https://cn.vuejs.org/guide/essentials/application.html
  - title: Vue 3.5.40 apiCreateApp.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts
  - title: Vue 3.5.40 全局 version 导出源码
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/index.ts
  - title: Vue 3.5.40 应用实例官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiCreateApp.spec.ts
  - title: Vue 3.5.40 DOM createApp 挂载实现
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/index.ts
group: application
signature: |-
  function createApp(rootComponent: Component, rootProps?: object | null): App

  interface App {
    version: string
    onUnmount(callback: () => void): void // Vue 3.5+
  }

  const version: string
anchors:
  - 概述
  - 创建、配置与挂载
  - 应用实例隔离
  - app.onUnmount()
  - app.version
  - 全局 version
  - 易错使用提示
  - 最小源码实现
---

# createApp()

## 一、概述

`createApp()` 根据根组件创建一个独立的应用实例。实例保存应用级配置、全局组件、全局指令、插件和应用级 provide；只有调用 `mount()` 后，根组件才会渲染到指定容器中。它本身不是站点启动链的约定入口，而是一项可在任意 Vue 应用中使用的 API。

## 二、创建、配置与挂载

`use()`、`component()`、`directive()`、`provide()` 和 `config` 用来准备该应用实例，通常应在首次挂载前完成。它们返回 `app`，所以可以链式调用；`mount()` 例外，它返回根组件公开实例，并且同一个应用实例只能挂载一次。

~~~~ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import AppButton from './components/AppButton.vue'

const app = createApp(App, { initialTab: 'overview' })

app.use(router)
app.component('AppButton', AppButton)
app.provide('apiBaseUrl', '/api')
app.config.errorHandler = (error) => reportError(error)
app.mount('#app')
~~~~

| 成员 | 作用 | 返回值或限制 |
| --- | --- | --- |
| app.use() | 安装对象或函数插件 | 返回 app；同一插件不会重复安装 |
| app.component() / app.directive() | 登记或读取应用级组件、指令 | 登记时返回 app |
| app.provide() | 提供应用级依赖注入值 | 返回 app；只属于当前应用 |
| app.mount() | 首次将根组件渲染到容器内部 | 返回根组件实例；每个 app 只能一次 |
| app.unmount() | 卸载整个组件树 | 同一个 app 不能再次 mount |

:::demo{id="vue.core.reference.application.create-app.create-app-demo" playground="true"}
在当前页面中创建、挂载并卸载一个独立的迷你应用，观察应用级 provide 与 mount 返回值
:::

## 三、应用实例隔离

每次调用 `createApp()` 都会创建新的应用上下文。一个 app 注册的组件、指令、provide、`globalProperties` 与错误处理器不会自动进入另一个 app；同页嵌入多个 Vue 应用时，需要对每个实例分别安装共享资源。

:::tip
挂载容器只是 Vue 向其内部渲染根组件的宿主元素，不是根组件本身。客户端 `createApp()` 会在首次渲染前清空容器既有内容；需要保留的静态或服务端内容应放在容器外部。
:::

## 四、app.onUnmount()

`app.onUnmount(callback)` 在当前应用实例上登记卸载清理回调，签名为 `(callback: () => void) => void`，仅 Vue 3.5+ 可用。它适合回收插件或应用级代码创建的窗口监听器、订阅和其他不属于单个组件的资源。可以登记多个回调；它们属于各自 app，并在 `app.unmount()` 卸载组件树时执行。它不同于跟随某个组件实例的 `onUnmounted()`，也不返回 app，不能参与链式调用。

~~~~ts
const resizePlugin = {
  /** 为当前应用安装并登记窗口监听。 */
  install(app: App) {
    /** 将最新视口尺寸同步给应用服务。 */
    function handleResize() {
      viewportService.refresh()
    }

    window.addEventListener('resize', handleResize)
    app.onUnmount(() => window.removeEventListener('resize', handleResize))
  },
}

const app = createApp(AppRoot)
app.use(resizePlugin)
app.mount('#app')

// 执行插件登记的清理回调，并卸载整个组件树
app.unmount()
~~~~

## 五、app.version

`app.version: string` 是创建该应用实例的 Vue 运行时版本。插件的 `install(app)` 已经拿到应用实例，适合从 `app.version` 读取宿主 Vue 版本，而不必额外导入全局变量。它描述 Vue 运行时，不是业务应用版本，也不是插件自身版本。

~~~~ts
const compatibilityPlugin = {
  /** 输出当前宿主应用使用的 Vue 运行时版本。 */
  install(app: App) {
    console.info(`Host Vue: ${app.version}`)
  },
}

createApp(AppRoot).use(compatibilityPlugin).mount('#app')
~~~~

## 六、全局 version

`version` 是从 `vue` 包直接导出的命名导出，签名为 `const version: string`。它不依赖应用实例，适合在创建 app 之前、库初始化代码或诊断信息中读取。`app.version` 与全局 `version` 分别解决“已有 app 引用”和“只有 Vue 模块引用”的场景；在同一份 Vue 运行时中二者来自同一个版本常量。需要判断版本范围时应使用语义化版本解析，不要按字符串字典序比较。

~~~~ts
import { createApp, version } from 'vue'

console.info(`Loaded Vue: ${version}`)

const app = createApp(AppRoot)
console.info(app.version === version) // 同一份 Vue 运行时中为 true
~~~~

## 七、易错使用提示

:::pitfalls
### 在 mount() 之后继续链式安装插件或注册资源

**触发条件：** 在 mount() 之后继续链式安装插件或注册资源

**原因：** `mount()` 返回根组件公开实例，不返回 `app`。应用配置和资源登记应在首次挂载前完成，不能把它当成与 `use()` 相同的链式成员。

**后果：** `createApp(App).mount('#app').use(router)` 会因根组件实例没有 `use()` 而报错，晚注册的资源也不会参与已完成的首次渲染。

**错误示例：**

~~~~ts
createApp(App).mount('#app').use(router)
~~~~

**正确写法：**

~~~~ts
const app = createApp(App)

app.use(router)
app.component('AppButton', AppButton)
app.mount('#app')
~~~~

**验证方式：** 对照正确写法验证结果。

### unmount() 后重用同一个应用实例再次挂载

**触发条件：** unmount() 后重用同一个应用实例再次挂载

**原因：** Vue 3.5.40 在首次 `mount()` 后保留挂载状态；`unmount()` 会销毁组件树，但不会把该 app 恢复成从未挂载过的实例。

**后果：** 第二次 `mount()` 会发出已挂载警告并保持新容器为空，造成看似随机的应用未显示问题。

**错误示例：**

~~~~ts
const app = createApp(App)

app.mount('#first-root')
app.unmount()
app.mount('#second-root')
~~~~

**正确写法：**

~~~~ts
/** 每次需要挂载时创建新的应用实例。 */
function createMyApp() {
  return createApp(App)
}

const firstApp = createMyApp()
firstApp.mount('#first-root')
firstApp.unmount()

createMyApp().mount('#second-root')
~~~~

**验证方式：** 对照正确写法验证结果。

### 把包含重要内容的元素直接当作挂载容器

**触发条件：** 把包含重要内容的元素直接当作挂载容器

**原因：** 客户端 `createApp()` 在渲染根组件前会清空挂载容器的内容，根组件渲染到容器内部而不是接管容器元素本身。

**后果：** 容器里的服务端输出、提示文本或第三方节点会在挂载时消失，围绕外层元素作出的组件生命周期预期也不成立。

**错误示例：**

~~~~html
<main id="app">
  <p>必须保留的服务端内容</p>
</main>
~~~~

**正确写法：**

~~~~html
<main>
  <p>必须保留的服务端内容</p>
  <div id="app"></div>
</main>
~~~~

**验证方式：** 对照正确写法验证结果。

### 用新对象整体替换 app.config

**触发条件：** 用新对象整体替换 app.config

**原因：** `app.config` 暴露的是应用已有的配置对象，Vue 3.5.40 不支持整体替换；应只写入需要修改的具体配置属性。

**后果：** 新的 `errorHandler` 或 `globalProperties` 不会生效，开发环境还会发出 `app.config cannot be replaced` 警告。

**错误示例：**

~~~~ts
app.config = {
  errorHandler: reportError,
}
~~~~

**正确写法：**

~~~~ts
app.config.errorHandler = reportError
app.config.globalProperties.$api = apiClient
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为一个 app 的全局资源会自动共享给另一个 app

**触发条件：** 认为一个 app 的全局资源会自动共享给另一个 app

**原因：** 这里的“全局”只相对当前应用实例。每次 `createApp()` 都会创建独立上下文，组件注册、provide 与配置不会跨实例传播。

**后果：** 第二个应用无法解析第一个应用注册的组件，也无法注入第一个应用提供的依赖，两个界面的行为出现不一致。

**错误示例：**

~~~~ts
const adminApp = createApp(AdminRoot)
adminApp.component('AppButton', AppButton)
adminApp.mount('#admin')

createApp(StorefrontRoot).mount('#storefront')
~~~~

**正确写法：**

~~~~ts
/** 为每个应用实例登记相同的共享资源。 */
function installSharedResources(app: App) {
  app.component('AppButton', AppButton)
  app.provide(apiKey, apiClient)
}

const adminApp = createApp(AdminRoot)
installSharedResources(adminApp)

const storefrontApp = createApp(StorefrontRoot)
installSharedResources(storefrontApp)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 八、最小源码实现

Vue 3.5.40 为每个 app 创建独立 `context` 与 `pluginCleanupFns`，并用 `isMounted` 限制根组件只挂载一次。应用对象的 `version` 直接引用 runtime-core 导出的 `__VERSION__` 常量；`onUnmount()` 只向当前 app 的清理数组追加回调。`unmount()` 先通过应用卸载错误边界调用这些回调，再用 `render(null, container)` 卸载整棵树，但不会重置 `isMounted`。`apiCreateApp.spec.ts` 覆盖应用挂载、卸载及实例行为。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/runtime-core/src/apiCreateApp.ts
// packages/runtime-core/src/index.ts 将构建版本公开为同一个常量
export const version = __VERSION__

/** 创建应用工厂。 */
function createAppAPI(render: RootRenderFunction) {
  /** 为根组件创建一个只能挂载一次的应用实例。 */
  return function createApp(rootComponent: Component, rootProps = null) {
    const context = createAppContext()
    const pluginCleanupFns: Array<() => void> = []
    let isMounted = false
    let rootContainer: HostElement | null = null

    const app: App = {
      version,

      /** 把全局组件登记到当前应用上下文。 */
      component(name, component) {
        if (component) context.components[name] = component
        return app
      },

      /** 把根组件与当前应用上下文交给渲染器。 */
      mount(container) {
        if (isMounted) return
        const vnode = createVNode(rootComponent, rootProps)
        vnode.appContext = context
        render(vnode, container)
        isMounted = true
        rootContainer = container
        return getComponentPublicInstance(vnode.component!)
      },

      /** 登记只属于当前应用实例的卸载清理。 */
      onUnmount(cleanupFn) {
        pluginCleanupFns.push(cleanupFn)
      },

      /** 卸载根组件树，但不允许同一 app 重新挂载。 */
      unmount() {
        if (isMounted && rootContainer) {
          callWithAsyncErrorHandling(pluginCleanupFns, app._instance, ErrorCodes.APP_UNMOUNT_CLEANUP)
          render(null, rootContainer)
        }
      },
    }

    return app
  }
}
~~~~
