---
id: vue.router.learn.intermediate.named-views-route-props
type: lesson
title: 命名视图与路由 Props
summary: 用同层多出口组织页面区域，并把路由输入转换为可复用组件 Props
domain: frontend
technology: vue
module: router
related:
  - vue.router.learn.basics.nested-routes
  - vue.router.learn.intermediate.named-routes-redirects-aliases
  - vue.core.learn.basics.props
tags:
  - Vue Router
  - named views
  - RouterView
  - route props
  - component decoupling
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router：Named Views
    url: https://router.vuejs.org/guide/essentials/named-views
  - title: Vue Router：Passing Props to Route Components
    url: https://router.vuejs.org/guide/essentials/passing-props
  - title: Vue Router API：RouteRecordMultipleViews
    url: https://router.vuejs.org/api/interfaces/routerecordmultipleviews
  - title: Vue Router API：RouterView
    url: https://router.vuejs.org/api/variables/routerview
  - title: Vue Router 5.2.0 RouterView.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts
stage: intermediate
level: intermediate
estimatedMinutes: 55
prerequisites:
  - vue.router.learn.basics.nested-routes
  - vue.router.learn.intermediate.named-routes-redirects-aliases
objectives:
  - 区分同一层的命名视图与不同深度的嵌套视图
  - 用 components 把一条 route record 映射到多个同层 outlet
  - 用 boolean、object 和 function 模式向路由组件传入 Props
  - 在命名视图的输入契约不同时，按 outlet 分别配置 Props 映射
  - 让业务组件只依赖 Props，而不是绑死当前 route
recap:
  - 命名视图在同一 record/depth 同时渲染多个 outlet。
  - 无名 RouterView 的真实名称是 default。
  - boolean、object 和 function 模式分别处理 params、静态值和自定义转换。
  - 各视图契约不同时，多视图 record 按 outlet name 分别配置 Props。
  - 把 route 输入转为 Props 能降低组件与路由的耦合。
---

# 命名视图与路由 Props

## 一、命名视图表达同一层的多个区域

嵌套路由是父子 record 在不同 RouterView depth 上逐层渲染；命名视图则让同一条 record 在同一 depth 同时填入多个 outlet。没有 name 的 RouterView 名为 default，其他 outlet 通过字符串 name 与 record.components 的 key 对应。

~~~~vue
<template>
  <RouterView />
  <RouterView name="sidebar" />
  <RouterView name="helper" />
</template>
~~~~

~~~~ts
const routes = [{
  path: '/workspace/:teamId',
  components: {
    default: WorkspaceMain,
    sidebar: WorkspaceSidebar,
    helper: WorkspaceHelper,
  },
}]
~~~~

## 二、路由 Props 把 URL 输入停在组件边界外

组件直接读取 useRoute() 或 $route 时，它只能在特定路由上工作。record.props 可以先把 params、query 或静态配置整理为普通 Props，路由组件因此能像普通组件一样复用和测试。

| 模式 | 传入值 | 适合场景 |
| --- | --- | --- |
| props: true | 当前 route.params | 组件 Props 与路径参数同名 |
| props: { ... } | 固定对象 | 对某条记录注入静态模式或标志 |
| props: route =&gt; ({ ... }) | 函数返回值 | 转换 query、params 或组合静态值 |

function 模式应保持无状态：它根据新 route 纯转换 Props，不在内部发请求或依赖不受 route 变化驱动的外部可变状态。需要组件内反应式状态时，使用包装组件明确承接。

## 三、不同 outlet 可以使用不同 Props 契约

多视图 record 可以用一个 boolean 把同一模式应用到所有视图；当各区域的输入契约不同时，props 对象则以视图名为 key 分别配置。例如 default 直接接收 params，sidebar 把 query 转为稳定字符串，helper 接收静态显示模式。

~~~~ts
{
  path: '/workspace/:teamId',
  components: { default: Main, sidebar: Sidebar, helper: Helper },
  props: {
    default: true,
    sidebar: route => ({
      teamId: String(route.params.teamId),
      filter: String(route.query.filter ?? 'all'),
    }),
    helper: { mode: 'tips' },
  },
}
~~~~

## 四、在隔离 Demo 中观察三个视图边界

下面的 mini-app 在同一 depth 渲染 default、sidebar 和 helper 三个真实 RouterView。切换 teamId 和 filter 后，sidebar 与 helper 只显示自己声明的 Props；default 视图可在 Props 组件和直接读取 useRoute() 的耦合组件之间切换，对比两种边界。

:::demo{id="vue.router.learn.intermediate.named-views-route-props.named-views-route-props-lab-demo" playground="true"}
用三个同层 outlet 对比 boolean、function 和 object Props 模式
:::

## 五、易错使用提示

:::pitfalls
### 多视图记录仍使用 component

**触发条件：** 多视图记录仍使用 component

**原因：** 单一 component 只对应 default outlet，多个同层出口需要 components。

**后果：** sidebar/helper 找不到对应组件，页面区域保持空白。

**错误示例：**

~~~~ts
{ path: '/workspace', component: { default: Main, sidebar: Side } }
~~~~

**正确写法：**

~~~~ts
{ path: '/workspace', components: { default: Main, sidebar: Side } }
~~~~

**验证方式：** 对照正确写法验证结果。

### outlet name 与 components key 不一致

**触发条件：** outlet name 与 components key 不一致

**原因：** RouterView 通过精确的 name 在当前 matched record.components 中取组件。

**后果：** 路由已命中但对应 outlet 无内容，且容易被误判为匹配失败。

**错误示例：**

~~~~vue
<RouterView name="side" /> <!-- components.sidebar -->
~~~~

**正确写法：**

~~~~vue
<RouterView name="sidebar" /> <!-- components.sidebar -->
~~~~

**验证方式：** 对照正确写法验证结果。

### 把命名视图当成嵌套路由

**触发条件：** 把命名视图当成嵌套路由

**原因：** 命名视图是同一 record/depth 的多出口，嵌套路由是 children 推进 depth。

**后果：** 为了同层布局无故增加 URL segment 和 child record，路由结构变得难以维护。

**错误示例：**

~~~~ts
{ path: '/workspace', component: Main, children: [{ path: 'sidebar', component: Side }] }
~~~~

**正确写法：**

~~~~ts
{ path: '/workspace', components: { default: Main, sidebar: Side } }
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 props: true 会传入 query

**触发条件：** 认为 props: true 会传入 query

**原因：** boolean true 只把 route.params 作为 Props，query 需要 function 模式显式映射。

**后果：** 组件收不到预期的 filter，又退回内部读取 route.query。

**错误示例：**

~~~~ts
{ path: '/search', component: Search, props: true } // 期望 query.q
~~~~

**正确写法：**

~~~~ts
{ path: '/search', component: Search, props: route => ({ q: route.query.q }) }
~~~~

**验证方式：** 对照正确写法验证结果。

### 各视图契约不同时仍共用全局 props: true

**触发条件：** 各视图契约不同时仍共用全局 props: true

**原因：** 多视图 record 的 boolean 会应用到所有视图；若 sidebar 需要 query 转换，就应以 default/sidebar 为 key 分别配置。

**后果：** sidebar 只收到 params，而收不到预期的 filter query。

**错误示例：**

~~~~ts
components: { default: Main, sidebar: Side }, props: true // sidebar 需要 query.filter
~~~~

**正确写法：**

~~~~ts
components: { default: Main, sidebar: Side }, props: { default: true, sidebar: route => ({ filter: route.query.filter }) }
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 props function 里维护可变状态

**触发条件：** 在 props function 里维护可变状态

**原因：** 该函数的职责是把 route 纯转换为 Props，不是执行副作用。

**后果：** 重新渲染或 route 变化时产生重复请求、隐式计数或难以跟踪的状态。

**错误示例：**

~~~~ts
props: route => { fetchData(route.params.id); return { id: route.params.id } }
~~~~

**正确写法：**

~~~~ts
props: route => ({ id: String(route.params.id) })
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 static object props 中读取当前 route

**触发条件：** 在 static object props 中读取当前 route

**原因：** object 模式在路由配置中就是固定值，不能访问每次导航才产生的 route；需要 URL 输入时应使用 function 模式。

**后果：** 配置阶段引用不存在的 route，或参数变化后 Props 仍停留在旧的固定值。

**错误示例：**

~~~~ts
props: {
  default: { teamId: route.params.teamId }, // route 不在配置作用域
}
~~~~

**正确写法：**

~~~~ts
props: {
  default: route => ({ teamId: String(route.params.teamId) }),
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 配置 Props 后组件仍强耦合 route

**触发条件：** 配置 Props 后组件仍强耦合 route

**原因：** 既然边界已映射 teamId/filter，业务组件应直接使用声明的 Props。

**后果：** 组件在非路由场景下仍无法复用，测试也必须额外安装 router。

**错误示例：**

~~~~ts
const teamId = useRoute().params.teamId
~~~~

**正确写法：**

~~~~ts
const props = defineProps<{ teamId: string }>()
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、从源码推导适用场景

:::steps
### 1. default 也是显式视图名

RouterView 的 name prop 默认为 default，渲染时用它读取 matchedRoute.components[currentName]。因此多视图配置中 default 不是特殊句法，而是无名 outlet 的真实 key。

### 2. Props 转换在 RouterView 边界完成

RouterView 先按视图名取 matchedRoute.props[currentName]；true 取 route.params，function 以 route 求值，对象则直接使用。这个统一边界适合把 URL 细节隔离在可复用组件之外。

### 3. 同层命名 outlet 共享 matched depth

多个同层 RouterView 使用同一 depth，只通过 name 选择同一 record 的不同 component。页面中需要主区、侧栏、辅助区联动切换时选它；需要父子 URL 层级时选 children。

### 4. 组件实例仍由正常 Vue 语义决定是否复用

RouterView 为选中 component 创建 VNode，并把 route Props 与 attrs 传入。同一 component 在 params/query 变化时可以复用实例，所以组件应让 Props 反应式驱动界面，而不把初始值复制成不再同步的普通变量。
:::

:::exercise
### 为工作台设计三个视图的 Props

**要求：** 路径为 /workspace/\:teamId?filter=open。请让 default 接收 teamId，sidebar 接收 teamId 和 filter，helper 接收静态 mode: tips。

**验收：** 完成题目要求。

**参考答案：** props: {
  default: true,
  sidebar: route =&gt; ({
    teamId: String(route.params.teamId),
    filter: String(route.query.filter ?? 'all'),
  }),
  helper: { mode: 'tips' },
}
:::

- [ ] 同层多区域使用 components 和命名 RouterView
- [ ] 无名 RouterView 对应 default key
- [ ] props: true 只传 params
- [ ] 命名视图按视图名分别配置 Props
- [ ] props function 保持无状态且无副作用
- [ ] 业务组件只依赖声明的 Props
