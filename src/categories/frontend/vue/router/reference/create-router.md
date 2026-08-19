---
id: vue.router.reference.configuration.create-router
type: reference
title: createRouter() 与 RouterOptions
summary: 用显式 history、初始 routes 与全局选项创建 Router 实例，并在 Vue 应用挂载前完成插件安装
domain: frontend
technology: vue
module: router
related:
  - vue.router.reference.configuration.router-instance
  - vue.router.reference.configuration.history
  - vue.router.learn.basics.setup-first-router
tags:
  - Vue Router
  - createRouter
  - RouterOptions
  - history
  - routes
  - app.use
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router API：createRouter()
    url: https://router.vuejs.org/api/functions/createrouter
  - title: Vue Router API：RouterOptions
    url: https://router.vuejs.org/api/interfaces/routeroptions
  - title: Vue Router Guide：创建并安装 Router
    url: https://router.vuejs.org/guide/
  - title: Vue Router Guide：History 模式与部署
    url: https://router.vuejs.org/guide/essentials/history-mode.html
  - title: Vue Router Guide：动态路由
    url: https://router.vuejs.org/guide/advanced/dynamic-routing.html
  - title: "Vue Router issue #2165：自定义 query parser 的类型边界"
    url: https://github.com/vuejs/router/issues/2165
  - title: Vue Router v5.2.0 createRouter 固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/router.ts
  - title: Vue Router v5.2.0 RouterOptions 基础配置固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/experimental/router.ts
group: configuration
signature: |-
  function createRouter(options: RouterOptions): Router

  interface RouterOptions extends EXPERIMENTAL_RouterOptions_Base {
    routes: Readonly<RouteRecordRaw[]>
  }

  interface EXPERIMENTAL_RouterOptions_Base extends PathParserOptions {
    history: RouterHistory
    scrollBehavior?: RouterScrollBehavior
    parseQuery?: (search: string) => LocationQuery
    stringifyQuery?: (query: LocationQueryRaw) => string
    linkActiveClass?: string
    linkExactActiveClass?: string
  }

  interface PathParserOptions {
    sensitive?: boolean
    strict?: boolean
    /** @deprecated 后续版本将始终按 true 处理。 */
    end?: boolean
  }
anchors:
  - 概述
  - Create Router
  - Router Options
  - 安装到 Vue 应用
  - 配置所有权
  - 易错使用提示
  - 源码推导与适用场景
---

# createRouter() 与 RouterOptions

## 一、概述

`createRouter()` 是稳定的 Router 工厂。它接收一份 `RouterOptions`，立即建立路由 matcher、导航守卫集合与初始 `currentRoute`，再返回供应用安装和导航的 `Router`。创建实例不等于安装插件：只有 `app.use(router)` 才会把路由能力接入具体 Vue 应用。

:::tip
通常在独立的 `router.ts` 中创建并导出一个实例。组件消费这个实例或 `useRouter()`，不要在每次渲染或每个页面中重新创建 Router。
:::

## 二、Create Router

`createRouter(options)` 只有一个参数：完整的 Router 配置对象；返回值是 `Router` 实例。`history` 决定位置如何保存以及是否连接浏览器 URL，`routes` 则是在创建 matcher 时加入的初始路由记录。两项都必须显式提供，即使初始路由列表为空。

~~~~ts
// router.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import AccountView from './views/AccountView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/account', name: 'account', component: AccountView },
  ],
})
~~~~

| 输入或输出 | 类型 | 契约 |
| --- | --- | --- |
| options | RouterOptions | 一次性描述 history、初始 records 与全局匹配行为 |
| options.history | RouterHistory | 必填；由 web、hash 或 memory history 工厂创建 |
| options.routes | readonly RouteRecordRaw[] | 必填；允许空数组，创建时加入 matcher |
| 返回值 | Router | 持有当前路由、matcher、history、守卫和导航方法 |

## 三、Router Options

`RouterOptions` 由两项必填配置、五个可选属性以及三个继承的路径解析选项组成。5.2.0 的声明复用了名为 `EXPERIMENTAL_RouterOptions_Base` 的基础接口，但稳定根入口导出的 `RouterOptions` 与 `createRouter()` 仍是 public API；应用无需也不应改为依赖 experimental 子路径。它是 Router 级全局策略，单条 route record 自己的 `strict`、`sensitive` 等设置可覆盖相应的全局默认。

| 配置 | 默认值 | 用途与边界 |
| --- | --- | --- |
| history | 无，必填 | 选择 web、hash 或 memory 的位置存储实现 |
| routes | 无，必填 | 创建时加入 matcher 的只读初始路由列表 |
| scrollBehavior | undefined | 在浏览器导航完成后决定滚动位置，也可返回 Promise |
| parseQuery / stringifyQuery | 内置实现 | 成对替换 query 字符串与对象的双向转换；stringify 结果不含前导问号 |
| linkActiveClass | router-link-active | 设置 RouterLink 的全局激活 class |
| linkExactActiveClass | router-link-exact-active | 设置 RouterLink 的全局精确激活 class |
| sensitive | false | 全局路径匹配是否区分大小写 |
| strict | false | 全局路径匹配是否严格区分尾部斜杠 |
| end | true | 控制是否匹配到路径末尾；5.2.0 已标记 deprecated |

~~~~ts
import qs from 'qs'
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory('/admin/'),
  routes,
  parseQuery: qs.parse,
  stringifyQuery: qs.stringify,
  linkActiveClass: 'is-active',
  linkExactActiveClass: 'is-exact-active',
  strict: true,
})
~~~~

:::warning
自定义 query 库可能产生嵌套对象或数字等超出 `LocationQuery` 常规值域的结果。Vue Router 会保留自定义实现返回的对象，但应用需要自行统一运行时约定与 TypeScript 类型；官方 issue #2165 记录了 `qs.parse` 与默认 query 类型不完全吻合的场景。
:::

## 四、安装到 Vue 应用

`createRouter()` 只创建实例；`app.use(router)` 才注册 `RouterLink`、`RouterView`、`$router`、`$route` 与组合式 API 所需的注入，并在浏览器中触发初始导航。官方 Guide 要求它发生在 `app.mount()` 之前。

~~~~ts
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
~~~~

## 五、配置所有权

`router.options` 暴露创建时传入的原始配置对象，但这不代表任意后续修改都会实时重配 Router。固定源码在创建阶段就把 `options.routes` 交给 matcher，并把 query 函数与 history 保存到内部闭包；运行期间新增或移除记录应使用 `addRoute()`、`removeRoute()` 或 `clearRoutes()`。需要更换 history 或全局匹配策略时，应创建新的 Router 实例。

## 六、易错使用提示

:::pitfalls
### 省略 history 或 routes，期待 createRouter() 自动补齐

**触发条件：** 省略 history 或 routes，期待 createRouter() 自动补齐

**原因：** 两项都是 `RouterOptions` 的必填属性。Vue Router 不会根据浏览器环境猜 history，也要求显式声明初始 route records。

**后果：** TypeScript 会拒绝该配置；绕过类型后，5.2.0 开发构建还会对缺少 history 直接抛错。

**错误示例：**

~~~~ts
const router = createRouter({
  routes,
})
~~~~

**正确写法：**

~~~~ts
const router = createRouter({
  history: createWebHistory(),
  routes,
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 先 mount()，再安装 Router 插件

**触发条件：** 先 mount()，再安装 Router 插件

**原因：** Router 的组件注册、全局属性和注入都由 `app.use(router)` 完成；已经挂载的根组件不会在创建时得到这些能力。

**后果：** 首屏中的 RouterView、RouterLink、`useRouter()` 或 `$route` 可能不可用，初始导航时序也被打乱。

**错误示例：**

~~~~ts
const app = createApp(App)
app.mount('#app')
app.use(router)
~~~~

**正确写法：**

~~~~ts
const app = createApp(App)
app.use(router)
app.mount('#app')
~~~~

**验证方式：** 对照正确写法验证结果。

### 无法配置服务器回退，却直接使用 web history

**触发条件：** 无法配置服务器回退，却直接使用 web history

**原因：** `createWebHistory()` 生成普通路径，用户直接访问深层 URL 时，服务器必须把未知应用路径回退到 `index.html`。

**后果：** 站内跳转看似正常，但刷新 `/account` 或直接打开该地址会得到服务器 404。

**错误示例：**

~~~~ts
// 静态托管平台无法配置 SPA fallback
const router = createRouter({
  history: createWebHistory(),
  routes,
})
~~~~

**正确写法：**

~~~~ts
// 无法配置 fallback 时，明确选择 hash history
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 qs 解析嵌套 query，却只替换 parseQuery

**触发条件：** 用 qs 解析嵌套 query，却只替换 parseQuery

**原因：** 嵌套 query 是双向转换：URL 进入 Router 时由 qs 解析，按对象导航时还要用相同约定序列化。官方 API 示例把这两个自定义实现作为一对传入。

**后果：** 同一份嵌套 query 在解析与再次导航后可能改变结构或编码形式，类型假设也不再一致。

**错误示例：**

~~~~ts
const router = createRouter({
  history,
  routes,
  parseQuery: qs.parse,
})
~~~~

**正确写法：**

~~~~ts
const router = createRouter({
  history,
  routes,
  parseQuery: qs.parse,
  stringifyQuery: qs.stringify,
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 创建后修改原 routes 数组，期待 matcher 自动更新

**触发条件：** 创建后修改原 routes 数组，期待 matcher 自动更新

**原因：** `createRouter()` 在创建阶段读取 `options.routes` 并建立 matcher。普通数组变更不是 Router 的动态路由 API。

**后果：** 原数组出现新记录，但 `resolve()`、RouterLink 和导航仍找不到它，界面与配置数据产生分歧。

**错误示例：**

~~~~ts
const routes = [{ path: '/', component: HomeView }]
const router = createRouter({ history, routes })

routes.push({ path: '/reports', component: ReportsView })
~~~~

**正确写法：**

~~~~ts
const router = createRouter({ history, routes })

router.addRoute({
  path: '/reports',
  component: ReportsView,
})
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 七、源码推导与适用场景

:::steps
### 1. 创建阶段固定匹配基础

固定 commit 的 `createRouter()` 首先调用 `createRouterMatcher(options.routes, options)`。因此 routes 与 `strict`、`sensitive`、`end` 在 matcher 建立时成为匹配基础；运行期 route record 变化应通过 Router 的动态路由方法表达。

### 2. 保存 history 与 query 边界

实现随后选取自定义或内置 `parseQuery`、`stringifyQuery`，保存 `options.history`，并创建守卫集合、`currentRoute` 与 pending location。这说明 history 和 query 策略属于实例级创建配置，不是组件级选项。

### 3. 把 Vue 集成留给 install

返回的 Router 含有 `install(app)`；只有插件安装阶段才注册组件、提供注入并在浏览器启动首次导航。纯 matcher 解析可先于 Vue app 存在，但组件消费必须等 `app.use(router)` 建立应用上下文。

### 4. 按运行环境选择实例

常规 SPA 在服务器可配置 fallback 时使用 web history；静态托管无法回退时评估 hash history；SSR、测试和隔离工具使用 memory history，并显式安排初始导航。每个需要独立导航状态的应用边界创建一个 Router 实例。
:::

~~~~ts
// 精简自 vuejs/router 5.2.0 packages/router/src/router.ts
/** 根据显式配置建立 matcher、导航状态与 Vue 插件接口。 */
export function createRouter(options: RouterOptions): Router {
  const matcher = createRouterMatcher(options.routes, options)
  const parseQuery = options.parseQuery || originalParseQuery
  const stringifyQuery = options.stringifyQuery || originalStringifyQuery
  const routerHistory = options.history
  const currentRoute = shallowRef(START_LOCATION_NORMALIZED)

  const router = {
    currentRoute,
    options,

    /** 把 Router 组件、全局属性与注入安装到当前 Vue 应用。 */
    install(app: App) {
      app.component('RouterLink', RouterLink)
      app.component('RouterView', RouterView)
      // 省略全局属性、provide、首次导航和卸载清理。
    },
  }

  // 省略使用 matcher、query 函数与 history 的导航方法。
  return router as Router
}
~~~~
