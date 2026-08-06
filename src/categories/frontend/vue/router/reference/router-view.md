---
id: vue.router.reference.components.router-view
type: reference
title: RouterView
summary: 查阅 RouterView 的 props、可渲染组件类型、嵌套 depth、命名视图、route 覆盖与默认插槽边界
domain: frontend
technology: vue
module: router
related:
  - vue.router.reference.matching.route-records
  - vue.router.reference.matching.route-locations
  - vue.router.learn.basics.nested-routes
  - vue.router.learn.intermediate.named-views-route-props
  - vue.router.learn.advanced.router-view-slots-transitions
tags:
  - Vue Router
  - RouterView
  - RouterViewProps
  - RouteComponent
  - nested routes
  - named views
  - Transition
  - KeepAlive
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router API：RouterViewProps
    url: https://router.vuejs.org/api/interfaces/routerviewprops
  - title: Vue Router API：RouteComponent
    url: https://router.vuejs.org/api/type-aliases/routecomponent
  - title: Vue Router API：RouterView
    url: https://router.vuejs.org/api/variables/routerview
  - title: Vue Router Guide：Nested Routes
    url: https://router.vuejs.org/guide/essentials/nested-routes.html
  - title: Vue Router Guide：Named Views
    url: https://router.vuejs.org/guide/essentials/named-views.html
  - title: Vue Router Guide：Passing Props to Route Components
    url: https://router.vuejs.org/guide/essentials/passing-props.html
  - title: Vue Router Guide：RouterView slot
    url: https://router.vuejs.org/guide/advanced/router-view-slot.html
  - title: "Vue Router discussion #1968：Transition 与条件 KeepAlive"
    url: https://github.com/vuejs/router/discussions/1968
  - title: "Vue Router discussion #2508：KeepAlive 定制边界"
    url: https://github.com/vuejs/router/discussions/2508
  - title: "Vue Router issue #2673：route prop 与 useRoute() 的当前边界"
    url: https://github.com/vuejs/router/issues/2673
  - title: Vue Router 5.2.0：RouterView 固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/RouterView.ts
  - title: Vue Router 5.2.0：RouteComponent 固定类型
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/types/index.ts
  - title: Vue Router 5.2.0：RouterView injection keys 固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/injectionSymbols.ts
group: components
signature: |-
  interface RouterViewProps {
    name?: string
    route?: RouteLocationNormalized
  }

  type RouteComponent = Component | DefineComponent

  declare const RouterView: {
    new (): {
      $props: AllowedComponentProps &
        ComponentCustomProps &
        VNodeProps &
        RouterViewProps
      $slots: {
        default?: ({ Component, route }: {
          Component: VNode
          route: RouteLocationNormalizedLoaded
        }) => VNode[]
      }
    }
  }
anchors:
  - 概述
  - 渲染管线与选型
  - Router View Props
  - Route Component
  - Router View
  - Nested Depth
  - Name 与命名视图
  - Route Prop
  - Default Slot
  - Transition 与 KeepAlive
  - 易错使用提示
  - 源码推导与适用场景
---

# RouterView

## 概述

`RouterView` 是当前 route location 的视图出口。它读取当前位置的 `matched` 记录链、当前嵌套 depth 与 `name`，选出这一层 record 的对应组件，再把 route-record props 和 RouterView attrs 合并到该组件。没有默认插槽时直接渲染组件；有默认插槽时把已创建的 VNode 与实际显示的 route 交给插槽。

:::tip
`RouterViewProps` 控制“显示哪条 location、哪个 named view”；`RouteComponent` 描述已加载 route component 的定义；`RouterView` 才是运行时出口。默认插槽里的 `Component` 名称容易误导：5.2.0 本地声明与源码都表明它是已带 props、attrs 和 ref 的 `VNode`，不是 `RouteComponent` 类型的原始组件定义。
:::

## 渲染管线与选型

| 阶段 | 关键值 | 负责的边界 |
| --- | --- | --- |
| route record 声明 | component / components | 允许普通组件或 lazy loader；named view key 在这里定义 |
| 导航加载完成 | RouteComponent | lazy loader 已解析，matched record 可交给 RouterView 渲染 |
| 选择视图 | depth + name + route | 确定 matched[depth].components[name]，无 component 的 parent 会被跳过 |
| 创建页面 VNode | record props + attrs | 计算 route props，并把 RouterView 未声明 attrs 继续传给页面组件 |
| 默认插槽 | { Component, route } | 包装实际页面 VNode；Transition、KeepAlive、页面级 props/slots 在此组合 |

## Router View Props

~~~~ts
interface RouterViewProps {
  name?: string
  route?: RouteLocationNormalized
}
~~~~

| prop | 省略时 | 用途与边界 |
| --- | --- | --- |
| name | 'default' | 从当前 matched record 的 components 中选择同名 view；它不是 route record 的 name |
| route | 上级 RouterView 提供的 location，最外层来自当前路由 | 覆盖此出口及其嵌套出口显示的 location；不是 RouteLocationRaw 导航目标 |

`RouterView` 设置了 `inheritAttrs: false`，但不是丢弃 attrs。固定源码在创建页面 VNode 时依次合并 route-record props、RouterView attrs 和内部 ref/unmount hook，因此 `&lt;RouterView aria-label="main" /&gt;` 的未声明属性会落到当前 route component，且同名 attrs 会覆盖 record props。跨页面统一透传通常会扩大所有页面的 prop/attribute 契约，应优先在 route record 的 `props` 中按页面声明。

## Route Component

~~~~ts
type RouteComponent = Component | DefineComponent

// raw route record 允许尚未加载的工厂：
type RawRouteComponent = RouteComponent | Lazy<RouteComponent>
~~~~

`RouteComponent` 是 `RouteLocationMatched.components` 中允许的已加载 Vue 组件定义。它不包含 lazy factory；raw route record 使用更宽的 `RawRouteComponent`，导航加载阶段再把工厂解析为 `RouteComponent`。这个类型适合描述“已经可渲染的 record component”，不描述 RouterView 实例，也不描述默认插槽传出的 VNode。

:::tip
应用声明 routes 时通常让 `RouteRecordRaw` 自动推断 `component`/`components`，不需要显式标注 `RouteComponent`。只有库要接收已经加载的 route component，或读取 `RouteLocationNormalizedLoaded.matched` 时，这个别名才是合适边界。
:::

## Router View

~~~~ts
declare const RouterView: {
  new (): {
    $props: AllowedComponentProps &
      ComponentCustomProps &
      VNodeProps &
      RouterViewProps
    $slots: {
      default?: ({ Component, route }: {
        Component: VNode
        route: RouteLocationNormalizedLoaded
      }) => VNode[]
    }
  }
}
~~~~

~~~~vue
<template>
  <main>
    <RouterView />
  </main>
</template>
~~~~

无插槽时，RouterView 直接返回当前 record、depth 与 name 选出的页面 VNode。若该位置没有 matched record，或 record 没有对应 name 的 component，则无插槽时渲染为空；有插槽时仍调用插槽，并传入 `Component: undefined` 与当前显示 route。需要 fallback 时应在插槽内检查 Component。

## Nested Depth

depth 不是公开 prop，而是 RouterView 之间的注入链。最外层从 0 开始；当前 RouterView 选中 record 后，为后代提供 `depth + 1`。若 matched 链中的某条 parent record 没有 `components`，实现会继续向后寻找下一条有组件的 record，所以“只分组路径、不提供布局组件”的 parent 不会消耗一个可见出口。

~~~~ts
const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    // 没有 component：最外层 RouterView 会跳过这一层。
    children: [
      {
        path: 'users',
        component: UsersLayout,
        children: [{ path: ':id', component: UserDetail }],
      },
    ],
  },
]
~~~~

`UserDetail` 要在 `UsersLayout` 自己的模板中放置下一层 `&lt;RouterView /&gt;` 才能显示。depth 沿组件后代的 provide/inject 传播，不按 URL 段数计算；同一模板中的多个 sibling RouterView 处于相同 depth，通过不同 `name` 选择同一 record 上的 named components。

## Name 与命名视图

`name` 选择当前 matched record 的 view key。未命名 RouterView 等价于 `name="default"`；命名出口必须与 route record 的 `components` key 对齐。route record 自身的 `name` 服务于按名导航，两者只是字段同名，语义与命名空间完全不同。

~~~~vue
<template>
  <RouterView />
  <RouterView name="sidebar" />
</template>
~~~~

~~~~ts
const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    components: {
      default: DashboardMain,
      sidebar: DashboardSidebar,
    },
  },
]
~~~~

## Route Prop

`route` 允许出口显示一个显式的 normalized location，而不是当前 URL 对应的位置。RouterView 会把该 location 继续提供给嵌套 RouterView，使整条嵌套出口链从同一 matched 数组与 params 取值。传入由 `router.resolve()` 得到且仍含 lazy component 的结果前，可用 `loadRouteLocation()` 加载为 `RouteLocationNormalizedLoaded`。

~~~~ts
import { loadRouteLocation } from 'vue-router'

const resolved = router.resolve({ name: 'report-preview', params: { id: '42' } })
const previewRoute = await loadRouteLocation(resolved)
~~~~

~~~~vue
<template>
  <RouterView :route="previewRoute" />
</template>
~~~~

:::warning
5.2.0 的 `route` 覆盖只通过 `routerViewLocationKey` 传给 RouterView 链；普通 `useRoute()` 仍读取全局 `routeLocationKey`。官方 issue #2673 正在讨论单独的 local-route 入口。当前代码若依赖显式 route，应使用默认插槽传出的 `route`，或把它作为普通 prop 继续传给页面组件，不能假定子组件的 `useRoute()` 已同步覆盖。
:::

## Default Slot

默认插槽提供 `{ Component, route }`。`Component` 是 RouterView 已经创建好的页面 VNode，包含 record props、RouterView attrs、实例 ref 与卸载清理 hook；`route` 是这个出口实际显示的 `RouteLocationNormalizedLoaded`，在使用 `route` prop 时可能与全局 currentRoute 不同。

~~~~vue
<template>
  <RouterView v-slot="{ Component, route }">
    <component :is="Component" v-if="Component" :route-context="route" />
    <NotFoundPanel v-else />
  </RouterView>
</template>
~~~~

:::warning
在插槽里的 `&lt;component&gt;` 增加 prop 或 slot，会应用于这个 RouterView 可能渲染的每个页面。官方 Passing Props Guide 明确提示这通常不是好主意：所有页面都必须接受同一 prop。能在 route record 中用 boolean、静态对象或无状态函数声明的页面数据，应优先放进 `props` 配置。
:::

## Transition 与 KeepAlive

Transition 与 KeepAlive 应包装 route component，而不是 RouterView 自身，因此它们必须放在默认插槽内。两者并用时，官方 Guide 的组合顺序是外层 Transition、内层 KeepAlive、最内层动态页面 VNode。固定源码还会在检测到 Transition/KeepAlive 直接包 RouterView 时发出迁移诊断。

~~~~vue
<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <KeepAlive :include="['ReportPage']">
        <component :is="Component" v-if="Component" />
      </KeepAlive>
    </Transition>
  </RouterView>
</template>
~~~~

| 边界 | 实际匹配或生命周期 | 设计结论 |
| --- | --- | --- |
| KeepAlive include/exclude | 匹配 route component 的组件 name | 不要填写 route record name；页面组件需要稳定 name |
| Transition child | 需要可动画的单根 route component | 多根 fragment 不会因为外加无关 wrapper 自动获得正确页面语义 |
| 嵌套缓存 | 内层 KeepAlive 随承载它的 parent component 生命周期存在 | 外层 parent 被卸载时，内层 cache 也会销毁；按出口层级规划缓存 |
| VNode key | key 改变会创建不同组件身份和缓存项 | 只在确实要按 params/path 重建时选稳定 key，不机械使用 fullPath |

官方 discussion #1968 的维护者答复同时确认：KeepAlive 的 include/exclude 看组件名而不是 route 名，Transition 下的页面组件需要单根。discussion #2508 进一步把精细缓存身份留给插槽外层 wrapper 与 Vue 自身的组件/props 机制，而不是增加 Router 专属 KeepAlive 集成。

## 易错使用提示

:::pitfalls
### 用 Transition 或 KeepAlive 直接包住 RouterView

**触发条件：** 用 Transition 或 KeepAlive 直接包住 RouterView

**原因：** 官方 RouterView slot Guide 与固定源码都要求包装实际 route component；RouterView 只是稳定出口，不是应被切换或缓存的页面实例。

**后果：** 过渡或缓存作用在 RouterView 外壳上，页面切换得不到预期生命周期，开发环境还会发出迁移诊断。

**错误示例：**

~~~~vue
<Transition>
  <RouterView />
</Transition>
~~~~

**正确写法：**

~~~~vue
<RouterView v-slot="{ Component }">
  <Transition>
    <component :is="Component" v-if="Component" />
  </Transition>
</RouterView>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 route record name 当作 RouterView name

**触发条件：** 把 route record name 当作 RouterView name

**原因：** RouterView name 选择 `record.components[name]`，route record name 则用于 `router.push({ name })` 等按名导航。

**后果：** 出口查找不存在的 component key，URL 已匹配却渲染为空，看起来像嵌套路由失效。

**错误示例：**

~~~~vue
<RouterView name="dashboard-route" />
~~~~

**正确写法：**

~~~~vue
<RouterView />
<RouterView name="sidebar" />
~~~~

**验证方式：** 对照正确写法验证结果。

### 声明 children 却没有在 parent component 中放嵌套出口

**触发条件：** 声明 children 却没有在 parent component 中放嵌套出口

**原因：** matched chain 可以包含 child record，但每个有组件的 parent 需要在自己的渲染树中提供下一层 RouterView 才能消费后续 depth。

**后果：** 导航与 route.params 都已更新，页面仍只显示 parent，child component 没有挂载位置。

**错误示例：**

~~~~vue
<template>
  <UserNavigation />
  <UserSummary />
</template>
~~~~

**正确写法：**

~~~~vue
<template>
  <UserNavigation />
  <RouterView />
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 给 route prop 传 raw 导航目标

**触发条件：** 给 route prop 传 raw 导航目标

**原因：** `RouterViewProps.route` 接受 normalized route；字符串或 `{ name, params }` 是交给 Router 解析的 `RouteLocationRaw`，不是可直接渲染的 matched 结果。

**后果：** 值没有 `matched` 链，既不满足类型，也无法让 RouterView 按 depth 选择已加载组件。

**错误示例：**

~~~~vue
<RouterView :route="{ name: 'preview', params: { id } }" />
~~~~

**正确写法：**

~~~~ts
const resolved = router.resolve({ name: 'preview', params: { id } })
const previewRoute = await loadRouteLocation(resolved)
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待 route prop 同时改写后代 useRoute()

**触发条件：** 期待 route prop 同时改写后代 useRoute()

**原因：** 5.2.0 的 RouterView 只为嵌套出口提供 override location；`useRoute()` 仍注入全局 current route，官方 issue #2673 正在记录这一差异。

**后果：** 预览出口显示 route A，页面 setup 中的 `useRoute()` 却读取当前 URL 的 route B，数据请求与画面不一致。

**错误示例：**

~~~~ts
const route = useRoute()
const report = await fetchReport(route.params.id)
~~~~

**正确写法：**

~~~~vue
<RouterView :route="previewRoute" v-slot="{ Component, route }">
  <component :is="Component" v-if="Component" :route-context="route" />
</RouterView>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把插槽 Component 当成原始 RouteComponent 定义

**触发条件：** 把插槽 Component 当成原始 RouteComponent 定义

**原因：** 5.2.0 声明把插槽值标为 VNode，源码也先调用 `h(ViewComponent, props)`，再把结果作为 `Component` 传给插槽。

**后果：** 代码尝试读取组件 options、再次手工计算 route props，或绕过 VNode 上已有的 ref 与卸载清理。

**错误示例：**

~~~~ts
const componentName = Component.name
const vnode = h(Component, route.params)
~~~~

**正确写法：**

~~~~vue
<component :is="Component" v-if="Component" />
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 RouterView 插槽给所有页面透传专用 prop

**触发条件：** 在 RouterView 插槽给所有页面透传专用 prop

**原因：** 官方 Passing Props Guide 警告：插槽中添加的 prop 会落到这个出口渲染的全部 view components，而它们未必声明相同 prop。

**后果：** 页面组件出现 extraneous attribute 警告，或公共出口与某一页面的私有契约耦合。

**错误示例：**

~~~~vue
<RouterView v-slot="{ Component }">
  <component :is="Component" report-mode="compact" />
</RouterView>
~~~~

**正确写法：**

~~~~ts
const routes: RouteRecordRaw[] = [
  {
    path: '/reports',
    component: ReportsPage,
    props: { reportMode: 'compact' },
  },
]
~~~~

**验证方式：** 对照正确写法验证结果。

### 给 KeepAlive include 填 route name

**触发条件：** 给 KeepAlive include 填 route name

**原因：** 官方 discussion #1968 的维护者答复明确说明 include/exclude 按组件 name 过滤，不按 route record name。

**后果：** 目标页面没有进入缓存，或恰好同名时形成偶然生效、重命名即失效的配置。

**错误示例：**

~~~~vue
<KeepAlive :include="[route.name]">
~~~~

**正确写法：**

~~~~vue
<KeepAlive :include="['ReportPage']">
~~~~

**验证方式：** 对照正确写法验证结果。

### 只在 onMounted() 中读取会变化的 route params

**触发条件：** 只在 onMounted() 中读取会变化的 route params

**原因：** 同一个 route component 在参数变化时通常复用实例；RouterView 更新 props 与 matched 关系，不保证重新触发挂载生命周期。

**后果：** 从 `/users/1` 到 `/users/2` 后 URL 已更新，页面仍显示第一次挂载时加载的用户。

**错误示例：**

~~~~ts
onMounted(() => {
  void loadUser(route.params.id)
})
~~~~

**正确写法：**

~~~~ts
watch(
  () => route.params.id,
  (id) => void loadUser(id),
  { immediate: true },
)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 1. 从 route location 确定显示链

固定 `RouterView.ts` 优先使用 `props.route`，否则读取上级 `routerViewLocationKey`。最外层由 Router 提供 current route；显式 route 适合并排预览、测试或受控 outlet，但必须是已经解析的 normalized location。

### 2. Depth 是组件树上下文，不是 URL 层数

实现从 `viewDepthKey` 读取初始值，跳过没有 components 的 matched records，再为后代提供当前 depth + 1。无组件 parent 可以组织路径而不占可见出口；有布局组件的 parent 必须在自身树中渲染下一层 RouterView。

### 3. Name 在同一 record 上选择并行视图

实现以 `matchedRoute.components[currentName]` 取组件，name 默认 `default`。同 depth 的 sibling outlets 通过不同 key 显示同一 record 的多个 components；route record name 不参与这一步。

### 4. RouteComponent 位于加载后的 record 边界

固定 `types/index.ts` 把 raw component 定义为普通 RouteComponent 或 lazy factory，而 `RouteLocationMatched.components` 只保留 RouteComponent。需要交给 RouterView 的离线 location 先用 `loadRouteLocation()` 解析 lazy factories。

### 5. 页面 VNode 已包含三类输入

实现先按当前 view name 计算 record props：true 使用 route.params，函数接收 route，对象原样使用；随后合并 RouterView attrs，并追加实例 ref 与卸载清理。插槽拿到的是这个最终 VNode，不应重新实现 props 选择。

### 6. RouterView 协调实例与组件内守卫

post-flush watch 把页面实例写入 matched record 的 `instances[name]`，在复用实例跨 record 时迁移 leave/update guards，并结算 `beforeRouteEnter` callbacks。手工渲染 matched component 会绕过这套协调。

### 7. Route override 只沿 RouterView 专用 key 传播

实现提供的是 `routerViewLocationKey`，而 `useRoute()` 读取 `routeLocationKey`。因此嵌套 RouterView 会遵循显式 route，普通后代不会自动获得 local route；5.2.0 应以 slot route 或显式组件 prop 建立一致的数据来源。

### 8. Transition 与缓存属于页面 VNode 的外层组合

默认插槽在 RouterView 完成选择和实例协调后开放页面 VNode。Transition/KeepAlive 放在插槽内，才能处理真正变化的页面；缓存筛选、单根动画限制与 key 身份仍属于 Vue 组件机制，Router 不额外定义专属语义。
:::
