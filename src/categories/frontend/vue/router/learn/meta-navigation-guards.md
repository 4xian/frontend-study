---
id: vue.router.learn.intermediate.meta-navigation-guards
type: lesson
title: 路由 Meta 与导航守卫
summary: 用类型化 Meta 表达访问约束，按导航阶段安排放行、取消和重定向
domain: frontend
technology: vue
module: router
related:
  - vue.router.learn.basics.composition-programmatic-navigation
  - vue.router.learn.intermediate.named-routes-redirects-aliases
  - vue.router.learn.intermediate.named-views-route-props
tags:
  - Vue Router
  - RouteMeta
  - navigation guards
  - authorization
  - guard order
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router：Route Meta Fields
    url: https://router.vuejs.org/guide/advanced/meta
  - title: Vue Router：Navigation Guards
    url: https://router.vuejs.org/guide/advanced/navigation-guards
  - title: Vue Router API：RouteMeta
    url: https://router.vuejs.org/api/interfaces/routemeta
  - title: Vue Router 5.2.0 navigationGuards.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/navigationGuards.ts
  - title: Vue Router 5.2.0 router.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/router.ts
stage: intermediate
level: intermediate
estimatedMinutes: 65
prerequisites:
  - vue.router.learn.basics.composition-programmatic-navigation
  - vue.router.learn.intermediate.named-routes-redirects-aliases
  - vue.router.learn.intermediate.named-views-route-props
objectives:
  - 为 RouteMeta 扩展项目内的访问约束类型
  - 区分 route.matched 的记录数组与 route.meta 的非递归浅合并
  - 按 global、per-route 和 in-component 阶段安排守卫
  - 用 return undefined、false 或 location 表达放行、取消与重定向
  - 识别 beforeResolve 与 afterEach 在导航管线中的不同职责
recap:
  - RouteMeta 模块扩展让访问约束具有稳定类型。
  - route.matched 保留原始记录，route.meta 是父到子的浅合并。
  - 守卫按离开、全局前置、复用、记录进入、组件进入、全局解析顺序执行。
  - undefined/true、false 和 location 分别表达放行、取消和重定向。
  - afterEach 观察已结算的导航，无法再改变结果。
---

# 路由 Meta 与导航守卫

## 一、Meta 描述记录，守卫执行决策

meta 是 route record 上的任意结构数据，适合表达需要登录、必须具有某个角色、页面转场名等稳定属性。守卫读取 to.meta 后决定导航结果：不返回值或返回 true 放行，返回 false 取消，返回 route location 触发新的重定向。

~~~~ts
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.loggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiredRole && auth.role !== to.meta.requiredRole) {
    return false
  }
})
~~~~

## 二、用模块扩展固定 Meta 契约

RouteMeta 默认可索引，但项目内应用模块扩展给常用字段加上可选性和联合类型。扩展文件必须被 tsconfig 包含，且至少有一个 import 或 export，才会被当成模块。

~~~~ts
import 'vue-router'
export {}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiredRole?: 'member' | 'admin'
    area?: string
  }
}
~~~~

## 三、route.meta 是父到子的非递归浅合并

route.matched 保留所有命中记录，可以逐条查看原始 meta。route.meta 则从父记录到子记录用浅层 assign 合并：同名顶层 key 由子记录覆盖，嵌套对象不会递归合并。权限字段优先设计为独立顶层 key，避免无意丢失父级子字段。

:::compare
### 错误写法

~~~~text
父：{ requiresAuth: true, policy: { audit: true } }
子：{ requiredRole: admin, policy: { export: true } }
~~~~

### 正确写法

~~~~text
{ requiresAuth: true, requiredRole: admin, policy: { export: true } }
policy.audit 不会被递归保留。
~~~~
:::

## 四、守卫顺序跟随记录的离开、复用与进入

| 阶段 | 运行时机 | 常见职责 |
| --- | --- | --- |
| beforeRouteLeave | 已激活组件将离开 | 未保存更改 |
| beforeEach | 每次导航的全局前置 | 登录与全局政策 |
| beforeRouteUpdate | 同记录组件复用 | 参数变化校验 |
| beforeEnter | 第一次进入记录 | 特定记录约束 |
| beforeRouteEnter | 新组件激活前 | 视图级进入准备 |
| beforeResolve | 所有进入守卫通过后 | 提交前最后校验 |
| afterEach | 导航已确认或失败 | 分析、标题、结果观察 |

afterEach 是后置 hook，可接收 failure 观察已发生的结果，但不能再返回 false 阻止导航。新代码优先使用 return 风格；next 只作为兼容知识，一次守卫的每条可达分支都必须恰好调用一次。

## 五、用角色矩阵观察三种导航结果

下面的 mini-app 在访客、成员和管理员三个角色下访问同一份嵌套报表。访客被重定向登录，成员被 false 取消，管理员按完整守卫顺序放行。可见区同时展示 matched meta 与浅合并后的 route.meta。

:::demo{id="vue.router.learn.intermediate.meta-navigation-guards.meta-navigation-guards-lab-demo" playground="true"}
用三种角色对比 redirect、cancel 和 allow 的守卫时间线
:::

## 六、易错使用提示

:::pitfalls
### 认为嵌套 meta 对象会深合并

**触发条件：** 认为嵌套 meta 对象会深合并

**原因：** route.meta 只对各 record.meta 执行顶层浅合并。

**后果：** 子记录的 policy 整体覆盖父记录，权限约束意外丢失。

**错误示例：**

~~~~ts
// 父 policy: { auth: true }；子 policy: { role: 'admin' }
to.meta.policy.auth // 误以为仍为 true
~~~~

**正确写法：**

~~~~ts
// 使用独立顶层 key
meta: { requiresAuth: true, requiredRole: 'admin' }
~~~~

**验证方式：** 对照正确写法验证结果。

### 只检查最后一条 matched record

**触发条件：** 只检查最后一条 matched record

**原因：** 父记录也可以携带必须继承的 meta 约束。

**后果：** 子记录未重复声明 requiresAuth 时，登录检查被绕过。

**错误示例：**

~~~~ts
to.matched.at(-1)?.meta.requiresAuth
~~~~

**正确写法：**

~~~~ts
to.meta.requiresAuth
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 afterEach 中返回 false 试图阻止导航

**触发条件：** 在 afterEach 中返回 false 试图阻止导航

**原因：** afterEach 运行时导航已经确认或已得到失败结果。

**后果：** 返回值被忽略，受保护页面已经进入。

**错误示例：**

~~~~ts
router.afterEach(() => false)
~~~~

**正确写法：**

~~~~ts
router.beforeEach((to) => to.meta.blocked ? false : undefined)
~~~~

**验证方式：** 对照正确写法验证结果。

### 在同一守卫中同时 return 与调用 next

**触发条件：** 在同一守卫中同时 return 与调用 next

**原因：** 两种风格都能表达结果，但同一函数混用会破坏单一结算点。

**后果：** 导航可能被重复结算，或在某条分支悬挂。

**错误示例：**

~~~~ts
router.beforeEach((to, from, next) => { next(); return false })
~~~~

**正确写法：**

~~~~ts
router.beforeEach((to) => to.meta.blocked ? false : undefined)
~~~~

**验证方式：** 对照正确写法验证结果。

### 兼容 next 风格的分支调用两次

**触发条件：** 兼容 next 风格的分支调用两次

**原因：** 一次守卫中，每条可达路径都必须恰好调用一次 next。

**后果：** 路由器产生警告或不确定导航结果。

**错误示例：**

~~~~ts
if (!ok) next('/login')
next()
~~~~

**正确写法：**

~~~~ts
if (!ok) return next('/login')
next()
~~~~

**验证方式：** 对照正确写法验证结果。

### 重定向守卫没有排除登录页

**触发条件：** 重定向守卫没有排除登录页

**原因：** 新的 location 会重新进入完整守卫管线。

**后果：** 登录页也被判定为需登录，导航在同一目标之间无限重定向。

**错误示例：**

~~~~ts
if (!loggedIn) return { name: 'login' }
~~~~

**正确写法：**

~~~~ts
if (to.meta.requiresAuth && !loggedIn) return { name: 'login' }
~~~~

**验证方式：** 对照正确写法验证结果。

### 期望 beforeEnter 在参数变化时重新运行

**触发条件：** 期望 beforeEnter 在参数变化时重新运行

**原因：** beforeEnter 只在进入新 record 时运行，同 record 的 params/query/hash 变化不会触发。

**后果：** 从 /users/1 到 /users/2 时未执行预期校验。

**错误示例：**

~~~~ts
{ path: '/users/:id', beforeEnter: validateEveryIdChange }
~~~~

**正确写法：**

~~~~ts
onBeforeRouteUpdate((to) => validateId(to.params.id))
~~~~

**验证方式：** 对照正确写法验证结果。

### 异步守卫忘记返回或等待决策

**触发条件：** 异步守卫忘记返回或等待决策

**原因：** 导航在守卫 Promise 结算前保持 pending，决策必须沿返回值传回路由器。

**后果：** 验证尚未完成就继续导航，或一直悬挂在 pending。

**错误示例：**

~~~~ts
router.beforeEach(() => { checkAccess().then(ok => ok ? true : false) })
~~~~

**正确写法：**

~~~~ts
router.beforeEach(async () => (await checkAccess()) || false)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 七、从源码推导适用场景

:::steps
### 1. meta 合并是顺序浅 assign

解析后的 matched 记录从父到子遍历，每个 record.meta 浅层写入同一对象。需要保留每层原始结构时遍历 matched；需要最终政策时读 to.meta，并尽量使用扁平 key。

### 2. 记录身份决定 leave/update/enter 队列

路由器比较 from/to.matched 的记录身份，把它们分成 leaving、updating 和 entering。因此 beforeEnter 适合“第一次进入该记录”的约束，参数复用场景应放在 update guard。

### 3. 守卫返回值被统一转换为 Promise

guardToPromiseFn 把 return false、location、Error 以及无返回值转换为统一导航结果。新代码使用 return 能让每条分支只有一个结算值，比同时管理 next 回调更容易审查。

### 4. afterEach 是观察点，不是决策点

导航确认或失败后，router 才把 to/from/failure 交给 afterEach。这里适合记录分析、发送页面观察事件和读取 failure；需要改变结果的规则必须放在前置守卫。
:::

:::exercise
### 为嵌套管理页设计扁平 Meta

**要求：** 父级所有页面需要登录，报表子页只允许 admin，并使用 reports 区域标记。写出记录 meta 与守卫。

**验收：** 完成题目要求。

**参考答案：** // 父记录
meta: { requiresAuth: true }
// 报表子记录
meta: { requiredRole: 'admin', area: 'reports' }
router.beforeEach((to) =&gt; {
  if (to.meta.requiresAuth && !auth.loggedIn) return { name: 'login' }
  if (to.meta.requiredRole && auth.role !== to.meta.requiredRole) return false
})
:::

- [ ] 使用模块扩展约束常用 RouteMeta 字段
- [ ] route.meta 是父到子的非递归浅合并
- [ ] 全局政策放 beforeEach，记录约束放 beforeEnter
- [ ] 使用 return 表达 allow、cancel 和 redirect
- [ ] afterEach 只观察最终结果，不阻止导航
- [ ] 重定向守卫排除目标页，避免循环
