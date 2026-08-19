---
id: vue.router.learn.basics.composition-programmatic-navigation
type: lesson
title: 组合式 API 与编程式导航
summary: 用当前 route 组织响应式逻辑，用 router 命令明确控制导航和历史
domain: frontend
technology: vue
module: router
related:
  - vue.router.learn.basics.route-params-query-matching
  - vue.router.learn.basics.nested-routes
  - vue.core.learn.basics.watchers
tags:
  - Vue Router
  - useRouter
  - useRoute
  - programmatic navigation
  - navigation guards
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-03
sources:
  - title: Vue Router：Composition API
    url: https://router.vuejs.org/guide/advanced/composition-api.html
  - title: Vue Router：Programmatic Navigation
    url: https://router.vuejs.org/guide/essentials/navigation.html
  - title: Vue Router API：useRoute()
    url: https://router.vuejs.org/api/functions/useroute
  - title: Vue Router API：useRouter()
    url: https://router.vuejs.org/api/functions/userouter
  - title: Vue Router 5.2.0 useApi.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/useApi.ts
stage: basics
level: beginner
estimatedMinutes: 55
prerequisites:
  - vue.router.learn.basics.route-params-query-matching
  - vue.router.learn.basics.nested-routes
objectives:
  - 区分 useRoute() 返回的响应式导航状态与 useRouter() 返回的命令对象
  - 用 push、replace 和 go 表达不同的历史记录意图
  - 等待导航 Promise 并根据最终结果更新界面
  - 只侦听 route.params 中真正驱动副作用的字段
  - 用 update/leave guard 分别处理组件复用和离开记录
recap:
  - useRoute() 提供当前响应式 route，useRouter() 提供导航命令。
  - push 新增历史条目，replace 覆盖当前条目，go 移动指针。
  - push/replace 返回导航 Promise，go 返回 void。
  - 侦听 route.params.id 比侦听整个 route 更精确。
  - update guard 处理同记录复用，leave guard 保护离开记录的动作。
---

# 组合式 API 与编程式导航

## 一、route 描述现在，router 提交下一步

useRoute() 返回当前标准化 route 的响应式视图，适合读取 params、query、hash 与 matched。useRouter() 返回已安装的 router 实例，用来 push、replace、go 或注册全局能力。前者是状态入口，后者是命令入口。

~~~~vue
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

/** 保留当前 query，并导航到下一个用户。 */
async function openUser(id: string) {
  await router.push({ name: 'user', params: { id }, query: route.query })
}
</script>
~~~~

## 二、push 与 replace 改变的是历史语义

| 方法 | 对历史的影响 | 常见用途 |
| --- | --- | --- |
| router.push(to) | 在当前位置后新增一条 | 进入可回退的新页面 |
| router.replace(to) | 覆盖当前条目 | 登录回跳、默认参数规范化 |
| router.go(delta) | 移动历史指针 | 返回或前进已存在的条目 |

push() 与 replace() 都走完整导航流程，并返回可等待的 Promise。成功时 Promise 解析为 undefined，被守卫取消或发生重复导航时会解析为 NavigationFailure。go() 委托给 history 移动指针，本身不返回导航 Promise。

:::compare
### 错误写法

~~~~text
历史：/users/1 → /users/2；指针在 /users/2。
~~~~

### 正确写法

~~~~text
执行 replace(/users/3) 后：/users/1 → /users/3；没有新增第三条。
~~~~
:::

## 三、只让真正的依赖驱动副作用

route 是响应式对象，但这不意味着要 watch 整个 route。用户数据只依赖 params.id 时，侦听 getter 即可；单纯改变 query 不应重读用户。同一记录的参数变化会复用组件，onBeforeRouteUpdate() 则适合在提交前校验或预取。

~~~~ts
const route = useRoute()

watch(
  () => route.params.id,
  (id) => loadUser(String(id)),
  { immediate: true },
)

onBeforeRouteUpdate((to, from) => {
  if (to.params.id === from.params.id) return
  // 参数导航提交前校验或预取
})
~~~~

## 四、leave guard 保护真正的离开动作

onBeforeRouteLeave() 只在当前组件要离开其激活记录时执行。从 /users/1 到 /users/2 复用同一记录，走 update guard；从 /users/2 到 /done 才走 leave guard。未保存时返回 false 会取消本次导航，当前位置和历史指针都应保持不变。

## 五、在隔离 Demo 中对比命令与守卫

下面的 mini-app 从 /users/1 开始：push 新增用户 2，replace 用用户 3 覆盖当前条目，go(-1) 回到用户 1。它同时展示定向 watch、update/leave guard 计数和导航结果；勾选“有未保存更改”后，离开用户记录会被拒绝。

:::demo{id="vue.router.learn.basics.composition-programmatic-navigation.composition-navigation-lab-demo" playground="true"}
对比 push、replace、go、定向 watch 与组件内守卫
:::

## 六、易错使用提示

:::pitfalls
### 侦听整个 route 对象

**触发条件：** 侦听整个 route 对象

**原因：** route 包含 params、query、hash 和 matched 等多类响应式状态，整体侦听会扩大副作用边界。

**后果：** 只切换 tab query 也重新请求用户数据，增加竞态和无效流量。

**错误示例：**

~~~~ts
watch(route, () => loadUser(String(route.params.id)))
~~~~

**正确写法：**

~~~~ts
watch(() => route.params.id, (id) => loadUser(String(id)))
~~~~

**验证方式：** 对照正确写法验证结果。

### 在没有注入上下文的普通模块顶层调用 composable

**触发条件：** 在没有注入上下文的普通模块顶层调用 composable

**原因：** useRouter() 与 useRoute() 通过 Vue inject 读取 router 提供的 key，需要处于已安装 router 的组件 setup 上下文。

**后果：** 得到缺失注入的值，后续调用 push 或读取 params 时立即失败。

**错误示例：**

~~~~ts
// services/navigation.ts
const router = useRouter()
~~~~

**正确写法：**

~~~~ts
// 组件 setup 内
const router = useRouter()
~~~~

**验证方式：** 对照正确写法验证结果。

### 不等待导航 Promise 就宣布成功

**触发条件：** 不等待导航 Promise 就宣布成功

**原因：** push() 和 replace() 需要经过匹配、守卫与最终提交，返回的 Promise 才代表该次导航已结束。

**后果：** 导航被取消时仍关闭编辑器或提示“保存成功”，界面与 URL 状态脱节。

**错误示例：**

~~~~ts
router.push('/done')
showSuccess()
~~~~

**正确写法：**

~~~~ts
const failure = await router.push('/done')
if (!failure) showSuccess()
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 route 当成导航命令对象

**触发条件：** 把 route 当成导航命令对象

**原因：** route 提供当前位置的标准化响应式状态，不提供 push、replace 或 go。

**后果：** 调用不存在的方法，或试图直接改 params 却没有任何导航。

**错误示例：**

~~~~ts
const route = useRoute()
route.push('/done')
~~~~

**正确写法：**

~~~~ts
const router = useRouter()
await router.push('/done')
~~~~

**验证方式：** 对照正确写法验证结果。

### 期望 replace 新增一条可回退历史

**触发条件：** 期望 replace 新增一条可回退历史

**原因：** replace() 会在导航成功时覆盖当前历史条目，而不是向后追加。

**后果：** 用户按返回键跳过被覆盖的页面，与产品预期的导航路径不同。

**错误示例：**

~~~~ts
await router.replace('/checkout') // 期望返回到当前表单
~~~~

**正确写法：**

~~~~ts
await router.push('/checkout') // 需要保留当前表单时
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 window.history 绕过 router

**触发条件：** 用 window.history 绕过 router

**原因：** Vue Router 的导航方法会先解析记录并执行守卫；直接修改浏览器 history 不等价。

**后果：** URL 可能改变，但 currentRoute、视图和守卫状态没有同步进入目标位置。

**错误示例：**

~~~~ts
window.history.pushState({}, '', '/users/2')
~~~~

**正确写法：**

~~~~ts
await router.push({ name: 'user', params: { id: '2' } })
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 update guard 和 leave guard 用反

**触发条件：** 把 update guard 和 leave guard 用反

**原因：** update guard 处理同记录复用时的参数变化，leave guard 处理组件即将离开激活记录。

**后果：** 切换用户时未校验新 id，真正离开编辑页时又没有阻止未保存更改。

**错误示例：**

~~~~ts
onBeforeRouteUpdate(() => hasUnsavedChanges.value ? false : undefined)
~~~~

**正确写法：**

~~~~ts
onBeforeRouteLeave(() => hasUnsavedChanges.value ? false : undefined)
~~~~

**验证方式：** 对照正确写法验证结果。

### 对 router.go() 使用 await 并假设已完成导航

**触发条件：** 对 router.go() 使用 await 并假设已完成导航

**原因：** go(delta) 返回 void，它只要求 history 移动指针，不提供可等待的导航结果。

**后果：** await 会立即继续，后续代码读到的可能还是旧 currentRoute。

**错误示例：**

~~~~ts
await router.go(-1)
readCurrentPage()
~~~~

**正确写法：**

~~~~ts
router.go(-1)
// 在 afterEach 或 currentRoute 侦听中响应最终位置
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 七、从源码推导适用场景

:::steps
### 1. useApi 只暴露当前注入上下文

useRouter() 和 useRoute() 分别 inject routerKey 与 routeLocationKey。组件内需要当前 router 时使用 composable；独立 service 需要导航时，应显式传入 router 或在应用组装层调用，不要伪造全局注入上下文。

### 2. push 与 replace 共享导航管线

replace() 会把 replace 标记带入和 push() 相同的导航入口；两者都先解析 target、运行 guards，只在最终提交 history 时选择 push 或 replace。因此业务后续动作应等待 Promise，而不应根据方法名推测守卫已通过。

### 3. 组件 guard 跟随激活 record 生命周期

onBeforeRouteUpdate() 和 onBeforeRouteLeave() 把 guard 放入当前 matched record 的对应集合，并在组件卸载时移除。这些 guard 适合与当前视图共生的参数预取或未保存表单；跨页权限规则则应留在后续全局守卫课程。
:::

:::exercise
### 设计一条可回退的编辑流程

**要求：** 从 /users/1 出发，用 push 进入用户 2，再用 replace 把当前条目改为用户 3。写出此时的历史序列、go(-1) 的目标，并说明哪些操作触发 update guard。

**验收：** 完成题目要求。

**参考答案：** // 初始：[/users/1]
await router.push('/users/2')
// [/users/1, /users/2]
await router.replace('/users/3')
// [/users/1, /users/3]
router.go(-1)
// 目标是 /users/1
// 三次导航都在同一 user record 内改变 id，会触发 update guard。
:::

- [ ] route 只负责当前状态，router 负责导航命令
- [ ] push 新增历史，replace 覆盖当前条目
- [ ] push/replace 的后续逻辑等待导航 Promise
- [ ] 只侦听真正驱动副作用的 route 字段
- [ ] update 与 leave guard 按记录生命周期分工
