---
id: vue.core.reference.composition.use-id
type: reference
title: useId()
summary: 为表单和无障碍属性生成应用内唯一、服务端与客户端稳定的组件 ID
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.application.create-app
  - vue.core.reference.composition.lifecycle
  - vue.core.reference.components.props
tags:
  - useId
  - idPrefix
  - SSR
  - hydration
  - 无障碍
  - 表单
appliesTo: Vue 3.5.40（useId 为 3.5+）
verifiedAt: 2026-08-02
sources:
  - title: Vue 组合式 API：useId
    url: https://cn.vuejs.org/api/composition-api-helpers.html#useid
  - title: Vue 应用 API：app.config.idPrefix
    url: https://cn.vuejs.org/api/application.html#app-config-idprefix
  - title: Vue 3.5.40 useId.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useId.ts
  - title: Vue 3.5.40 useId 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/useId.spec.ts
group: composition
signature: "function useId(): string"
anchors:
  - 概述
  - 无障碍关联与唯一性
  - 多应用前缀
  - SSR 稳定性
  - 易错使用提示
  - 源码推导与适用场景
---

# useId()

## 概述

`useId()` 在当前组件实例中生成字符串 ID。每次调用以及同一组件的不同实例都会得到不同值；相同组件树在服务端渲染和客户端激活时会得到稳定结果。它从 Vue 3.5 起提供，主要用于连接 `label`、输入控件和 `aria-*` 属性。

| 规则 | 结果 | 设计含义 |
| --- | --- | --- |
| 同一组件多次调用 | 每次获得不同 ID | 一个组件可以关联多组可访问元素 |
| 同一组件多个实例 | 实例之间不会复用 ID | 列表和重复表单不会产生重复 id |
| 服务端与客户端 | 组件树一致时结果稳定 | 适合 SSR 与 hydration |
| 多个 Vue 应用 | 默认计数各自独立 | 需要 idPrefix 避免跨应用冲突 |

## 无障碍关联与唯一性

原生 `id` 必须在整份文档内唯一。可复用表单组件不能把相同字符串写死在模板中；应在 setup 顶层调用一次 `useId()`，再把结果同时交给控件的 `id` 和标签的 `for`，或交给 `aria-describedby`、`aria-labelledby`。

~~~~vue
<script setup lang="ts">
import { useId } from 'vue'

const inputId = useId()
</script>

<template>
  <label :for="inputId">邮箱</label>
  <input :id="inputId" type="email" />
</template>
~~~~

:::demo{id="vue.core.reference.composition.use-id.use-id-demo" playground="true"}
渲染两个相同字段组件，验证各自 ID 唯一且点击标签只聚焦对应输入框
:::

## 多应用前缀

每个 `createApp()` 都有独立计数器；同一 HTML 页面挂载多个 Vue 应用时，默认生成值可能重复。应在各应用挂载前设置不同的 `app.config.idPrefix`。该配置只影响当前应用随后通过 `useId()` 生成的值。

~~~~ts
const adminApp = createApp(AdminRoot)
adminApp.config.idPrefix = 'admin'
adminApp.mount('#admin-root')

const storeApp = createApp(StoreRoot)
storeApp.config.idPrefix = 'store'
storeApp.mount('#store-root')
~~~~

## SSR 稳定性

Vue 3.5.40 会为同步组件和异步边界维护分层 ID 计数，使异步组件以不同顺序完成时仍能产生一致 ID。稳定性的前提是服务端与客户端执行相同的组件结构和 `useId()` 调用拓扑；它不能修复由条件渲染或平台分支造成的树结构差异。

:::tip
浏览器 Demo 只能证明客户端的唯一性和标签关联。SSR 稳定性依据 Vue 3.5.40 官方服务端/客户端对照测试，不把单端演示冒充 hydration 验证。
:::

## 易错使用提示

:::pitfalls
### 在可复用组件中写死 id

**触发条件：** 在可复用组件中写死 id

**原因：** 同一组件出现多次时，模板里的固定字符串会原样复制，浏览器不会替组件自动创建唯一命名空间。

**后果：** 页面产生重复 id；点击多个标签可能始终聚焦第一个控件，辅助技术也会读取错误描述。

**错误示例：**

~~~~vue
<label for="email">邮箱</label>
<input id="email" />
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
const emailId = useId()
</script>

<label :for="emailId">邮箱</label>
<input :id="emailId" />
~~~~

**验证方式：** 对照正确写法验证结果。

### 在组件 setup 之外调用 useId()

**触发条件：** 在组件 setup 之外调用 useId()

**原因：** `useId()` 通过当前组件实例读取应用前缀和实例计数；普通模块顶层或事件处理器执行时没有可关联的活动实例。

**后果：** 开发环境出现无活动组件实例的警告，函数返回空字符串，多个元素会再次发生 ID 冲突。

**错误示例：**

~~~~ts
// ids.ts 模块顶层
export const sharedId = useId()
~~~~

**正确写法：**

~~~~ts
/** 在当前组件 setup 调用栈内创建 ID。 */
function useFieldId(): string {
  return useId()
}

// <script setup> 顶层
const fieldId = useFieldId()
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 computed 或条件分支中按需生成 ID

**触发条件：** 在 computed 或条件分支中按需生成 ID

**原因：** 官方明确要求不要在 `computed()` 内调用。ID 应描述组件结构，而不是随响应式求值次数或分支状态增加。

**后果：** 重复求值会消耗新的序号；服务端和客户端求值路径不同时还可能造成 hydration 属性不一致。

**错误示例：**

~~~~ts
const inputId = computed(() => (enabled.value ? useId() : 'disabled'))
~~~~

**正确写法：**

~~~~ts
const generatedId = useId()
const inputId = computed(() => (enabled.value ? generatedId : 'disabled'))
~~~~

**验证方式：** 对照正确写法验证结果。

### 同页多个 Vue 应用继续使用默认前缀

**触发条件：** 同页多个 Vue 应用继续使用默认前缀

**原因：** ID 计数属于各自应用上下文。两个应用都可能从默认的 `v-0` 开始，应用内唯一不等于整页唯一。

**后果：** 跨应用出现重复 DOM id，标签、锚点或 aria 关系可能指向另一棵应用树。

**错误示例：**

~~~~ts
createApp(AdminRoot).mount('#admin')
createApp(StoreRoot).mount('#store')
~~~~

**正确写法：**

~~~~ts
const adminApp = createApp(AdminRoot)
adminApp.config.idPrefix = 'admin'
adminApp.mount('#admin')

const storeApp = createApp(StoreRoot)
storeApp.config.idPrefix = 'store'
storeApp.mount('#store')
~~~~

**验证方式：** 对照正确写法验证结果。

### 把生成值保存为业务实体的永久 ID

**触发条件：** 把生成值保存为业务实体的永久 ID

**原因：** 源码按应用前缀、组件位置和调用序号组装结果；它的契约是渲染树内稳定关联，不是跨会话的数据库主键。

**后果：** 组件结构或渲染位置变化后值可能改变，收藏、接口数据和持久化记录无法可靠找到原实体。

**错误示例：**

~~~~ts
const orderId = useId()
await saveOrder({ id: orderId })
~~~~

**正确写法：**

~~~~ts
const orderId = crypto.randomUUID()
const labelId = useId()

await saveOrder({ id: orderId })
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

Vue 3.5.40 从当前实例取得 `appContext.config.idPrefix` 和 `ids` 计数，并在每次调用后递增。异步组件、async setup 和 serverPrefetch 会建立独立的异步边界编号。因此 `useId()` 适合可复用表单、提示文本、弹窗标题和 aria 关系；需要跨页面、跨会话或后端共享身份时应使用业务 ID。

~~~~ts
// 精简自 vuejs/core v3.5.40 packages/runtime-core/src/helpers/useId.ts
/** 从当前组件实例生成应用内唯一 ID。 */
function useId(): string {
  const instance = getCurrentInstance()
  if (!instance) return ''

  const prefix = instance.appContext.config.idPrefix || 'v'
  return prefix + '-' + instance.ids[0] + instance.ids[1]++
}
~~~~
