---
id: vue.router.learn.basics.nested-routes
type: lesson
title: 嵌套路由
summary: 让 URL segment、children records 与嵌套 RouterView 的视图深度保持一致
domain: frontend
technology: vue
module: router
related:
  - vue.router.learn.basics.router-link-view-active
  - vue.router.learn.basics.route-params-query-matching
tags:
  - Vue Router
  - nested routes
  - children
  - RouterView
  - view depth
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-03
sources:
  - title: Vue Router：Nested Routes
    url: https://router.vuejs.org/guide/essentials/nested-routes.html
  - title: Vue Router API：RouteRecordRaw
    url: https://router.vuejs.org/api/type-aliases/routerecordraw
  - title: Vue Router API：RouterView
    url: https://router.vuejs.org/api/variables/routerview
  - title: Vue Router 5.2.0 matcher/index.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/matcher/index.ts
  - title: Vue Router 5.2.0 RouterView.ts
    url: https://github.com/vuejs/router/blob/v5.2.0/packages/router/src/RouterView.ts
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - vue.router.learn.basics.router-link-view-active
  - vue.router.learn.basics.route-params-query-matching
objectives:
  - 让父子 route record 与页面布局层级对应
  - 用相对 child path 追加 URL segment
  - 在父 layout 内放置第二层 RouterView
  - 用空路径 child 表达父地址的默认内容
  - 从 route.matched 识别每层 outlet 渲染的记录
recap:
  - children 把 route records 组织成父子关系，相对 path 把 child segment 接到父 path。
  - 每层 RouterView 按 view depth 从 route.matched 选择一条记录的组件。
  - 父 layout 必须包含下一层 RouterView，child 内容才会出现。
  - 空路径 child 不增加 URL segment，用于父地址的默认二级内容。
  - 嵌套路由表达纵向布局深度，不能与同深度并列的命名视图混为一谈。
---

# 嵌套路由

## 一、一条嵌套 URL 对应一条 matched 链

嵌套路由同时组织地址与界面。父记录 /teams/\:teamId 渲染团队 layout，children 中的 members/\:memberId 追加两个 URL segment，并交给 layout 内的第二层 RouterView。访问 /teams/core/members/42 时，父记录与详情 child 都位于 route.matched 中。

~~~~ts
const routes = [
  {
    path: '/teams/:teamId',
    name: 'team-layout',
    component: TeamLayout,
    children: [
      { path: '', name: 'team-home', component: TeamHome },
      {
        path: 'members/:memberId',
        name: 'team-member',
        component: TeamMember,
      },
    ],
  },
]
~~~~

| 访问位置 | matched names | 可见 outlet |
| --- | --- | --- |
| /teams/core | team-layout → team-home | 外层：TeamLayout；内层：TeamHome |
| /teams/core/members/42 | team-layout → team-member | 外层：TeamLayout；内层：TeamMember |

## 二、children 的 path 默认相对父记录

child path 不以斜杠开头时，matcher 会把它接到父 path 后面。这样 records 的树形关系、URL segment 和组件布局表达同一层级。以 / 开头的 child path 是绝对地址；它仍可保留 parent 关系，但不会追加父 path，因此不适合这里的详情 segment。

:::compare
### 错误写法

~~~~text
{ path: '/members/:memberId', component: TeamMember }
~~~~

### 正确写法

~~~~text
{ path: 'members/:memberId', component: TeamMember }
~~~~
:::

## 三、每层 RouterView 只消费当前深度的记录

应用根组件中的 RouterView 从 matched[0] 取得 TeamLayout。TeamLayout 自己还要渲染 RouterView，后者才会读取 matched[1] 的默认页或成员详情。父 layout 不会因为 child 切换而消失，变化的是第二层 outlet。

~~~~vue
<template>
  <main class="team-layout">
    <h2>团队工作区</h2>
    <RouterView />
  </main>
</template>
~~~~

## 四、空路径 child 提供父地址的默认内容

父地址 /teams/core 已经匹配 TeamLayout，但仍需要一个 child 决定第二层 outlet 的内容。path: 空字符串的 child 不增加 URL segment，因此父地址会同时匹配 layout 与默认 child。它不是 redirect，也不会改变地址。

:::tip
默认 child 与详情 child 必须使用不同 name。name 在整个 router 中标识位置，不是只在同一 children 数组内局部唯一。
:::

## 五、在隔离 Demo 中观察两个 outlet

下面的运行区创建独立 memory router。默认 child 与成员详情共享团队父 layout；可见区同时显示父 outlet、子 outlet、pathname、matched names、params/query、导航结果和事件时间线。所有按钮只驱动 mini-app，宿主课程 URL 保持不变。

:::demo{id="vue.router.learn.basics.nested-routes.nested-routes-lab-demo" playground="true"}
切换空路径默认 child 与成员详情 child，观察 matched 链和两层 outlet
:::

## 六、易错使用提示

:::pitfalls
### 父组件没有放置 RouterView

**触发条件：** 父组件没有放置 RouterView

**原因：** children 只建立记录关系，child component 仍需要父 component 内的下一层 RouterView 才有渲染位置。

**后果：** URL 和 matched 已经进入 child，但页面只显示父 layout，详情内容完全不可见。

**错误示例：**

~~~~vue
<template><main><h2>团队</h2></main></template>
~~~~

**正确写法：**

~~~~vue
<template><main><h2>团队</h2><RouterView /></main></template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 给相对 child path 加前导斜杠

**触发条件：** 给相对 child path 加前导斜杠

**原因：** 以 / 开头的 child path 是绝对地址，不会把 members segment 接到 /teams/\:teamId 后面。

**后果：** 预期的 /teams/core/members/42 无法命中，详情反而出现在顶层 /members/42。

**错误示例：**

~~~~ts
{ path: '/members/:memberId', component: TeamMember }
~~~~

**正确写法：**

~~~~ts
{ path: 'members/:memberId', component: TeamMember }
~~~~

**验证方式：** 对照正确写法验证结果。

### 把嵌套路由与命名视图当成同一概念

**触发条件：** 把嵌套路由与命名视图当成同一概念

**原因：** 嵌套路由用 children 和多层 RouterView 表达纵向 layout 深度；命名视图是在同一深度并列选择多个 outlet。

**后果：** 配置 components 却只放普通 RouterView，或为一个父子布局制造不必要的并列 outlet。

**错误示例：**

~~~~ts
{ path: 'members/:id', components: { default: Team, detail: Member } }
~~~~

**正确写法：**

~~~~ts
{ path: '/teams/:id', component: Team, children: memberRoutes }
~~~~

**验证方式：** 对照正确写法验证结果。

### 父子记录使用同一个 name

**触发条件：** 父子记录使用同一个 name

**原因：** route name 在整个 router 中用于唯一定位记录，children 不会为名称创建局部作用域。

**后果：** Vue Router 5.2.0 会抛出同名祖先记录错误并拒绝建立路由器，应用无法进入正常导航。

**错误示例：**

~~~~ts
{ name: 'team', children: [{ path: '', name: 'team' }] }
~~~~

**正确写法：**

~~~~ts
{ name: 'team-layout', children: [{ path: '', name: 'team-home' }] }
~~~~

**验证方式：** 对照正确写法验证结果。

### 把默认 child 写成斜杠路径

**触发条件：** 把默认 child 写成斜杠路径

**原因：** 默认 child 需要不增加任何 segment，只有空字符串 path 才直接复用父记录的完整地址。

**后果：** 斜杠会被解释为绝对根地址，访问父地址时第二层 outlet 仍然为空。

**错误示例：**

~~~~ts
{ path: '/', name: 'team-home', component: TeamHome }
~~~~

**正确写法：**

~~~~ts
{ path: '', name: 'team-home', component: TeamHome }
~~~~

**验证方式：** 对照正确写法验证结果。

### 让 URL 层级与 outlet 层级各自增长

**触发条件：** 让 URL 层级与 outlet 层级各自增长

**原因：** 新增 children 会增加 matched 深度；对应 component 必须在上一层布局提供出口，不能只增加路径 segment。

**后果：** 配置看似有三层 URL，组件树只有两层 outlet，最深记录匹配却没有可见内容。

**错误示例：**

~~~~ts
{ path: 'members/:id/activity', component: Activity } // 父页无内层出口
~~~~

**正确写法：**

~~~~ts
{ path: 'members/:id', component: MemberLayout, children: activityRoutes }
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 七、从源码推导适用场景

:::steps
### 1. matcher 归一化 children 与 parent

matcher 递归处理每条 child record，把 parent matcher 传给下一层，并将相对 child path 与父 path 拼接。归一化后的记录仍保留 parent 关系，因此 resolve 后的 matched 会按父到子的顺序组成链。需要 layout 与详情共享父级参数时，用 children 表达这条归属关系。

### 2. RouterView 注入并递增 view depth

RouterView 读取当前注入的 depth，从 route.matched 中选择对应记录，再向后代提供下一可渲染深度。外层 outlet 消费父记录，父 layout 内的 outlet 消费 child；需要多级持久布局时，每个中间 layout 都必须继续提供 RouterView。
:::

:::exercise
### 为团队工作区补充设置页

**要求：** 在默认页和成员详情之外新增 settings child。写出相对 path、唯一 name 与最终 URL，并说明 /teams/core 和 /teams/core/settings 各自的 matched 链及两层 outlet 内容。

**验收：** 完成题目要求。

**参考答案：** { path: 'settings', name: 'team-settings', component: TeamSettings }
// /teams/core
// team-layout → team-home；外层 TeamLayout，内层 TeamHome
// /teams/core/settings
// team-layout → team-settings；外层 TeamLayout，内层 TeamSettings
:::

- [ ] URL segment 与 children 层级表达同一结构
- [ ] 相对 child path 不带前导斜杠
- [ ] 每个中间 layout 都提供下一层 RouterView
- [ ] 空路径 child 承担父地址的默认内容
- [ ] 每条父子记录使用全局唯一 name
