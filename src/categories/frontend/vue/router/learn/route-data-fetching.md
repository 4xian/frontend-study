---
id: vue.router.learn.intermediate.route-data-fetching
type: lesson
title: 路由数据获取
summary: 比较导航前后两种取数时序，并让取消、错误和最新结果各有明确所有者
domain: frontend
technology: vue
module: router
related:
  - vue.router.learn.intermediate.meta-navigation-guards
  - vue.core.learn.basics.watchers
tags:
  - Vue Router
  - data fetching
  - beforeResolve
  - watch
  - AbortController
appliesTo: Vue 3.5.40、Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router：Data Fetching
    url: https://router.vuejs.org/guide/advanced/data-fetching
  - title: Vue Router：Navigation Guards
    url: https://router.vuejs.org/guide/advanced/navigation-guards
  - title: Vue Router：Composition API
    url: https://router.vuejs.org/guide/advanced/composition-api
  - title: Vue：Watcher Side Effect Cleanup
    url: https://vuejs.org/guide/essentials/watchers.html#side-effect-cleanup
  - title: Vue Router API：NavigationGuard
    url: https://router.vuejs.org/api/interfaces/navigationguard
  - title: Vue Router 5.2.0 router.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts
  - title: Vue Router 5.2.0 navigationGuards.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts
stage: intermediate
level: intermediate
estimatedMinutes: 70
prerequisites:
  - vue.router.learn.intermediate.meta-navigation-guards
objectives:
  - 根据目标 UX 选择导航后取数或导航前取数
  - 为两种策略分别安排 loading、error 和取消责任
  - 用精确参数 watch 处理组件复用时的数据更新
  - 用 beforeResolve 在导航确认前等待必要数据
  - 用 AbortController 与 active token 阻止过期结果写回
recap:
  - 导航后与导航前取数都是 UX 选择，不是固定优先级。
  - 页面 watcher 负责导航后局部状态，beforeResolve 可负责导航前全局 pending。
  - 同记录参数变化会复用组件，应精确侦听请求身份。
  - Router 的导航取消不会自动取消业务 Promise。
  - AbortController 与 active token 共同保证 latest-wins。
---

# 路由数据获取

## 先决定导航何时提交

Vue Router 官方把导航后取数和导航前取数都定义为有效选择。差别不是哪个 API 更高级，而是用户何时看到新 URL、新页面和 loading：导航后先提交路由，由目标页面取数；导航前由守卫等待，请求完成前仍停留在旧页面。

| 责任 | 导航后取数 | 导航前取数 |
| --- | --- | --- |
| currentRoute | 立即切到目标路由 | 请求成功前保持旧路由 |
| loading | 目标页面局部状态 | app shell 或全局导航状态 |
| error | 目标页面局部错误区 | 全局提示，并决定取消/重定向/继续 |
| 取消 | 参数 watcher 失效或组件卸载 | 新导航使旧 prefetch 失效 |
| 适用场景 | 页面结构可先显示 | 必要数据就绪后才能进入 |

## 导航后：精确侦听请求身份

从 /users/1 到 /users/2 时，同一 route record 通常复用组件实例，onMounted 不会重新运行。页面应在 setup 中只侦听决定请求身份的 params/query 字段，并用 immediate 统一首次进入与后续更新。

~~~~ts
const route = useRoute()
let activeToken = 0

watch(
  () => route.params.id,
  async (id, _previousId, onCleanup) => {
    const token = ++activeToken
    const controller = new AbortController()
    onCleanup(() => {
      controller.abort()
      if (token === activeToken) activeToken += 1
    })
    loading.value = true
    error.value = null

    try {
      const result = await requestUser(String(id), controller.signal)
      if (token === activeToken && route.params.id === id) data.value = result
    } catch (caught) {
      if (!controller.signal.aborted && token === activeToken) error.value = String(caught)
    } finally {
      if (token === activeToken) loading.value = false
    }
  },
  { immediate: true },
)
~~~~

cleanup 提供取消入口，但写回前仍要比较 active token 和当前 route id。Abort 只能通知支持 signal 的 adapter 停止工作；身份检查才是“旧结果绝不覆盖新页面”的最终保证。

## 导航前：在 beforeResolve 等待并明确结算

beforeResolve 位于异步路由组件和组件进入守卫之后、导航确认之前。它适合统一实现“数据成功才进入”，但它是全局守卫，必须先筛选明确的 route name 或 meta。pending/error 也必须由目标组件之外的 app shell 显示。

~~~~ts
let activeNavigationToken = 0
let activeController: AbortController | undefined

router.beforeResolve(async (to) => {
  const token = ++activeNavigationToken
  activeController?.abort()
  if (to.name !== 'user-before') return

  const controller = new AbortController()
  activeController = controller
  navigationPending.value = true
  try {
    const prepared = await requestUser(String(to.params.id), controller.signal)
    if (controller.signal.aborted || token !== activeNavigationToken) return
    preparedByPath.set(to.fullPath, prepared)
  } catch (caught) {
    if (controller.signal.aborted || token !== activeNavigationToken) return
    navigationError.value = String(caught)
    return false
  } finally {
    if (token === activeNavigationToken) navigationPending.value = false
  }
})
~~~~

每条异步分支都必须结算：成功放行，业务失败 return false，重定向返回 location，意外错误抛出。Router 会识别旧导航已被新导航取消，却不会替业务 Promise 调用 abort。

## 用受控请求观察两种时序

下面的 mini-app 不发真实网络请求，也不使用定时器。每次导航创建可手动完成的 deferred request：导航后模式会立即切路由并显示局部 loading，快速切换 id 会 abort 旧请求；导航前模式会保持旧路由并显示全局 pending，直到当前请求完成才提交。

:::demo{id="vue.router.learn.intermediate.route-data-fetching.route-data-fetching-lab-demo" playground="true"}
手动控制请求完成顺序，对比导航提交时机与 latest-wins 责任
:::

## 易错使用提示

:::pitfalls
### 把一种取数策略写成唯一正确答案

**触发条件：** 把一种取数策略写成唯一正确答案

**原因：** 两种策略服务于不同的导航体验和错误归属。

**后果：** 页面切换时机与产品预期冲突，loading 无明确所有者。

**错误示例：**

~~~~ts
// 所有页面都必须在守卫中 await fetchData()
~~~~

**正确写法：**

~~~~ts
// 可先显示结构：页面 watch；必须有数据才进入：beforeResolve
~~~~

**验证方式：** 对照正确写法验证结果。

### 导航后只在 onMounted 请求一次

**触发条件：** 导航后只在 onMounted 请求一次

**原因：** 同 record 的参数变化会复用组件实例。

**后果：** /users/2 仍显示 /users/1 的数据。

**错误示例：**

~~~~ts
onMounted(() => load(route.params.id))
~~~~

**正确写法：**

~~~~ts
watch(() => route.params.id, load, { immediate: true })
~~~~

**验证方式：** 对照正确写法验证结果。

### 侦听整个 route 对象

**触发条件：** 侦听整个 route 对象

**原因：** 请求身份通常只由少量 params 或 query 字段决定。

**后果：** 无关的 query/hash 变化也重发请求，依赖边界不清晰。

**错误示例：**

~~~~ts
watch(route, loadUser)
~~~~

**正确写法：**

~~~~ts
watch(() => route.params.id, loadUser)
~~~~

**验证方式：** 对照正确写法验证结果。

### 旧请求既不取消也不检查身份

**触发条件：** 旧请求既不取消也不检查身份

**原因：** Promise 可以乱序完成，adapter 也可能忽略 AbortSignal。

**后果：** 较慢的旧结果覆盖最新 id。

**错误示例：**

~~~~ts
data.value = await requestUser(id)
~~~~

**正确写法：**

~~~~ts
const token = ++activeToken
const result = await requestUser(id, signal)
if (token === activeToken && route.params.id === id) data.value = result
~~~~

**验证方式：** 对照正确写法验证结果。

### 在首个 await 后注册 onWatcherCleanup

**触发条件：** 在首个 await 后注册 onWatcherCleanup

**原因：** onWatcherCleanup 只能在 watcher 的同步执行窗口注册。

**后果：** 旧请求没有清理所有者，继续运行并可能写回。

**错误示例：**

~~~~ts
const result = await requestUser(id)
onWatcherCleanup(() => controller.abort())
~~~~

**正确写法：**

~~~~ts
const controller = new AbortController()
onWatcherCleanup(() => controller.abort())
const result = await requestUser(id, controller.signal)
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 Abort 当成业务失败展示

**触发条件：** 把 Abort 当成业务失败展示

**原因：** 参数快速变化导致的 abort 是预期失效。

**后果：** 用户看到虚假错误，错误区在正常操作中闪烁。

**错误示例：**

~~~~ts
catch (error) { visibleError.value = String(error) }
~~~~

**正确写法：**

~~~~ts
catch (error) {
  if (!controller.signal.aborted) visibleError.value = String(error)
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 只用 beforeRouteEnter 处理所有 id

**触发条件：** 只用 beforeRouteEnter 处理所有 id

**原因：** 同 record 参数变化属于组件复用，不是 entering record。

**后果：** 首次进入能取数，后续 id 变化不更新。

**错误示例：**

~~~~ts
beforeRouteEnter: () => loadUser()
~~~~

**正确写法：**

~~~~ts
// 页面精确 watch；需要导航前统一等待时使用 beforeResolve
~~~~

**验证方式：** 对照正确写法验证结果。

### 守卫某个分支永远不结算

**触发条件：** 守卫某个分支永远不结算

**原因：** 导航会等待 guard Promise 的最终结果。

**后果：** 用户停在旧页面，pending 永远不结束。

**错误示例：**

~~~~ts
router.beforeResolve(() => new Promise(() => {}))
~~~~

**正确写法：**

~~~~ts
try { await load() } catch { return false }
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 Router cancelled 会自动 abort 请求

**触发条件：** 认为 Router cancelled 会自动 abort 请求

**原因：** Router 只管理导航 identity，不拥有业务请求。

**后果：** 旧网络继续占资源，并可能污染 prepared buffer。

**错误示例：**

~~~~ts
router.beforeResolve(() => requestUser(id)) // 无业务取消
~~~~

**正确写法：**

~~~~ts
activeController?.abort()
activeController = new AbortController()
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 experimental Data Loader 当成稳定默认

**触发条件：** 把 experimental Data Loader 当成稳定默认

**原因：** 5.2.0 从 vue-router/experimental 子路径导出 Data Loaders。

**后果：** 课程依赖实验契约，并掩盖 guard/watch 的稳定时序。

**错误示例：**

~~~~ts
import { DataLoaderPlugin } from 'vue-router/experimental'
~~~~

**正确写法：**

~~~~ts
// 稳定主线：beforeResolve + watch + AbortController
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 从源码推导适用场景

:::steps
### 1. beforeResolve 是确认前最后一段守卫队列

router.ts 先运行 leave、beforeEach、update、beforeEnter 和 beforeRouteEnter，最后运行 beforeResolve；整个 navigate 成功后才提交 currentRoute。因此它适合可观察地等待必要数据。

### 2. 导航取消不等于请求取消

Router 用 pendingLocation 判断旧导航是否 cancelled，源码不持有业务 AbortController。新导航开始时必须由请求层显式 abort，写回时仍比较 token。

### 3. guard 返回被统一适配为 Promise 决策

guardToPromiseFn 将同步值和 Promise 统一处理：false 产生 aborted failure，location 触发 redirect，Error 进入 reject，无返回值放行。每条异步路径都必须有确定结算。

### 4. beforeRouteEnter 的实例交付是专用机制

只有进入守卫 next(function) 会登记 enter callback，RouterView 在实例可用后的 post flush 执行。守卫本体没有组件实例，Composition API 主线不应依赖这个兼容回调。

### 5. 组件复用进入 update 而不是 enter 队列

extractChangingRecords 将 matched records 分为 leaving、updating、entering。同记录参数变化不会重跑 beforeRouteEnter，所以页面取数应使用精确 watcher 或 update guard。

### 6. Abort 和提交身份解决不同问题

Abort 尽快停止支持 signal 的底层工作；active token、route id 或 target fullPath 判断结果是否仍可提交。生产请求层应同时保留这两层保证。
:::

:::exercise
### 为详情页选择数据策略

**要求：** 产品列表进入详情时允许先显示骨架；切换详情 id 很频繁。选择策略，并写出 loading、取消与写回条件。

**验收：** 完成题目要求。

**参考答案：** 选择导航后取数：目标页面立即显示局部 loading；精确 watch route.params.id，创建 AbortController 并在 cleanup 中 abort；写回前同时确认 request token 仍为 active 且当前 route id 与请求 id 一致。
:::

- [ ] 根据 UX 选择导航前或导航后取数
- [ ] 局部与全局 loading/error 各有明确所有者
- [ ] 只侦听决定请求身份的路由字段
- [ ] 旧请求同时使用 Abort 与 token 失效
- [ ] 守卫的每条异步路径都能确定结算
- [ ] 稳定主线不依赖 experimental Data Loaders
