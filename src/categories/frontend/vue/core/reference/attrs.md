---
id: vue.core.reference.components.attrs
type: reference
title: 透传 attributes
summary: 理解未声明 props 和 emits 的 attributes 如何自动继承到组件根节点，并用 inheritAttrs、$attrs 与 useAttrs 控制落点
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.components.props
  - vue.core.reference.components.emits
  - vue.core.reference.components.slots
tags:
  - $attrs
  - useAttrs
  - inheritAttrs
  - 透传 attributes
  - 事件监听器
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-28
sources:
  - title: Vue 透传 Attributes 指南
    url: https://cn.vuejs.org/guide/components/attrs.html
  - title: Vue 透传 Attributes 指南原始 Markdown
    url: https://github.com/vuejs/docs/blob/main/src/guide/components/attrs.md
  - title: Vue 组件事件：声明触发的事件
    url: https://cn.vuejs.org/guide/components/events.html#declaring-emitted-events
  - title: Vue 3.5.40 componentProps.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts
  - title: Vue 3.5.40 componentRenderUtils.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts
  - title: Vue 3.5.40 apiSetupHelpers.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiSetupHelpers.ts
group: components
signature: "function useAttrs(): SetupContext['attrs']"
anchors:
  - 概述
  - 单根节点的自动继承
  - 控制 attributes 的落点
  - 多根节点与组件根节点
  - useAttrs()
  - 易错使用提示
  - 最小源码实现
---

# 透传 attributes

## 一、概述

父组件传给组件、但没有被接收方声明为 prop 或 emits 监听器的 attribute，会进入透传 attributes。常见成员包括 `class`、`style`、`id` 和原生事件监听器。它们保存在 `$attrs` 中；单根节点组件默认还会把它们合并到根元素或根组件。

## 二、单根节点的自动继承

组件渲染单个元素根节点时，透传 attributes 自动加到该根节点。根节点已有的 `class` 和 `style` 会与父组件传入值合并；根节点已有同类 `v-on` 监听器时，父子监听器都会执行。该行为关注的是组件最终的根节点，而不是文件中看起来最重要的交互元素。

~~~~vue
<!-- MyButton.vue -->
<button class="button">保存</button>

<!-- 父组件 -->
<MyButton class="large" @click="onClick" />

<!-- class 合并，监听器落到 button -->
<button class="button large">保存</button>
~~~~

## 三、控制 attributes 的落点

包装组件常需要把 attributes 交给内层输入框或按钮，而不是外层布局容器。此时用 `defineOptions({ inheritAttrs: false })` 关闭自动继承，再在目标节点写 `v-bind="$attrs"`。`$attrs` 保留 attribute 的原始大小写：`foo-bar` 应用方括号访问；`@click` 在对象中对应 `onClick`。

~~~~vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="button-wrapper">
    <button v-bind="$attrs">保存</button>
  </div>
</template>
~~~~

:::demo{id="vue.core.reference.components.attrs.attrs-demo" playground="true"}
对比默认自动继承与 inheritAttrs: false 时 class 和点击监听器的实际落点
:::

## 四、多根节点与组件根节点

多根节点组件没有唯一自动落点，必须显式选择一个节点绑定 `$attrs`，否则开发环境会警告无法继承。若单根节点本身是另一个组件，透传 attributes 会继续转发给这个根组件；当前组件已声明的 props 和 emits 监听器已被消费，不在继续转发的集合中，而根组件仍可把收到的 key 声明为自己的 prop。

~~~~vue
<template>
  <header>工具栏</header>
  <main v-bind="$attrs">
    <slot />
  </main>
  <footer>状态栏</footer>
</template>
~~~~

## 五、useAttrs()

`useAttrs()` 在 `<script setup>` 中返回 setup context 的 attrs 对象，始终能读到最新的透传值。官方明确说明它出于性能考虑不是响应式对象，不能用 watch 观察某个键；需要响应式连接时应把该值声明为 prop，需要在每次组件更新后读取最新 attrs 做副作用时可使用 `onUpdated()`。模板中通常直接使用 `$attrs` 即可。

~~~~ts
import { onUpdated, useAttrs } from 'vue'

const attrs = useAttrs()

onUpdated(() => {
  console.log(attrs['aria-label'])
})
~~~~

## 六、易错使用提示

:::pitfalls
### 包装组件仍让 attributes 自动落到外层容器

**触发条件：** 包装组件仍让 attributes 自动落到外层容器

**原因：** 单根节点组件默认继承到根节点。若真正的交互控件位于包装 div 内，父组件传入的 `id`、ARIA 属性、class 和监听器都会落在 div，而不是按钮。

**后果：** 可访问名称、选择器和点击区域作用于错误元素，键盘或表单行为与调用方预期不符。

**错误示例：**

~~~~vue
<template>
  <div class="wrapper"><button>保存</button></div>
</template>
~~~~

**正确写法：**

~~~~vue
<script setup>
defineOptions({ inheritAttrs: false })
</script>
<template>
  <div class="wrapper"><button v-bind="$attrs">保存</button></div>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 多根节点组件依赖自动透传

**触发条件：** 多根节点组件依赖自动透传

**原因：** 多个根节点之间没有唯一选择，Vue 不会猜测 `id`、class 或监听器应落在哪里。必须在语义正确的根节点显式绑定 `$attrs`。

**后果：** 开发环境出现 extraneous attributes 或 listeners 警告，传入属性没有出现在任何 DOM 节点。

**错误示例：**

~~~~vue
<header>标题</header>
<main>正文</main>
<footer>页脚</footer>
~~~~

**正确写法：**

~~~~vue
<header>标题</header>
<main v-bind="$attrs">正文</main>
<footer>页脚</footer>
~~~~

**验证方式：** 对照正确写法验证结果。

### 触发自定义事件却不声明 emits

**触发条件：** 触发自定义事件却不声明 emits

**原因：** 只有已声明 emits 的监听器才会在 props/attrs 分流时被消费。未声明的 `@click` 仍可能作为原生监听器透传到根元素；组件又执行 `$emit('click')` 时，同一次点击可能走两条路径。

**后果：** 父组件点击处理器执行两次，导致计数重复、请求重复或开关状态回到原值。

**错误示例：**

~~~~vue
<script setup>
const emit = defineEmits()
</script>
<template>
  <button @click="emit('click')">保存</button>
</template>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
const emit = defineEmits<{ click: [] }>()
</script>
<template>
  <button @click="emit('click')">保存</button>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 watch 侦听 useAttrs() 的某个键

**触发条件：** 用 watch 侦听 useAttrs() 的某个键

**原因：** `useAttrs()` 返回最新 attrs，但官方明确说明该对象不是响应式对象。把 getter 传给 watch 不会建立可靠的属性依赖。

**后果：** 父组件更新 attribute 后回调不执行，依赖旧值的同步逻辑保持过期状态。

**错误示例：**

~~~~ts
const attrs = useAttrs()
watch(() => attrs.label, (label) => syncLabel(label))
~~~~

**正确写法：**

~~~~ts
const props = defineProps<{ label?: string }>()
watch(() => props.label, (label) => syncLabel(label))
~~~~

**验证方式：** 对照正确写法验证结果。

### 按 prop 的驼峰规则读取 $attrs 键名

**触发条件：** 按 prop 的驼峰规则读取 $attrs 键名

**原因：** 透传 attributes 在 JavaScript 中保留原始大小写，连字符属性不会自动变成驼峰键；事件监听器则使用 `onClick` 形式。

**后果：** 代码读到 undefined，条件转发、日志或属性筛选悄然失效。

**错误示例：**

~~~~ts
const label = attrs.ariaLabel
const click = attrs.click
~~~~

**正确写法：**

~~~~ts
const label = attrs['aria-label']
const click = attrs.onClick
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 七、最小源码实现

`componentProps.ts` 遍历父组件传入对象：匹配声明的 key 进入 props，匹配声明 emits 的监听器被消费，其余 key 保留原始大小写进入 attrs。`componentRenderUtils.ts` 在渲染单个元素或组件根节点时，通过 `cloneVNode()` 合并 attrs；`inheritAttrs: false` 跳过该步骤，多根、文本或 Teleport 根节点在未显式访问 attrs 时发出开发环境警告。`useAttrs()` 只是返回当前实例 setup context 中的 attrs。

~~~~ts
// 精简自 vuejs/core v3.5.40 componentProps.ts、componentRenderUtils.ts
/** 把父组件传入值分流到 props 与 attrs。 */
function setFullProps(instance, rawProps, props, attrs) {
  for (const key in rawProps) {
    const camelKey = camelize(key)
    if (hasOwn(instance.propsOptions[0], camelKey)) {
      props[camelKey] = rawProps[key]
    } else if (!isEmitListener(instance.emitsOptions, key)) {
      attrs[key] = rawProps[key]
    }
  }
}

/** 把未被消费的 attrs 合并到可继承的单个根节点。 */
function applyFallthrough(root, attrs, inheritAttrs) {
  if (inheritAttrs !== false && isElementOrComponent(root)) {
    return cloneVNode(root, attrs)
  }
  return root
}

/** 返回当前组件 setup context 的 attrs。 */
function useAttrs() {
  return getCurrentInstance().setupContext.attrs
}
~~~~

:::tip
props、emits 和 attrs 来自同一个父组件传入对象。先声明并消费组件接口，剩余项才是 attrs；这比把 `$attrs` 理解成“所有 HTML 属性”更准确。
:::
