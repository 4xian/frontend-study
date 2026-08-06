---
id: vue.core.reference.options-api.misc-options
type: reference
title: Options API：其他杂项选项
summary: 查询组件名称、attribute 透传控制以及组件与指令局部注册的作用域、解析规则和运行时边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.components.attrs
  - vue.core.reference.built-ins.keep-alive
  - vue.core.reference.advanced.custom-directives
  - vue.core.reference.options-api.rendering-options
tags:
  - Options API
  - name
  - inheritAttrs
  - components
  - directives
  - KeepAlive
  - $attrs
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-03
sources:
  - title: Vue Options API：其他杂项选项
    url: https://cn.vuejs.org/api/options-misc.html
  - title: Vue 透传 Attributes 指南
    url: https://cn.vuejs.org/guide/components/attrs.html
  - title: Vue 组件注册指南
    url: https://cn.vuejs.org/guide/components/registration.html
  - title: Vue 自定义指令指南
    url: https://cn.vuejs.org/guide/reusability/custom-directives.html
  - title: Vue KeepAlive：缓存匹配
    url: https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude
  - title: Vue 3.5.40 Options 应用与资源表
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentOptions.ts
  - title: Vue 3.5.40 组件名称读取
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/component.ts
  - title: Vue 3.5.40 attribute 透传实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentRenderUtils.ts
  - title: Vue 3.5.40 组件与指令解析
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/helpers/resolveAssets.ts
  - title: Vue 3.5.40 Options 官方测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/componentOptions.spec.ts
  - title: Vue 3.5.40 attribute 透传官方测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts
  - title: Vue 3.5.40 资源解析官方测试
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/__tests__/helpers/resolveAssets.spec.ts
group: options-api
signature: |-
  interface ComponentOptions {
    name?: string
    inheritAttrs?: boolean
    components?: Record<string, Component>
    directives?: Record<string, Directive>
  }
anchors:
  - 概述
  - name
  - inheritattrs
  - components
  - directives
  - 易错使用提示
  - 源码推导与适用场景
---

# Options API：其他杂项选项

## 概述

这四个选项补充组件身份、attribute 落点和模板资源解析规则：`name` 为组件建立运行时名称契约，`inheritAttrs` 控制未被 props 或 emits 消费的 attributes 是否自动透传，`components` 与 `directives` 则只在当前组件的渲染上下文注册局部资源。它们不会改变组件状态，也不等同于应用级注册。

| 选项 | 主要职责 | 关键边界 |
| --- | --- | --- |
| `name` | 声明稳定的组件运行时名称 | 注册别名与组件名不是同一契约 |
| `inheritAttrs` | 控制 attributes 的自动透传 | 关闭后 `$attrs` 仍保留 |
| `components` | 注册当前组件可解析的局部组件 | 不会自动传给后代 |
| `directives` | 注册当前组件可解析的局部指令 | 注册名不含 `v-` |

## name

`name` 用于组件自身递归引用、Devtools、警告栈以及 `<KeepAlive>` 的 `include` / `exclude` 匹配。SFC 可以从文件名推导名称，Vue 3.2.34+ 的 `<script setup>` 组件也会生成推导名；显式 `name` 会覆盖推导结果。导入变量名或 `components` 的注册 key 只决定当前模板如何找到组件，不会自动改写组件自身名称。需要跨文件重命名保持缓存筛选稳定时，应显式声明 `name`。

~~~~vue
<!-- CourseDetails.vue -->
<script lang="ts">
export default {
  name: 'CourseDetails',
}
</script>

<template>
  <article>课程详情</article>
</template>
~~~~

~~~~vue
<template>
  <KeepAlive include="CourseDetails">
    <component :is="activeView" />
  </KeepAlive>
</template>
~~~~

:::tip
文件名推导适合普通显示名称；递归自引用或 KeepAlive 筛选一旦成为稳定行为，应把显式 `name` 与筛选值一起维护。
:::

## inheritAttrs

`inheritAttrs` 默认为 `true`。父级传入但未被当前组件 props 或 emits 消费的 `class`、`style`、`id`、ARIA attributes 和监听器，会自动合并到可透传的单一根元素或组件。这个默认行为只负责选择根节点，并不知道包装组件中哪个后代才是真正的语义目标。

设置 `inheritAttrs: false` 只关闭自动落点，不会删除 `$attrs`。包装组件应在真正承载交互或语义的元素上使用 `v-bind="$attrs"`。多根、文本根或其他没有唯一可透传根的组件无法自动选择目标；多根组件没有消费 `$attrs` 时，开发环境会给出警告。

~~~~vue
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <span class="button-prefix">保存：</span>
  <button type="button" v-bind="$attrs">提交</button>
</template>
~~~~

:::warning
`inheritAttrs: false` 不是“禁止父级传入 attribute”。`$attrs` 仍包含未消费数据，组件作者必须明确是否以及在哪里转发；多根组件尤其不能依赖自动选择。
:::

## components

`components` 是注册名到组件定义的映射，只供当前组件的模板或 render 上下文解析。运行时先检查当前实例的局部表，再检查应用级全局表；局部同名注册会遮蔽全局资源。解析会依次尝试原始名称、camelCase 和 PascalCase，但推荐用 PascalCase 注册和书写组件，以便与原生 HTML 元素区分。

~~~~vue
<script lang="ts">
import CourseSummary from './CourseSummary.vue'

export default {
  components: {
    CourseSummary,
  },
}
</script>

<template>
  <CourseSummary />
</template>
~~~~

局部注册不会沿组件树向下继承；如果 `CourseSummary` 的模板还要使用另一个组件，它必须自己导入并注册。`<script setup>` 中的导入组件由编译器直接暴露给模板，不需要再写 `components`，但这不会扩大其作用域。

## directives

`directives` 是注册名到指令定义的映射，作用域同样只限当前组件。Options 注册 key 使用不带 `v-` 的名称，例如 `focus` 对应模板中的 `v-focus`。解析局部表失败后才会查应用级全局指令，并兼容原始名称、camelCase 和 PascalCase。自定义指令适合必须直接操作底层 DOM 的能力；能用组件、属性或声明式模板表达的逻辑应优先使用这些机制。

~~~~vue
<script lang="ts">
const focus = {
  /** 在输入元素挂载后设置焦点。 */
  mounted(element: HTMLInputElement) {
    element.focus()
  },
}

export default {
  directives: {
    focus,
  },
}
</script>

<template>
  <input v-focus />
</template>
~~~~

指令应用在组件标签上时最终依赖组件根节点；多根组件没有唯一根元素，Vue 会给出警告且指令行为可能被忽略。需要精确控制 DOM 时，把指令放在明确的原生元素上。

## 易错使用提示

:::pitfalls
### 把导入别名、注册名和组件 name 当成同一标识

**触发条件：** 把导入别名、注册名和组件 name 当成同一标识

**原因：** 导入变量与 components 的 key 负责当前模板解析；显式 name 或 SFC 推导名才是组件自身身份。

**后果：** 重命名导入或注册 key 后，Devtools 名称、递归引用或 KeepAlive include 仍按另一个名称工作，缓存筛选失效。

**错误示例：**

~~~~ts
import DetailsView from './CourseDetails.vue'

export default {
  components: { DetailsView },
  // 错误地假定 KeepAlive 会按 DetailsView 匹配组件自身名称
}
~~~~

**正确写法：**

~~~~ts
// CourseDetails.vue
export default {
  name: 'CourseDetails',
}

// KeepAlive 的 include 同样使用 CourseDetails
~~~~

**验证方式：** 对照正确写法验证结果。

### 让默认 attribute 透传落到包装层

**触发条件：** 让默认 attribute 透传落到包装层

**原因：** 单根组件默认把未消费 attributes 合并到根节点；Vue 不知道内部 button 才是交互目标。

**后果：** `disabled`、ARIA 信息或点击监听器落在包装元素，真实控件仍可操作或无法被辅助技术正确识别。

**错误示例：**

~~~~vue
<template>
  <div class="button-shell">
    <button type="button">提交</button>
  </div>
</template>
~~~~

**正确写法：**

~~~~vue
<script lang="ts">
export default { inheritAttrs: false }
</script>

<template>
  <div class="button-shell">
    <button type="button" v-bind="$attrs">提交</button>
  </div>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 让多根组件自动选择 attribute 落点

**触发条件：** 让多根组件自动选择 attribute 落点

**原因：** fragment 没有唯一根节点，运行时无法判断 id、class、ARIA 或监听器应该落在哪一个根上。

**后果：** attributes 没有按预期应用，开发环境出现 extraneous non-props attributes 或 listeners 警告。

**错误示例：**

~~~~vue
<template>
  <span>标签</span>
  <button type="button">提交</button>
</template>
~~~~

**正确写法：**

~~~~vue
<script lang="ts">
export default { inheritAttrs: false }
</script>

<template>
  <span>标签</span>
  <button type="button" v-bind="$attrs">提交</button>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为 components 局部注册会传给后代

**触发条件：** 认为 components 局部注册会传给后代

**原因：** 局部资源表挂在当前组件实例上，不会成为后代实例的局部表，也不等同于 app.component()。

**后果：** 后代模板直接使用该名称时出现 Failed to resolve component，目标组件不会渲染。

**错误示例：**

~~~~ts
// 只在 Layout 中注册一次，却让 LayoutChild 直接使用 CourseCard
export default {
  components: { CourseCard, LayoutChild },
}
~~~~

**正确写法：**

~~~~ts
// LayoutChild.vue
import CourseCard from './CourseCard.vue'

export default {
  components: { CourseCard },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 directives key 中包含 v- 或跨组件复用局部指令

**触发条件：** 在 directives key 中包含 v- 或跨组件复用局部指令

**原因：** 注册表保存指令名本体，`v-` 只属于模板语法；局部指令也只对注册它的组件可见。

**后果：** 模板出现 Failed to resolve directive，预期的聚焦、测量或 DOM 行为没有执行。

**错误示例：**

~~~~ts
export default {
  directives: {
    'v-focus': focus,
  },
}
~~~~

**正确写法：**

~~~~ts
const focus = {
  /** 在当前输入元素挂载后设置焦点。 */
  mounted(element: HTMLInputElement) {
    element.focus()
  },
}

export default {
  directives: { focus },
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 1. 组件名称区分显式声明与编译器推导

`getComponentName()` 优先读取组件显式 `name`，再读取编译器写入的推导名。KeepAlive 使用这个运行时名称执行 include / exclude 匹配，因此稳定筛选应依赖显式名称，而不是导入别名。

### 2. 自动透传只发生在可承接的单一根上

`renderComponentRoot()` 只有在 `inheritAttrs !== false` 且存在可透传的元素或组件根时，才克隆根 VNode 并合并 attrs。包装组件的语义目标不是根节点时，应关闭自动透传并显式绑定。

### 3. fragment 无法替组件决定 attribute 归属

多根、文本根或注释根不能进入唯一根 VNode 的 attrs 合并路径；开发分支会对未消费 attributes 给出诊断。多根布局应主动选定唯一承载节点，而不是消除警告后丢弃输入。

### 4. 资源解析先局部、后全局并归一名称

`resolveAssets()` 先查当前实例的 components 或 directives，再查 appContext 的全局表，并依次尝试 exact、camelCase 和 PascalCase。局部注册适合显式依赖与较小作用域，同名时也能有意覆盖全局资源。

### 5. 局部资源表属于当前实例渲染上下文

`applyOptions()` 把合并后的 components 与 directives 表挂到当前实例，官方测试也覆盖来自 mixins / extends 的资源解析。该表不会写入后代实例；每个使用者仍需自行导入和注册。
:::
