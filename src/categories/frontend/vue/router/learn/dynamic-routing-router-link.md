---
id: vue.router.learn.advanced.dynamic-routing-router-link
type: lesson
title: 动态路由与 RouterLink 扩展
summary: 在运行时管理 matcher，并复用 RouterLink 的链接解析与导航语义
domain: frontend
technology: vue
module: router
related:
  - vue.router.learn.basics.router-link-view-active
  - vue.router.learn.intermediate.named-routes-redirects-aliases
  - vue.router.learn.advanced.navigation-failures
tags:
  - Vue Router
  - addRoute
  - removeRoute
  - useLink
  - RouterLink
appliesTo: Vue 3.5.40、Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router：Dynamic Routing
    url: https://router.vuejs.org/guide/advanced/dynamic-routing
  - title: Vue Router：Extending RouterLink
    url: https://router.vuejs.org/guide/advanced/extending-router-link
  - title: Vue Router API：Router
    url: https://router.vuejs.org/api/interfaces/router
  - title: Vue Router API：useLink()
    url: https://router.vuejs.org/api/functions/uselink
  - title: Vue Router API：RouterLink
    url: https://router.vuejs.org/api/variables/routerlink
  - title: Vue Router 5.2.0 router.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts
  - title: Vue Router 5.2.0 matcher/index.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/matcher/index.ts
  - title: Vue Router 5.2.0 RouterLink.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterLink.ts
stage: advanced
level: advanced
estimatedMinutes: 80
prerequisites:
  - vue.router.learn.intermediate.named-routes-redirects-aliases
  - vue.router.learn.advanced.navigation-failures
objectives:
  - 使用 addRoute、removeRoute、hasRoute 与 getRoutes 管理运行时记录
  - 区分 matcher 已改变与 current route 已重新解析
  - 在守卫内通过 return location 收敛动态注册导航
  - 用 useLink 复用 href、active、exact 与标准 navigate 行为
  - 让外部 URL 走原生链接并保留安全属性
recap:
  - 动态注册只改变 matcher，显式导航才会重新提交 current route 与 RouterView。
  - 守卫内通过 return location 收敛注册流程，组件中则可 await replace 当前地址。
  - 同名替换、removeRoute 与 disposer 都要建立清晰的 route 所有权。
  - useLink 复用 RouterLink 的 href、active、exact 与标准 navigate 行为。
  - 外部 URL 属于浏览器原生链接边界，不应交给 client router。
---

# 动态路由与 RouterLink 扩展

## 一、动态路由改变 matcher，不会改写当前 route 快照

`addRoute()` 只注册后续解析可用的记录。如果新记录更精确地匹配当前 URL，已经提交的 `currentRoute` 与 RouterView 仍保持旧 matched；组件挂载期间注册后，应显式 replace 当前 fullPath 并等待导航结算。

~~~~ts
const removeFeatureRoute = router.addRoute({
  path: '/feature/tool',
  name: 'feature-tool',
  component: FeatureTool,
})

await router.replace(router.currentRoute.value.fullPath)
~~~~

| 动作 | matcher | currentRoute / RouterView |
| --- | --- | --- |
| addRoute | 立即增加记录 | 保持已提交快照 |
| removeRoute / disposer | 立即移除记录 | 保持已提交快照 |
| replace current fullPath | 用最新 matcher 解析 | 提交新的 matched 与视图 |

## 二、在导航守卫内返回位置，不发起嵌套 replace

~~~~ts
router.beforeEach((to) => {
  if (!router.hasRoute('feature-tool') && canLoadFeature(to)) {
    router.addRoute(createFeatureRoute())
    return to.fullPath
  }
})
~~~~

guard 返回位置会替换当前进行中的导航。`hasRoute()` 或业务注册表必须在下一轮变为 true，否则会无限重定向。组件挂载后的显式 replace 与守卫内 return location 是两个场景，不应混用。

## 三、移除记录有三种入口，但都只改变 matcher

可以调用 `removeRoute(name)`、执行 `addRoute()` 返回的 disposer，或用同名新记录替换旧记录。移除 parent 会递归移除 children 与 aliases。route name 在整个 Router 中唯一；插件化场景可用 Symbol 降低命名冲突。

~~~~ts
const dispose = router.addRoute(featureRoute)

router.hasRoute('feature-tool')
router.getRoutes().map((record) => record.name)

dispose() // 只移除本次注册仍存在的 matcher
~~~~

## 四、useLink 提供行为，渲染责任仍在组件

`useLink({ to, replace })` 返回 resolved route、href、isActive、isExactActive 与 navigate。自定义组件仍应输出真实 `&lt;a&gt;`、绑定 href、在 exact active 时设置 `aria-current="page"`，并把 click 交给 navigate；它不是把链接降级成按钮。

~~~~vue
<script setup lang="ts">
const props = defineProps<{ to: RouteLocationRaw }>()
const { href, isActive, isExactActive, navigate } = useLink(props)
</script>

<template>
  <a
    :href="href"
    :class="{ active: isActive }"
    :aria-current="isExactActive ? 'page' : undefined"
    @click="navigate"
  ><slot /></a>
</template>
~~~~

## 五、外部链接先旁路 client router

RouterLink 的 navigate 会保留修饰键、非左键、已阻止事件和 `_blank` 的浏览器行为；包装组件不应复制一套不完整判断。`https:` 等外部 URL 直接渲染原生 `&lt;a target="_blank" rel="noopener noreferrer"&gt;`，不要交给 `useLink()` 解析。

## 六、用一个实验观察 matcher、route 与 link 三组状态

下面的独立 memory router 先让 `/feature/tool?mode=inspect` 命中 fallback。注册动态记录后，hasRoute 与 getRoutes 先改变；只有 replace 当前地址后 matched 与 RouterView 才切到 feature。实验还展示 useLink 的 href/active/exact、标准键盘导航和外链旁路。

:::demo{id="vue.router.learn.advanced.dynamic-routing-router-link.dynamic-routing-router-link-lab-demo" playground="true"}
分步观察 matcher 注册、当前 route 刷新与 useLink 导航语义
:::

## 七、易错使用提示

:::pitfalls
### 认为 addRoute 会立即刷新当前 RouterView

**触发条件：** 认为 addRoute 会立即刷新当前 RouterView

**原因：** addRoute 只修改 matcher，不重新提交 currentRoute。

**后果：** hasRoute 已为 true，页面仍显示旧 fallback。

**错误示例：**

~~~~ts
router.addRoute(featureRoute)
// 错误假设：页面已经切换
~~~~

**正确写法：**

~~~~ts
router.addRoute(featureRoute)
await router.replace(router.currentRoute.value.fullPath)
~~~~

**验证方式：** 对照正确写法验证结果。

### 守卫内注册后调用 router.replace

**触发条件：** 守卫内注册后调用 router.replace

**原因：** 当前导航尚未结算，又从 guard 内发起第二次导航。

**后果：** 控制流难以追踪，并可能与原导航竞态。

**错误示例：**

~~~~ts
router.beforeEach(() => {
  router.addRoute(route)
  router.replace('/feature')
})
~~~~

**正确写法：**

~~~~ts
router.beforeEach((to) => {
  router.addRoute(route)
  return to.fullPath
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 动态注册条件永远不收敛

**触发条件：** 动态注册条件永远不收敛

**原因：** 返回位置后 guard 会对新导航再次运行。

**后果：** 同一地址持续重定向，页面永远无法 ready。

**错误示例：**

~~~~ts
if (needsFeature(to)) {
  router.addRoute(route)
  return to.fullPath
}
~~~~

**正确写法：**

~~~~ts
if (!router.hasRoute(route.name)) {
  router.addRoute(route)
  return to.fullPath
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 忽略 route name 的全局唯一性

**触发条件：** 忽略 route name 的全局唯一性

**原因：** 同名 addRoute 会先移除旧记录。

**后果：** 另一个模块的 route、children 与 aliases 被意外替换。

**错误示例：**

~~~~ts
router.addRoute({ name: 'settings', ...pluginRoute })
~~~~

**正确写法：**

~~~~ts
const pluginRouteName = Symbol('plugin-settings')
~~~~

**验证方式：** 对照正确写法验证结果。

### 移除 parent 后仍依赖 child 或 alias

**触发条件：** 移除 parent 后仍依赖 child 或 alias

**原因：** matcher 会递归移除 parent 的 children 与 aliases。

**后果：** 菜单仍展示链接，但 resolve 已落入 fallback。

**错误示例：**

~~~~ts
router.removeRoute('admin')
router.push({ name: 'admin-settings' })
~~~~

**正确写法：**

~~~~ts
router.removeRoute('admin')
removeAdminMenuItems()
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 getRoutes 的内部字段当应用协议

**触发条件：** 把 getRoutes 的内部字段当应用协议

**原因：** matcher score、regex 等实现字段不是公开 RouteRecord contract。

**后果：** Vue Router 升级后菜单或权限逻辑静默失效。

**错误示例：**

~~~~ts
router.getRoutes().sort((a, b) => b.score - a.score)
~~~~

**正确写法：**

~~~~ts
router.getRoutes().map(({ name, path, meta }) => ({ name, path, meta }))
~~~~

**验证方式：** 对照正确写法验证结果。

### 自定义链接只监听 click，不输出 href

**触发条件：** 自定义链接只监听 click，不输出 href

**原因：** 按钮式导航失去链接的原生语义。

**后果：** 无法复制地址、预览状态栏、键盘打开或新标签访问。

**错误示例：**

~~~~vue
<span @click="router.push(to)"><slot /></span>
~~~~

**正确写法：**

~~~~vue
<a :href="href" @click="navigate"><slot /></a>
~~~~

**验证方式：** 对照正确写法验证结果。

### 手写 router.push 取代 useLink.navigate

**触发条件：** 手写 router.push 取代 useLink.navigate

**原因：** 手写 handler 通常遗漏修饰键、右键、preventDefault 与 target 旁路。

**后果：** Ctrl/Meta click 不能按浏览器预期打开新标签。

**错误示例：**

~~~~vue
<a :href="href" @click.prevent="router.push(to)">打开</a>
~~~~

**正确写法：**

~~~~vue
<a :href="href" @click="navigate">打开</a>
~~~~

**验证方式：** 对照正确写法验证结果。

### active 链接只改变颜色

**触发条件：** active 链接只改变颜色

**原因：** 颜色不是辅助技术可读取的当前页状态。

**后果：** 视觉上可辨认，屏幕阅读器却无法知道当前位置。

**错误示例：**

~~~~vue
<a :class="{ active: isExactActive }">当前页</a>
~~~~

**正确写法：**

~~~~vue
<a :aria-current="isExactActive ? 'page' : undefined">当前页</a>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把外部 URL 交给 RouterLink

**触发条件：** 把外部 URL 交给 RouterLink

**原因：** client router 的 location contract 面向站内 route。

**后果：** 外链被当成本地路径解析，或新窗口缺少 opener 隔离。

**错误示例：**

~~~~vue
<RouterLink to="https://router.vuejs.org/">官网</RouterLink>
~~~~

**正确写法：**

~~~~vue
<a href="https://router.vuejs.org/" target="_blank" rel="noopener noreferrer">官网</a>
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 八、从源码推导适用场景

:::steps
### 1. matcher 与 currentRoute 是两个提交面

Router 的 add/remove/has/get 直接委托 matcher，只有导航 finalize 才写 currentRoute。插件加载完成可先注册一组记录，再用一次 replace 统一提交当前视图。

### 2. 同名替换适合明确所有权，不适合隐式覆盖

matcher 在插入具名记录前移除旧记录。单一模块热更新可利用该语义；跨插件协作则应分配稳定命名空间或 Symbol，避免把替换当成去重。

### 3. disposer 绑定本次 matcher 身份

addRoute 返回的函数捕获本次 matcher；记录已经被替换时旧 disposer 再执行是 no-op，不会按同名误删新记录。适合组件或插件在自己的 teardown 中清理所有权明确的 route。

### 4. parent 移除是一棵 matcher 子树操作

remove 会递归 children 与 aliases，并同步 name map。权限撤销或插件卸载时可一次清理整棵路由子树，但菜单、缓存与业务状态仍需由各自所有者清理。

### 5. useLink 的 route 与 href 都是 computed

props.to 或当前 route 改变时会重新 resolve 并派生 active。适合主题化链接、菜单项和埋点包装，不需要复制 RouterLink 的解析算法。

### 6. active 不能充当即时 matcher inventory

useLink 的 resolved route 是 computed，但 matcher 数组本身不是响应式依赖。只调用 add/remove 时，to 与 current route 都未变化，active 可以保留旧快照；显式导航或改变 to 后才重新求值。注册状态应读取 hasRoute/getRoutes。

### 7. guardEvent 是浏览器语义的公共边界

navigate 先过滤修饰键、非左键、defaultPrevented 与 `_blank`，再 preventDefault 并调用 Router。测试自定义链接时应覆盖这些公开行为，不依赖私有函数名称。

### 8. RouterLink 与 useLink 共用同一行为 seam

RouterLink 本身调用 useLink 后选择默认 `&lt;a&gt;` 或 custom slot。组件库可以按渲染复杂度选择 slot 或组合函数，但 active 与 navigate 的业务含义应保持一致。
:::

- [ ] 明确 route 的注册所有者，并保存 addRoute disposer
- [ ] matcher 改变后按场景 replace 当前地址或在 guard 中 return location
- [ ] 用 hasRoute/getRoutes 的公开字段建立可观察状态
- [ ] 自定义内部链接保留 href、navigate 与 aria-current
- [ ] 让修饰键、右键和 _blank 继续使用浏览器原生行为
- [ ] 外部 URL 使用带安全 rel 的原生链接
