---
id: vue.router.reference.components.router-link
type: reference
title: RouterLink 与 useLink()
summary: 掌握 RouterLink 的渲染与导航契约、custom slot、active/exact-active 判定，以及 useLink() 的响应式输入和低层返回值
domain: frontend
technology: vue
module: router
related:
  - vue.router.reference.configuration.create-router
  - vue.router.reference.matching.route-locations
  - vue.router.reference.composables.navigation
  - vue.router.learn.basics.router-link-view-active
  - vue.router.learn.advanced.dynamic-routing-router-link
tags:
  - Vue Router
  - RouterLink
  - RouterLinkProps
  - useLink
  - custom slot
  - active links
  - aria-current
  - view transition
appliesTo: Vue Router 5.2.0
verifiedAt: 2026-08-04
sources:
  - title: Vue Router API：_RouterLinkI
    url: https://router.vuejs.org/api/interfaces/routerlinki
  - title: Vue Router API：RouterLinkProps
    url: https://router.vuejs.org/api/interfaces/routerlinkprops
  - title: Vue Router API：UseLinkOptions
    url: https://router.vuejs.org/api/interfaces/uselinkoptions
  - title: Vue Router API：UseLinkReturn
    url: https://router.vuejs.org/api/interfaces/uselinkreturn
  - title: Vue Router API：RouterLink
    url: https://router.vuejs.org/api/variables/routerlink
  - title: Vue Router API：useLink()
    url: https://router.vuejs.org/api/functions/uselink
  - title: Vue Router Guide：Active links
    url: https://router.vuejs.org/guide/essentials/active-links
  - title: Vue Router Guide：Extending RouterLink
    url: https://router.vuejs.org/guide/advanced/extending-router-link
  - title: Vue Router Guide：Composition API 中的 useLink()
    url: https://router.vuejs.org/guide/advanced/composition-api.html#uselink
  - title: "Vue Router issue #1429：扩展链接时的 props 与响应式边界"
    url: https://github.com/vuejs/router/issues/1429
  - title: "Vue Router issue #2375：custom slot 单根节点与指令透传"
    url: https://github.com/vuejs/router/issues/2375
  - title: Vue Router 5.2.0：RouterLink 与 useLink 固定源码
    url: https://github.com/vuejs/router/blob/6e5f8d253b9444a76eb58f176ebe08d686c937cb/packages/router/src/RouterLink.ts
group: components
signature: |-
  interface RouterLinkOptions {
    to: RouteLocationRaw
    replace?: boolean
  }

  interface RouterLinkProps extends RouterLinkOptions {
    custom?: boolean
    activeClass?: string
    exactActiveClass?: string
    ariaCurrentValue?:
      | 'page'
      | 'step'
      | 'location'
      | 'date'
      | 'time'
      | 'true'
      | 'false'
    viewTransition?: boolean
  }

  interface UseLinkOptions<Name extends keyof RouteMap = keyof RouteMap> {
    to: MaybeRef<
      | RouteLocationAsString
      | RouteLocationAsRelativeTyped<RouteMap, Name>
      | RouteLocationAsPath
      | RouteLocationRaw
    >
    replace?: MaybeRef<boolean | undefined>
    viewTransition?: boolean
  }

  /** @internal */
  interface UseLinkReturn<Name extends keyof RouteMap = keyof RouteMap> {
    route: ComputedRef<RouteLocationResolved<Name>>
    href: ComputedRef<string>
    isActive: ComputedRef<boolean>
    isExactActive: ComputedRef<boolean>
    navigate(e?: MouseEvent): Promise<void | NavigationFailure>
  }

  function useLink<Name extends keyof RouteMap = keyof RouteMap>(
    props: UseLinkOptions<Name>,
  ): UseLinkReturn<Name>

  declare const RouterLink: _RouterLinkI

  /** @internal */
  type _RouterLinkPropsTypedBase =
    & AllowedComponentProps
    & ComponentCustomProps
    & VNodeProps
    & RouterLinkProps

  /** @internal */
  type RouterLinkPropsTyped<Custom extends boolean | undefined> =
    Custom extends true
      ? _RouterLinkPropsTypedBase & { custom: true }
      : _RouterLinkPropsTypedBase &
          { custom?: false | undefined } &
          Omit<AnchorHTMLAttributes, 'href'>

  /** @internal */
  interface _RouterLinkI {
    new <Custom extends boolean | undefined = boolean | undefined>(): {
      $props: RouterLinkPropsTyped<Custom>
      $slots: {
        default?: (
          value: UnwrapRef<UseLinkReturn>,
        ) => VNode[]
      }
    }
    useLink: typeof useLink
  }
anchors:
  - 概述
  - Internal Router Link I
  - Router Link Props
  - Use Link Options
  - Use Link Return
  - Router Link
  - Use Link
  - Custom Slot 与链接语义
  - Active 与 Exact Active
  - 易错使用提示
  - 源码推导与适用场景
---

# RouterLink 与 useLink()

## 一、概述

`RouterLink` 是应用层首选的站内导航组件：它先把 `to` 交给 Router 解析为标准 `href`，再用受控点击调用 `router.push()` 或 `router.replace()`。默认渲染保留原生 `&lt;a&gt;` 的地址、修饰键和新标签页语义；需要控制实际标记时，使用 `custom` slot；只有在封装自己的链接组件时，才直接使用 `useLink()`。

:::tip
本页以本地安装的 `vue-router@5.2.0` 声明和固定 commit `6e5f8d253b9444a76eb58f176ebe08d686c937cb` 为最终事实。官网页面可能继续随主线版本更新。
:::

## 二、Internal Router Link I

`_RouterLinkI` 是 `RouterLink` 常量的 internal 构造接口，用来让模板、TSX/JSX 和类型化路由推断 `custom` 分支的 props、默认 slot 参数及组件上的 `useLink` 属性。它描述库自身的组件类型拼装，不是应用层稳定扩展点。

| 内部成员 | 固定源码用途 | 应用层公开替代 |
| --- | --- | --- |
| new &lt;Custom&gt;() / $props | 按 custom 是否为 true 区分自定义根节点与默认 anchor 属性 | 模板直接使用 RouterLink；共享 props 使用 RouterLinkProps |
| $slots.default | 约束 route、href、isActive、isExactActive、navigate 五个 slot 值 | 在 RouterLink 的 v-slot 中直接解构所需值 |
| RouterLink.useLink | 库内无需再次导入时访问同一函数；源码标记 internal | 从 vue-router 根入口具名导入 useLink |

:::warning
不要在业务组件、公共组件库 API 或持久类型声明中直接引用 `_RouterLinkI`。需要组件值类型时使用 `typeof RouterLink`，需要 props 时使用公开的 `RouterLinkProps`。
:::

## 三、Router Link Props

`RouterLinkProps` 扩展内部 `RouterLinkOptions`。`to` 是唯一必填项；其余属性分别控制 history 写入方式、渲染所有权、激活 class、无障碍当前项和值与浏览器 View Transition。组件 props 是普通值形状，响应式模板绑定由 Vue 负责；`MaybeRef` 是 `UseLinkOptions` 的额外能力。

| prop | 类型与默认值 | 运行时效果 |
| --- | --- | --- |
| to | RouteLocationRaw，必填 | 由 router.resolve() 生成 resolved route 与 href |
| replace | boolean，默认 false | true 调用 router.replace()；否则调用 router.push() |
| custom | boolean，默认 false | true 不创建外层 anchor，直接返回默认 slot 的内容 |
| activeClass | string，可选 | 覆盖本链接 active class；未提供时回退全局配置，再回退 router-link-active |
| exactActiveClass | string，可选 | 覆盖本链接 exact-active class；未提供时回退全局配置，再回退默认名称 |
| ariaCurrentValue | 七个 ARIA token，默认 'page' | 默认 anchor 仅在 exact active 时写入 aria-current；否则移除该属性 |
| viewTransition | boolean，默认 false | 浏览器支持时把 push/replace 返回的 Promise 交给 document.startViewTransition() |

~~~~vue
<RouterLink
  :to="{ name: 'user', params: { username: user.name } }"
  replace
  active-class="is-user-active"
  exact-active-class="is-current-user"
  aria-current-value="page"
>
  {{ user.displayName }}
</RouterLink>
~~~~

## 四、Use Link Options

`UseLinkOptions&lt;Name&gt;` 是 `useLink()` 的 public 输入接口。`to` 与 `replace` 都是 `MaybeRef`：可传普通值，也可传 `ref`、`computed` 或 Vue 响应式 props 上的属性；固定实现每次求值都用 `unref()` 读取它们。`viewTransition` 在 5.2.0 中仍是普通可选 boolean，不是 `MaybeRef&lt;boolean&gt;`。

| 输入 | 是否可为 ref | 何时重新读取 |
| --- | --- | --- |
| to | 是 | resolved route、href 与 active 状态的 computed 重新求值时 |
| replace | 是 | 每次 navigate() 真正发起导航时 |
| viewTransition | 否，5.2.0 声明为 boolean | 每次有效 navigate() 后决定是否启动转换 |

~~~~ts
import { computed, toRef } from 'vue'
import { useLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to: RouteLocationRaw
  replace?: boolean
}>()

const link = useLink({
  to: toRef(props, 'to'),
  replace: toRef(props, 'replace'),
})

/** 根据响应式链接状态生成组件 class。 */
const stateClass = computed(() => ({
  'is-active': link.isActive.value,
  'is-exact-active': link.isExactActive.value,
}))
~~~~

## 五、Use Link Return

`UseLinkReturn&lt;Name&gt;` 精确描述 `useLink()` 的五个返回成员，但该接口在 5.2.0 声明中带 `@internal`。应用可以使用这些运行时返回值，却不应把接口名称固化到自己的公开 contract；优先让 TypeScript 从 `useLink()` 推断，确需别名时使用 `ReturnType&lt;typeof useLink&gt;`。

| 返回成员 | 类型 | 含义 |
| --- | --- | --- |
| route | ComputedRef&lt;RouteLocationResolved&lt;Name&gt;&gt; | to 经 router.resolve() 得到的目标地址 |
| href | ComputedRef&lt;string&gt; | 来自 route.value.href，可直接绑定到 anchor |
| isActive | ComputedRef&lt;boolean&gt; | 目标 record 在当前 matched 中，且目标 params 被当前 params 包含 |
| isExactActive | ComputedRef&lt;boolean&gt; | 目标 record 是当前最后一个 matched record，且 params 完全相同 |
| navigate | (e?: MouseEvent) =&gt; Promise&lt;void \| NavigationFailure&gt; | 按点击守卫选择跳过或执行 push/replace，并返回可等待的 Promise |

~~~~ts
import { useLink } from 'vue-router'

const link = useLink(props)

// 让返回类型跟随当前安装版本推断，不直接依赖 internal UseLinkReturn。
type AppLinkState = ReturnType<typeof useLink>

const href = link.href
const isCurrent = link.isExactActive
~~~~

## 六、Router Link

`RouterLink` 是类型为 `_RouterLinkI` 的 public 组件常量。默认分支创建 `&lt;a&gt;`，写入 resolved `href`、active class、exact-active class、受控 click handler，并仅在 exact active 时写入 `aria-current`。Vue 的 attrs 合并仍允许 `target`、`rel` 等 anchor 属性落到默认根节点。

点击处理保留浏览器原生意图：Meta、Alt、Ctrl、Shift 修饰键，已被 `preventDefault()` 的事件，非主键点击，以及 `target="_blank"` 都不会被 Router 接管。其余点击先阻止整页加载，再依据 `replace` 选择 Router 方法。因此默认 RouterLink 比只写 `@click="router.push(...)"` 更完整。

~~~~vue
<RouterLink
  :to="{ name: 'report', params: { reportId } }"
  target="_blank"
  rel="noopener"
>
  在新标签页打开报告
</RouterLink>
~~~~

## 七、Use Link

`useLink(props)` 是 public 组合式函数，它抽出 RouterLink 的解析、href、激活判定和导航行为，但不渲染 DOM。它通过应用注入取得 Router 与当前 route，所以必须在已安装 Router 的组件 `setup()` 上下文中调用。常规页面链接继续用 RouterLink；需要封装设计系统链接、把 active 状态放在外层结构或整合自定义组件时才使用 useLink。

~~~~vue
<script setup lang="ts">
import { useLink } from 'vue-router'
import type { UseLinkOptions } from 'vue-router'

const props = defineProps<UseLinkOptions>()
const { href, isActive, isExactActive, navigate } = useLink(props)
</script>

<template>
  <a
    :href="href"
    :class="{ 'is-active': isActive }"
    :aria-current="isExactActive ? 'page' : undefined"
    @click="navigate"
  >
    <slot />
  </a>
</template>
~~~~

:::warning
`navigate()` 只是导航行为，不会替你补齐自定义根节点的 href、键盘可达性、链接角色、active class 或 aria-current。用 custom slot/useLink 时，这些 DOM 责任由封装组件承担。
:::

## 八、Custom Slot 与链接语义

`&lt;RouterLink custom v-slot&gt;` 与 `useLink()` 暴露相同的五个值，不过 slot 中的 computed refs 已被 Vue 解包为普通读取值。`custom` 只取消 RouterLink 自动创建的 anchor，不代表内容自动变成链接；最稳妥的站内导航仍是单个 `&lt;a&gt;` 根节点，同时绑定 `href` 和 `navigate`。

~~~~vue
<RouterLink
  :to="{ name: 'settings' }"
  custom
  v-slot="{ href, navigate, isActive, isExactActive }"
>
  <a
    :href="href"
    :class="{ 'nav-link-active': isActive }"
    :aria-current="isExactActive ? 'page' : undefined"
    @click="navigate"
  >
    设置
  </a>
</RouterLink>
~~~~

官方 issue #2375 记录了 custom 模式返回 slot 数组时，组件级指令无法可靠落到实际元素的问题。5.2.0 源码会把“恰好一个 VNode”的 slot 结果解包，但多个根节点仍没有唯一的 attrs/指令承载者。把行为直接写在单个交互根节点上，边界最明确。

## 九、Active 与 Exact Active

active 判定以 matcher record 和 params 为核心，而不是比较完整 URL。目标最后一个 matched record（alias 会追溯到原 record）只要出现在当前 matched 链中，且目标 params 被当前 params 包含，就会 active；因此嵌套路由中的祖先链接也可 active。exact active 还要求该 record 正好是当前 matched 链最后一项，并要求 params 完全相等。

| 变化 | isActive | isExactActive | 原因 |
| --- | --- | --- | --- |
| 同 record、同 params，只改 query/hash | true | true | 两种判定都忽略 query 与 hash |
| 当前地址进入目标 record 的 child | true | false | 祖先 record 仍匹配，但不是最后一项 |
| 同 record，目标 params 被当前 params 包含 | true | 视完整 params 而定 | active 使用包含比较 |
| alias 与原路径指向同一 record | true | 视 matched 位置而定 | 比较会追溯 aliasOf |
| 目标是 redirect record | 不跟随 redirect 判定 | 不跟随 | active 检查不会执行 redirect |

:::tip
如果产品需要把 query、hash 或其他业务状态纳入“当前链接”判断，应使用 custom slot/useLink 取得 resolved `route`，再显式计算业务状态；不要把默认 exact-active 理解为完整 URL 严格相等。
:::

## 十、易错使用提示

:::pitfalls
### 把外部 URL 直接交给 RouterLink

**触发条件：** 把外部 URL 直接交给 RouterLink

**原因：** `to` 是 Router 的 route location。RouterLink 会把字符串交给当前 Router 解析，并不承担外部站点导航或安全属性策略。

**后果：** 外部地址可能被当作应用路径解析，生成错误 href；同时容易漏掉 target、rel 等外链语义。

**错误示例：**

~~~~vue
<RouterLink to="https://docs.example.com">外部文档</RouterLink>
~~~~

**正确写法：**

~~~~vue
<a href="https://docs.example.com" target="_blank" rel="noopener">
  外部文档
</a>
~~~~

**验证方式：** 对照正确写法验证结果。

### custom 模式只渲染 div，不提供原生链接语义

**触发条件：** custom 模式只渲染 div，不提供原生链接语义

**原因：** `custom` 会取消自动 anchor。只把 navigate 绑定到 div，不能自动获得 href、键盘行为、新标签页或链接角色。

**后果：** 键盘与辅助技术用户难以操作，Ctrl/Cmd 点击和复制链接地址也不可用。

**错误示例：**

~~~~vue
<RouterLink to="/reports" custom v-slot="{ navigate }">
  <div @click="navigate">报告</div>
</RouterLink>
~~~~

**正确写法：**

~~~~vue
<RouterLink to="/reports" custom v-slot="{ href, navigate }">
  <a :href="href" @click="navigate">报告</a>
</RouterLink>
~~~~

**验证方式：** 对照正确写法验证结果。

### 在调用 useLink() 前把 props 拍平成普通值

**触发条件：** 在调用 useLink() 前把 props 拍平成普通值

**原因：** useLink() 会 unref `props.to` 和 `props.replace`，但普通对象中已经读取出的当前值不会随原 props 更新。官方 issue #1429 也记录了扩展示例中的 props/响应式易错边界。

**后果：** 父组件更新 to 后，封装链接仍解析旧地址，href 与 active 状态一起过期。

**错误示例：**

~~~~ts
const link = useLink({
  to: props.to,
  replace: props.replace,
})
~~~~

**正确写法：**

~~~~ts
const link = useLink({
  to: toRef(props, 'to'),
  replace: toRef(props, 'replace'),
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 exact-active 区分 query 或 hash

**触发条件：** 用 exact-active 区分 query 或 hash

**原因：** 5.2.0 的 active 与 exact-active 都按 route record 和 params 判断，明确忽略 query 与 hash。

**后果：** 分页或 tab 只改变 query/hash 时，多个链接可能同时显示 exact-active。

**错误示例：**

~~~~vue
<RouterLink to="/reports?page=1" exact-active-class="selected">
  第 1 页
</RouterLink>
~~~~

**正确写法：**

~~~~vue
<RouterLink to="/reports?page=1" custom v-slot="{ href, route, navigate }">
  <a
    :href="href"
    :class="{ selected: route.query.page === $route.query.page }"
    @click="navigate"
  >
    第 1 页
  </a>
</RouterLink>
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 custom RouterLink 上放指令，却返回多个根节点

**触发条件：** 在 custom RouterLink 上放指令，却返回多个根节点

**原因：** custom slot 有多个根时不存在唯一元素接收组件级 attrs 或指令。官方 issue #2375 的修复只让单 VNode 结果可被解包。

**后果：** 指令可能不执行，并出现“无法应用到非元素根节点”的运行时警告。

**错误示例：**

~~~~vue
<RouterLink v-tooltip="'打开'" to="/reports" custom>
  <span>图标</span>
  <span>报告</span>
</RouterLink>
~~~~

**正确写法：**

~~~~vue
<RouterLink to="/reports" custom v-slot="{ href, navigate }">
  <a v-tooltip="'打开'" :href="href" @click="navigate">
    <span>图标</span>
    <span>报告</span>
  </a>
</RouterLink>
~~~~

**验证方式：** 对照正确写法验证结果。

### 自定义链接忘记维护 aria-current

**触发条件：** 自定义链接忘记维护 aria-current

**原因：** 默认 RouterLink 只在 exact active 时自动写 aria-current。custom slot 不创建 anchor，因此也不会替实际根节点写属性。

**后果：** 视觉 class 正常，但辅助技术无法得知哪个链接代表当前页面或当前步骤。

**错误示例：**

~~~~vue
<a :href="href" :class="{ active: isExactActive }" @click="navigate">
  账户
</a>
~~~~

**正确写法：**

~~~~vue
<a
  :href="href"
  :class="{ active: isExactActive }"
  :aria-current="isExactActive ? 'page' : undefined"
  @click="navigate"
>
  账户
</a>
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 click + router.push() 代替语义化链接

**触发条件：** 用 click + router.push() 代替语义化链接

**原因：** 手写 click 只覆盖单一鼠标路径；RouterLink 的 href 与 guardEvent 还保留修饰键、非主键、defaultPrevented 和 target="_blank" 行为。

**后果：** 链接不能复制、不能正常新开标签页，键盘与浏览器上下文菜单行为也被破坏。

**错误示例：**

~~~~vue
<button @click="$router.push('/settings')">设置</button>
~~~~

**正确写法：**

~~~~vue
<RouterLink to="/settings">设置</RouterLink>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 internal 类型写进应用公共 API

**触发条件：** 把 internal 类型写进应用公共 API

**原因：** `_RouterLinkI` 与 `UseLinkReturn` 在 5.2.0 固定声明中带 internal 标签，即使当前可从根入口导出，也不承诺作为应用扩展 contract 稳定。

**后果：** 升级后容易被库内部类型重构阻断，且把组件推断细节泄漏到业务边界。

**错误示例：**

~~~~ts
import type { _RouterLinkI, UseLinkReturn } from 'vue-router'

export interface NavigationItem {
  component: _RouterLinkI
  state: UseLinkReturn
}
~~~~

**正确写法：**

~~~~ts
import { RouterLink, useLink } from 'vue-router'
import type { RouterLinkProps } from 'vue-router'

export interface NavigationItem {
  component: typeof RouterLink
  props: RouterLinkProps
}

type LinkState = ReturnType<typeof useLink>
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十一、源码推导与适用场景

:::steps
### 1. 响应式解析目标地址

固定源码把 `unref(props.to)` 放进 `computed()`，再调用 `router.resolve(to)`；`href` 又从 resolved route 派生。因此 to 的 ref/computed/响应式 prop 变化会同时刷新 route、href 与后续 active 判定，而普通快照不会。

### 2. 用 record 与 params 推导 active

实现先在 currentRoute.matched 中寻找目标最后一个 record，并通过 aliasOf 归一 alias；isActive 使用 params 包含比较，isExactActive 还要求命中 current matched 最后一项且 params 完全相同。由此可确定祖先 active、exact 边界及 query/hash 不参与。

### 3. 在点击边界选择 history 方法

`navigate()` 先运行 guardEvent；只有未带修饰键、未被阻止、主键且非 `_blank` 的点击才阻止浏览器默认跳转。随后实时 unref replace 与 to，调用 router.replace() 或 router.push()。适合保留浏览器链接语义的站内导航。

### 4. 把渲染责任分成默认与 custom

RouterLink setup 把 useLink() 结果包进 reactive 后传给 slot。默认分支创建 anchor，并按“单项 prop、RouterOptions 全局值、内置名称”顺序选 class；custom 分支只返回 slot 内容。需要普通链接时选默认分支，需要设计系统封装时才接管 custom 的 DOM 责任。

### 5. 把 aria-current 绑定到 exact 状态

默认 anchor 只在 isExactActive 为 true 时写 `aria-current=ariaCurrentValue`，否则写 null 以移除属性。菜单当前页通常用默认 `page`；步骤流可显式选 `step`。custom 链接应复刻相同条件，而不是把所有祖先 active 链接都标为当前页。

### 6. 按封装层级选择公开入口

业务模板优先 RouterLink；只改标记结构时用 RouterLink custom slot；需要组合多个低层状态时用具名导出的 useLink()。`_RouterLinkI` 和 `UseLinkReturn` 只用于理解库内类型，不作为应用依赖；分别以 RouterLink/RouterLinkProps 与推断返回类型替代。
:::

~~~~ts
// 精简自 vuejs/router 5.2.0 packages/router/src/RouterLink.ts
/** 从响应式选项推导链接目标、状态与导航行为。 */
export function useLink(props: UseLinkOptions): UseLinkReturn {
  const router = inject(routerKey)!
  const currentRoute = inject(routeLocationKey)!
  const route = computed(() => router.resolve(unref(props.to)))
  const activeRecordIndex = computed(() => {
    // 省略 alias 与空 path child 的 record 回退细节。
    return currentRoute.matched.findIndex((record) =>
      isSameRouteRecord(record, route.value.matched.at(-1)),
    )
  })
  const isActive = computed(
    () =>
      activeRecordIndex.value > -1 &&
      includesParams(currentRoute.params, route.value.params),
  )
  const isExactActive = computed(
    () =>
      activeRecordIndex.value > -1 &&
      activeRecordIndex.value === currentRoute.matched.length - 1 &&
      isSameRouteLocationParams(currentRoute.params, route.value.params),
  )

  /** 保留原生点击意图后调用 push 或 replace。 */
  function navigate(
    event: MouseEvent = {} as MouseEvent,
  ): Promise<void | NavigationFailure> {
    if (!guardEvent(event)) return Promise.resolve()
    const navigation = router[
      unref(props.replace) ? 'replace' : 'push'
    ](unref(props.to)).catch(noop)

    if (
      props.viewTransition &&
      typeof document !== 'undefined' &&
      'startViewTransition' in document
    ) {
      document.startViewTransition(() => navigation)
    }

    return navigation
  }

  return {
    route,
    href: computed(() => route.value.href),
    isActive,
    isExactActive,
    navigate,
  }
}
~~~~
