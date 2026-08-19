---
id: vue.core.learn.basics.template-syntax
type: lesson
title: 模板语法
summary: 从单文件组件出发，学会用模板显示脚本数据、绑定属性，并完成最基本的条件与列表渲染
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.reactivity.ref
tags:
  - SFC
  - template
  - script setup
  - v-bind
  - v-if
  - v-for
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-29
sources:
  - title: Vue 单文件组件
    url: https://cn.vuejs.org/guide/scaling-up/sfc.html
  - title: Vue 模板语法
    url: https://cn.vuejs.org/guide/essentials/template-syntax.html
  - title: Vue 内置指令
    url: https://cn.vuejs.org/api/built-in-directives.html
stage: basics
level: beginner
estimatedMinutes: 18
prerequisites:
  - vue.core.learn.basics.sfc-basics
objectives:
  - 说清楚 Vue 单文件组件中 template、script setup 与 style 三个区块的职责
  - 使用文本插值与属性绑定，把脚本顶层数据放到页面的文字和 HTML attribute 中
  - 用 v-if 与 v-for 完成最小的条件渲染和列表渲染
recap:
  - 单文件组件用 template、script setup 与 style 组织一个组件的结构、逻辑和样式。
  - script setup 的顶层绑定可直接用于模板；双大括号显示文本，冒号绑定 HTML attribute。
  - v-if 根据真假决定是否渲染，v-for 根据数据重复渲染，并应为列表项提供稳定的 key。
  - 模板绑定只写无副作用的表达式；不可信内容不要交给 v-html。
---

# 模板语法

## 一、先认识单文件组件

Vue 单文件组件（SFC）就是一个 `.vue` 文件。最常见的三个区块各管一件事：`<template>` 描述页面结构，`<script setup>` 准备模板要用的数据与逻辑，`<style>` 定义样式。它们放在同一个文件中，共同组成一个组件。

~~~~vue
<script setup lang="ts">
const pageTitle = '我的第一篇 Vue 课程'
</script>

<template>
  <h1>{{ pageTitle }}</h1>
</template>

<style scoped>
h1 {
  color: #0071e3;
}
</style>
~~~~

`<script setup>` 是单文件组件中的一种简洁写法。写在其中的顶层变量可以直接出现在模板里，不需要再手动返回。现阶段先记住“脚本准备数据，模板使用数据”即可；组件复用、响应式状态和样式作用域会在后续课程展开。

## 二、模板如何拿到脚本数据

:::steps
### 在 script setup 顶层声明数据

用普通 `const` 声明本次渲染需要的静态数据。

### 在 template 中引用绑定名

模板表达式可以直接访问 `<script setup>` 的顶层绑定。

### 让 Vue 生成页面内容

Vue 编译模板，并把表达式结果放到相应的文字、attribute 或结构位置。
:::

## 三、用插值显示文字

双大括号 `{{ }}` 是最基本的文本插值。Vue 会计算其中的表达式，并把结果作为纯文本放进元素内容。对零基础学习者来说，先从直接读取一个绑定名开始。

~~~~vue
<script setup lang="ts">
const greeting = '你好，Vue'
</script>

<template>
  <p>{{ greeting }}</p>
</template>
~~~~

## 四、用冒号绑定属性

双大括号只能放在元素内容中。要让 `title`、`href`、`src` 等 HTML attribute 使用脚本数据，需要写 `v-bind:属性名`；常用简写是 `:属性名`。

~~~~vue
<script setup lang="ts">
const linkUrl = 'https://cn.vuejs.org/guide/essentials/template-syntax.html'
const linkHint = '打开 Vue 中文文档'
</script>

<template>
  <a :href="linkUrl" :title="linkHint">Vue 中文文档</a>
</template>
~~~~

## 五、用 v-if 决定是否渲染

`v-if` 根据表达式的真假决定元素是否存在。值为真时渲染，值为假时不渲染。更完整的条件分支与频繁切换场景会在条件渲染课程中继续学习。

~~~~vue
<script setup lang="ts">
const courseAvailable = true
</script>

<template>
  <p v-if="courseAvailable">课程已开放</p>
</template>
~~~~

## 六、用 v-for 渲染列表

`v-for` 根据一组数据重复渲染元素。`topic in topics` 表示依次取出 `topics` 中的每个 `topic`。为每一项绑定稳定的 `:key`，可以帮助 Vue 识别列表项；列表更新的更多规则留到列表渲染课程。

~~~~vue
<script setup lang="ts">
const topics = [
  { id: 'template', name: '模板' },
  { id: 'binding', name: '绑定' },
]
</script>

<template>
  <ul>
    <li v-for="topic in topics" :key="topic.id">{{ topic.name }}</li>
  </ul>
</template>
~~~~

## 七、把四种语法放在一起

下面的真实组件只使用静态顶层数据。运行区与“查看源码”展示的是同一个 `.vue` 文件，你可以逐行对照插值、属性绑定、`v-if` 和 `v-for` 如何落到页面上。

:::demo{id="vue.core.learn.basics.template-syntax.template-syntax-demo" playground="true"}
用一个静态课程摘要同时观察文本插值、属性绑定、条件渲染与列表渲染
:::

:::tip
这节课刻意不引入响应式状态。等学习 `ref()` 后，绑定值发生变化时，Vue 会继续使用相同模板语法更新页面。
:::

## 八、易错使用提示

:::pitfalls
### 在 HTML attribute 中使用双大括号

**触发条件：** 在 HTML attribute 中使用双大括号

**原因：** 官方模板语法明确规定，双大括号用于文本插值，不能写进 HTML attribute；attribute 应使用 `v-bind` 或 `:`。

**后果：** 模板编译会报告 attribute 插值无效，`src`、`href` 等属性也不会按脚本数据正确绑定。

**错误示例：**

~~~~vue
<script setup lang="ts">
const imageUrl = '/logo.png'
</script>

<template>
  <img src="{{ imageUrl }}" alt="Vue 标志" />
</template>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
const imageUrl = '/logo.png'
</script>

<template>
  <img :src="imageUrl" alt="Vue 标志" />
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把不可信内容交给 v-html

**触发条件：** 把不可信内容交给 v-html

**原因：** `v-html` 会把绑定值直接写入元素的 `innerHTML`。官方安全警告要求它只用于可信内容，绝不能用于用户提供的 HTML。

**后果：** 恶意标签或事件属性可能被浏览器执行，形成 XSS，进而读取页面数据或冒用当前用户身份。

**错误示例：**

~~~~vue
<script setup lang="ts">
const userInput = '<img src="x" onerror="stealSession()">'
</script>

<template>
  <p v-html="userInput"></p>
</template>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
const userInput = '<strong>来自用户的内容</strong>'
</script>

<template>
  <p>{{ userInput }}</p>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 在模板绑定中写语句或控制流

**触发条件：** 在模板绑定中写语句或控制流

**原因：** 每个模板绑定只支持一个能够被求值的 JavaScript 表达式。变量声明、`if` 等语句不能直接放进插值或指令值。

**后果：** 模板无法通过编译，页面会显示编译错误，而不是期望的条件结果。

**错误示例：**

~~~~vue
<template>
  <p>{{ if (isReady) { return message } }}</p>
</template>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
const isReady = true
const message = '准备完成'
</script>

<template>
  <p>{{ isReady ? message : '准备中' }}</p>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 让模板中调用的函数产生副作用

**触发条件：** 让模板中调用的函数产生副作用

**原因：** Vue 可能在组件更新时重新调用模板表达式中的函数。官方要求这类函数不要修改数据或触发异步操作。

**后果：** 一次与该文字无关的组件更新也可能再次改动数据，导致显示结果漂移或触发重复操作。

**错误示例：**

~~~~vue
<script setup lang="ts">
let callCount = 0

/** 错误地在生成展示文字时修改外部数据。 */
function formatTitle(): string {
  callCount += 1
  return `第 ${callCount} 次渲染`
}
</script>

<template>
  <p>{{ formatTitle() }}</p>
</template>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
const quantity = 2

/** 只根据传入数值生成展示文字。 */
function formatQuantity(value: number): string {
  return `数量：${value}`
}
</script>

<template>
  <p>{{ formatQuantity(quantity) }}</p>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 使用复杂或非字符串的动态参数

**触发条件：** 使用复杂或非字符串的动态参数

**原因：** 动态参数 `:[参数]` 的值只能是字符串或 `null`，参数表达式也不能包含 HTML attribute 名称不允许的空格和引号。复杂名称应先在脚本中算好。

**后果：** 含空格或引号的复杂写法会触发编译器警告；数字、对象等非字符串值会触发运行时警告，绑定不会可靠落到目标 attribute。

**错误示例：**

~~~~vue
<script setup lang="ts">
const suffix = 'label'
const attributeIndex = 1
const value = '课程'
</script>

<template>
  <p :['aria-' + suffix]="value">课程</p>
  <p :[attributeIndex]="value">课程</p>
</template>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
const attributeName = 'aria-label'
const value = '课程'
</script>

<template>
  <p :[attributeName]="value">课程</p>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 九、动手练习

:::exercise
### 制作一张静态学习卡片

**要求：**

~~~~text
在一个新的 `.vue` 组件中声明课程标题、课程链接、是否开放和三项知识点。用插值显示标题，用 `:href` 绑定链接，用 `v-if` 显示开放状态，再用 `v-for` 和稳定的 `:key` 渲染知识点列表。不要引入 `ref()` 或点击事件。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
<script setup lang="ts">
const title = 'Vue 模板语法'
const courseUrl = 'https://cn.vuejs.org/guide/essentials/template-syntax.html'
const isOpen = true
const topics = [
  { id: 'text', name: '文本插值' },
  { id: 'attribute', name: '属性绑定' },
  { id: 'rendering', name: '条件与列表渲染' },
]
</script>

<template>
  <article>
    <h2>{{ title }}</h2>
    <a :href="courseUrl">查看课程</a>
    <p v-if="isOpen">课程已开放</p>
    <ul>
      <li v-for="topic in topics" :key="topic.id">{{ topic.name }}</li>
    </ul>
  </article>
</template>
~~~~
:::
