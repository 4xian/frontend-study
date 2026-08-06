---
id: vue.core.reference.built-ins.teleport
type: reference
title: <Teleport>
summary: 把插槽内容的 DOM 渲染到指定目标，同时保持原有组件树、状态和依赖注入关系
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.built-ins.transition
  - vue.core.reference.built-ins.suspense
  - vue.core.reference.composition.provide-inject
tags:
  - Teleport
  - to
  - disabled
  - defer
  - 模态框
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-29
sources:
  - title: Vue Teleport 指南
    url: https://cn.vuejs.org/guide/built-ins/teleport.html
  - title: Vue 内置组件 API：Teleport
    url: https://cn.vuejs.org/api/built-in-components.html#teleport
  - title: Vue Teleport 指南原始 Markdown
    url: https://github.com/vuejs/docs/blob/main/src/guide/built-ins/teleport.md
  - title: Vue 3.5.40 Teleport.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts
group: built-ins
signature: |-
  interface TeleportProps {
    to: string | RendererElement | null | undefined
    disabled?: boolean
    defer?: boolean
  }
anchors:
  - 概述
  - Props 与延迟目标
  - 逻辑树与 DOM 位置
  - 多个 Teleport
  - 易错使用提示
  - 最小源码实现
---

# &lt;Teleport&gt;

## 概述

`<Teleport>` 让内容在逻辑上继续属于当前组件，在 DOM 中却挂到 `to` 指定的目标。模态框、通知和浮层因此可以绕开祖先的 `overflow: hidden`、transform 或局部层叠上下文，而 props、事件、provide/inject 和 Vue Devtools 中的父子关系保持不变。

~~~~vue
<button @click="open = true">打开模态框</button>

<Teleport to="body">
  <div v-if="open" class="modal">
    <p>DOM 位于 body，状态仍由当前组件管理</p>
    <button @click="open = false">关闭</button>
  </div>
</Teleport>
~~~~

:::demo{id="vue.core.reference.built-ins.teleport.teleport-demo" playground="true"}
对比原地弹层与 Teleport 到 body 后是否受到祖先 overflow 裁剪
:::

## Props 与延迟目标

`to` 接受 CSS 选择器或实际 DOM 元素；默认挂载时目标必须已经存在。`disabled` 为 true 时内容留在声明位置，并可在运行时切换。Vue 3.5 新增 `defer`，把目标解析延迟到同一次挂载或更新周期的其他部分完成后，因此目标可以写在同一模板更靠后的位置，但它不会跨后续异步 tick 持续等待。

~~~~vue
<Teleport defer to="#late-target">
  <ModalDialog />
</Teleport>

<!-- 同一次挂载中创建，defer 可以找到 -->
<div id="late-target"></div>
~~~~

## 逻辑树与 DOM 位置

Teleport 只移动渲染结果，不会把子组件重新挂到目标 DOM 所属组件之下。子组件仍从声明 Teleport 的逻辑祖先注入依赖，事件也仍向逻辑父组件报告。`scoped` 样式依靠编译期生成的属性选择器，传送后仍可匹配；但依赖普通 DOM 祖先选择器的全局样式需要按实际目标结构重新检查。

## 多个 Teleport

多个 Teleport 可以使用同一目标，Vue 会按挂载顺序把各自内容追加进去，不会自动替换、排序或管理焦点。需要弹层栈、互斥规则、z-index 和焦点恢复时，应在业务层统一维护有序列表，再由一个 Teleport 渲染。

## 易错使用提示

:::pitfalls
### 在目标节点存在之前挂载 Teleport

**触发条件：** 在目标节点存在之前挂载 Teleport

**原因：** 默认情况下，Vue 在 Teleport 挂载时立即解析 `to`。它不会持续观察 DOM 并等待目标稍后出现。

**后果：** 开发环境报告无法定位或无效 target，内容不能挂到预期容器。

**错误示例：**

~~~~vue
<Teleport to="#modals"><ModalDialog /></Teleport>
<ModalHost v-if="hostReady" />
~~~~

**正确写法：**

~~~~html
<div id="app"></div>
<div id="modals"></div>

<!-- Vue 应用挂载前目标已经存在 -->
~~~~

**验证方式：** 对照正确写法验证结果。

### 以为 defer 会无限等待异步创建的目标

**触发条件：** 以为 defer 会无限等待异步创建的目标

**原因：** `defer` 只把目标解析推迟到同一个 mount 或 update tick 的其他部分完成，并不是持续重试机制。

**后果：** 目标在请求、定时器或后续 tick 才出现时仍会报错，也不会自动补挂载。

**错误示例：**

~~~~vue
<Teleport defer to="#late-target"><ModalDialog /></Teleport>
<div v-if="requestFinished" id="late-target"></div>
~~~~

**正确写法：**

~~~~vue
<Teleport defer to="#late-target"><ModalDialog /></Teleport>
<div id="late-target"></div>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 DOM 目标位置当成新的组件父子关系

**触发条件：** 把 DOM 目标位置当成新的组件父子关系

**原因：** Teleport 只改变 DOM 位置，props、事件、provide/inject 和 Devtools 层级仍沿原组件树工作。

**后果：** 从目标 DOM 所属组件注入依赖会失败，额外手动转发还可能制造重复状态通道。

**错误示例：**

~~~~vue
<!-- 错误期待从 #theme-host 对应组件获得 provide -->
<Teleport to="#theme-host"><DialogContent /></Teleport>
~~~~

**正确写法：**

~~~~vue
<!-- 依赖由 Teleport 的逻辑父组件提供 -->
<Teleport to="#theme-host">
  <DialogContent @close="open = false" />
</Teleport>
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 disabled="false" 表示不禁用

**触发条件：** 用 disabled="false" 表示不禁用

**原因：** 没有 `v-bind` 的 attribute 值是字符串，非空字符串 `"false"` 仍会让 Teleport 进入 disabled 状态。

**后果：** 内容留在原 DOM 位置，没有移动到 `to` 指定目标。

**错误示例：**

~~~~vue
<Teleport to="#modals" disabled="false"><ModalDialog /></Teleport>
~~~~

**正确写法：**

~~~~vue
<Teleport to="#modals" :disabled="false"><ModalDialog /></Teleport>
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待多个同目标 Teleport 自动替换或决定层级

**触发条件：** 期待多个同目标 Teleport 自动替换或决定层级

**原因：** 多个 Teleport 的内容只会按挂载顺序追加，Vue 不会根据业务优先级排序或移除旧内容。

**后果：** 多个弹层同时存在，DOM、焦点和读屏顺序可能与业务优先级不一致。

**错误示例：**

~~~~vue
<Teleport to="#modals"><ConfirmDialog /></Teleport>
<Teleport to="#modals"><AlertDialog /></Teleport>
~~~~

**正确写法：**

~~~~vue
<Teleport to="#modals">
  <component :is="dialog.component" v-for="dialog in orderedDialogs" :key="dialog.id" />
</Teleport>
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 最小源码实现

Teleport 是渲染器识别的特殊 vnode 类型。首次处理时，它在声明位置和目标容器分别放置锚点，解析 `to`，再根据 disabled 决定把 children 挂到原容器还是目标；目标或 disabled 改变时，渲染器移动已有 DOM，组件实例和 vnode 树不需要重建。

~~~~ts
// 精简自 vuejs/core v3.5.40 Teleport.ts
const TeleportImpl = {
  __isTeleport: true,

  // 首次挂载时创建锚点，并选择 children 的实际容器
  process(n1: VNode | null, n2: VNode, container: RendererElement, anchor: RendererNode | null) {
    if (n1 !== null) return

    const placeholder = (n2.el = createText(''))
    const mainAnchor = (n2.anchor = createText(''))
    insert(placeholder, container, anchor)
    insert(mainAnchor, container, anchor)

    const target = (n2.target = resolveTarget(n2.props?.to, querySelector))
    const disabled = isTeleportDisabled(n2.props)
    mountChildren(n2.children, disabled ? container : target, disabled ? mainAnchor : null)
  },
}
~~~~
