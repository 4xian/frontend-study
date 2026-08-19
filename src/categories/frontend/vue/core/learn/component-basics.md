---
id: vue.core.learn.basics.component-basics
type: lesson
title: 组件基础
summary: 按职责拆分界面，静态组合局部组件，并理解组件定义、实例与最终 DOM 的边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.basics.sfc-basics
  - vue.core.reference.application.define-component
  - vue.core.reference.components.props
  - vue.core.reference.components.emits
tags:
  - 组件
  - 组件实例
  - script setup
  - 局部注册
  - 全局注册
  - Fragment
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-30
sources:
  - title: Vue 组件基础
    url: https://cn.vuejs.org/guide/essentials/component-basics.html
  - title: Vue 组件注册
    url: https://cn.vuejs.org/guide/components/registration.html
  - title: Vue script setup
    url: https://cn.vuejs.org/api/sfc-script-setup.html
  - title: Vue 3 迁移指南：Fragments
    url: https://v3-migration.vuejs.org/new/fragments
  - title: Vue 3.5.40 compiler-sfc compileScript.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/compileScript.ts
  - title: Vue 3.5.40 compiler-core transformElement.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/transformElement.ts
  - title: Vue 3.5.40 runtime-core resolveAssets.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/resolveAssets.ts
  - title: Vue 3.5.40 runtime-core component.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts
  - title: Vue 3.5.40 runtime-core renderer.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts
  - title: Vue 3.5.40 runtime-dom index.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/index.ts
stage: basics
level: beginner
estimatedMinutes: 45
prerequisites:
  - vue.core.learn.basics.form-bindings
objectives:
  - 按独立职责、变化原因和复用需要识别组件边界
  - 在 script setup 中静态导入 SFC，并用 PascalCase 标签组合组件树
  - 区分组件定义、组件实例、组件树和最终 DOM
  - 解释同一组件定义为什么能创建状态互不影响的多个实例
  - 选择局部或应用级全局注册，并判断组件名称的解析结果
  - 正确使用 Vue 3 多根组件与 DOM 内模板的特殊规则
recap:
  - 组件按职责、状态所有权和变化原因拆分，组件树不等于最终 DOM 树。
  - script setup 中的静态导入已经让组件对当前模板可见，局部依赖不会自动传给后代。
  - 每次使用组件定义都会创建新实例；实例级 setup 状态默认互相独立。
  - 局部导入是默认选择，全局注册只属于当前应用上下文并应谨慎使用。
  - Vue 3 支持多根组件；DOM 内模板才需要 kebab-case、显式结束标签和合法元素位置。
  - 父子公开输入与输出分别留到 Props 和 Emits 课程，本课只建立静态组合心智模型。
---

# 组件基础

## 一、先按职责拆分界面

上一课完成了可交互表单。页面继续增长时，不应只按文件行数平均切块，而应寻找可以独立命名、重复出现或因不同原因变化的界面职责。组件把一块结构、状态和行为收拢成可复用定义，父组件再把这些定义组合成组件树。

~~~~text
StudyPage
├─ CourseSearch
├─ ResultSummary
└─ CourseResult × n
~~~~

| 观察信号 | 适合拆分时 | 不必强拆时 |
| --- | --- | --- |
| 独立职责 | 可以用稳定业务名称描述 | 只是相邻的几行标记 |
| 变化原因 | 有自己的状态或交互节奏 | 始终随父区域一起变化 |
| 重复使用 | 同一结构会出现多次 | 没有复用且拆分后更难阅读 |
| 维护边界 | 可以单独定位、检查或测试 | 只是在文件间搬运模板 |

:::tip
先找状态所有权和变化原因，再决定文件边界；组件数量本身不是目标。
:::

## 二、在 script setup 中静态导入组件

一个 `.vue` 文件通常提供一份组件定义。在父 SFC 的 `<script setup>` 中导入它后，导入变量会直接进入当前模板的可用范围，不需要再写 `components` 配置。课程代码统一使用 PascalCase 文件名、变量名和模板标签。

~~~~vue
<script setup lang="ts">
import ResultSummary from './ResultSummary.vue'
</script>

<template>
  <main>
    <h1>学习记录</h1>
    <ResultSummary />
  </main>
</template>
~~~~

:::tip
文件与父组件处于同一目录并不会自动建立依赖。谁在自己的模板中使用组件，谁就应显式导入它。
:::

## 三、区分定义、实例与最终 DOM

组件定义是可复用蓝图，不是页面上的一个元素。模板每出现一次组件标签，渲染器都会为该位置创建一个组件实例，执行一次实例级 setup，再由这个实例渲染出 DOM。组件树记录定义之间的组合关系，浏览器 DOM 树则记录最终元素和文本，两者不能一一等同。

| 概念 | 数量由什么决定 | 负责什么 |
| --- | --- | --- |
| 组件定义 | 一个导入的组件模块 | 描述结构与行为 |
| 组件实例 | 模板中每个实际使用位置 | 保存该次使用的实例状态 |
| 组件树 | 父组件渲染哪些子组件 | 表达职责与状态所有权 |
| 最终 DOM | 各实例渲染结果 | 交给浏览器布局、绘制与交互 |

~~~~vue
<!-- IndependentCounter.vue：一份组件定义 -->
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

/** 增加当前组件实例自己的计数。 */
function increment(): void {
  count.value += 1
}
</script>

<template>
  <button type="button" @click="increment">本实例：{{ count }}</button>
</template>
~~~~

~~~~vue
<script setup lang="ts">
import IndependentCounter from './IndependentCounter.vue'
</script>

<template>
  <IndependentCounter />
  <IndependentCounter />
</template>
~~~~

上面只有一份 `IndependentCounter` 定义，却有两个实例。因为 `ref(0)` 位于实例级的 `<script setup>` 中，每个实例都会创建自己的 count；点击第一个按钮不会修改第二个实例。

:::demo{id="vue.core.learn.basics.component-basics.independent-instances-demo" playground="true"}
静态使用同一组件两次，分别操作并观察两个实例的状态保持独立
:::

:::warning
实例状态默认独立不等于所有导入值都独立。若把 ref 放进另一个模块的顶层并由多个实例导入，它会遵循 ES 模块单例语义而被共享。
:::

## 四、选择注册范围并理解名称解析

在 SFC 项目中，默认选择 `<script setup>` 局部导入：依赖写在使用处，IDE、重命名和 tree-shaking 都更容易利用静态关系。Options API 的 `components` 同样只对当前组件模板可见；局部注册不会自动传给后代。

| 形式 | 可见范围 | 使用建议 |
| --- | --- | --- |
| script setup import | 当前 SFC 模板 | 默认选择，依赖最清楚 |
| Options API components | 当前组件模板 | 识别已有代码，不在本课混用 |
| app.component() | 当前应用实例的所有后代 | 只用于稳定的应用级公共组件 |

~~~~ts
import { createApp } from 'vue'
import App from './App.vue'
import AppIcon from './AppIcon.vue'

const app = createApp(App)
app.component('AppIcon', AppIcon)
app.mount('#app')
~~~~

这里的“全局”只属于这一个 app 上下文，并不是跨应用的全局变量。把只在一个页面出现的业务组件全局注册，会隐藏依赖、扩大名称冲突范围，还可能让未使用组件难以被移除。

模板编译时会优先检查 `<script setup>` 绑定；需要运行时查找时，Vue 再检查组件自身名称、当前组件的局部注册和当前 app 的全局注册。解析过程兼容原名、camelCase 与 PascalCase，但项目应保持一种命名规范，而不是依赖兼容分支混写。

| 位置 | 推荐写法 | 原因 |
| --- | --- | --- |
| SFC 文件 | IndependentCounter.vue | 多词 PascalCase 清楚表达组件 |
| script setup 导入 | IndependentCounter | 是合法 JavaScript 标识符 |
| SFC 模板 | &lt;IndependentCounter /&gt; | 与导入一致，区别于原生元素 |

:::warning
开发环境出现 `Failed to resolve component` 时，先检查导入路径、标签拼写和当前模板可见范围。未解析标签可能以未知元素留在 DOM 中，不能据此认为组件已正常运行。
:::

## 五、Vue 3 组件可以拥有多个根节点

Vue 3 使用 Fragment 支持多根组件。不要沿用 Vue 2 的“必须单根”规则，为了通过语法检查机械增加无语义 wrapper；是否保留一个根元素，应由文章、表单、导航等语义以及实际布局需要决定。

:::compare{before="无语义 wrapper" after="按真实语义使用多根"}
### 无语义 wrapper

~~~~text
<template>
  <div>
    <header>课程标题</header>
    <main>课程正文</main>
  </div>
</template>
~~~~

### 按真实语义使用多根

~~~~text
<template>
  <header>课程标题</header>
  <main>课程正文</main>
</template>
~~~~
:::

:::tip
多根是一项能力，不是默认风格。若 `<article>` 或 `<form>` 本身承担正确语义、样式或布局职责，就应保留它。多根组件没有唯一的外部 attribute 自动落点，具体规则留给后续接口课程。
:::

## 六、把 DOM 内模板与 SFC 规则分开

只有 Vue 从已被浏览器解析过的挂载容器 DOM 中读取模板时，才受 DOM 内模板限制。浏览器会先折叠标签大小写、解释自闭合写法并修正 table 等元素的非法子节点；SFC 和 JavaScript 字符串模板由 Vue 编译器读取原始内容，不应套用这些限制。

| 模板来源 | 组件标签 | 闭合方式 |
| --- | --- | --- |
| SFC | &lt;IndependentCounter /&gt; | 支持自闭合 |
| DOM 内模板 | &lt;independent-counter&gt;&lt;/independent-counter&gt; | 使用 kebab-case 并显式结束 |

:::compare{before="DOM 内模板错误写法" after="DOM 内模板正确写法"}
### DOM 内模板错误写法

~~~~text
<IndependentCounter />
<span>后续内容</span>
~~~~

### DOM 内模板正确写法

~~~~text
<independent-counter></independent-counter>
<span>后续内容</span>
~~~~
:::

table、select 等原生元素还有固定内容模型。在 DOM 内模板中，应保留合法原生结构，并用 `is="vue:组件名"` 指定该位置由 Vue 组件负责；这条规则解决浏览器先行解析，不是动态组件用法。

~~~~html
<table>
  <tbody>
    <tr is="vue:result-row"></tr>
  </tbody>
</table>
~~~~

## 七、把父子公开接口留给 Props 与 Emits

父组件决定在哪里静态使用子组件，父子实例却各自拥有作用域。形成包含关系，并不会让父模板直接读取子组件的局部状态，也不会让子组件自动读取父组件的局部变量。组件间需要有意设计公开接口。

| 后续方向 | 解决的问题 | 本课边界 |
| --- | --- | --- |
| Props | 父组件向子组件提供公开输入 | 下一课再声明和使用 |
| Emits | 子组件向父组件表达公开意图 | 再下一课再声明和使用 |

:::tip
先掌握“定义复用、实例独立、静态组合”，再进入组件通信。不要在第一课同时引入多套接口机制。
:::

## 八、易错使用提示

:::pitfalls
### 只写组件标签，认为同目录文件会被自动发现

**触发条件：** 只写组件标签，认为同目录文件会被自动发现

**原因：** 文件系统位置不会创建 setup 绑定或注册项，当前模板仍需命中局部导入或应用级注册。

**后果：** 开发环境出现 Failed to resolve component，页面可能留下未知标签，子组件逻辑不会执行。

**错误示例：**

~~~~vue
<template>
  <ResultSummary />
</template>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
import ResultSummary from './ResultSummary.vue'
</script>

<template>
  <ResultSummary />
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 把实例状态提到共享模块，仍期待每次使用互不影响

**触发条件：** 把实例状态提到共享模块，仍期待每次使用互不影响

**原因：** script setup 随每个实例执行，但 ES 模块顶层通常只初始化一次；导入同一个模块级 ref 会主动共享状态。

**后果：** 操作第一个实例时第二个也变化，让局部交互产生意外耦合。

**错误示例：**

~~~~ts
// counter-state.ts：所有导入者共享这一份 ref
import { ref } from 'vue'

export const count = ref(0)
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

/** 增加当前实例自己的计数。 */
function increment(): void {
  count.value += 1
}
</script>
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为父组件的局部导入会自动传给所有后代

**触发条件：** 认为父组件的局部导入会自动传给所有后代

**原因：** 局部可见性只属于当前组件模板，子组件编译自己的模板时没有父组件的 setup 绑定。

**后果：** 父组件能使用的标签在子组件中解析失败，依赖关系变得靠猜。

**错误示例：**

~~~~vue
<!-- Parent.vue 的导入不会让 Child.vue 自动认识 StatusBadge -->
<script setup lang="ts">
import StatusBadge from './StatusBadge.vue'
import Child from './Child.vue'
</script>

<template><Child /></template>
~~~~

**正确写法：**

~~~~vue
<!-- Child.vue 自己声明它使用的组件 -->
<script setup lang="ts">
import StatusBadge from './StatusBadge.vue'
</script>

<template><StatusBadge /></template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 为了省略 import，把所有组件都全局注册

**触发条件：** 为了省略 import，把所有组件都全局注册

**原因：** 全局注册把依赖移到应用入口，并让当前应用的任意后代都能使用该名称。

**后果：** 使用处难以定位实现，未使用组件可能无法 tree-shake，名称冲突和改名影响面扩大。

**错误示例：**

~~~~ts
app.component('CheckoutSummary', CheckoutSummary)
app.component('CouponEditor', CouponEditor)
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
import CheckoutSummary from './CheckoutSummary.vue'
import CouponEditor from './CouponEditor.vue'
</script>
~~~~

**验证方式：** 对照正确写法验证结果。

### 用原生或含糊名称命名业务组件

**触发条件：** 用原生或含糊名称命名业务组件

**原因：** 组件标签与原生 HTML 标签共享模板语法；多词 PascalCase 名称能清楚表达组件边界。

**后果：** 阅读者难以判断渲染的是原生元素还是组件，名称解析也更容易产生误判。

**错误示例：**

~~~~vue
<button>保存</button>
~~~~

**正确写法：**

~~~~vue
<PrimaryActionButton />
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 SFC 的 PascalCase 和自闭合原样放进 DOM 内模板

**触发条件：** 把 SFC 的 PascalCase 和自闭合原样放进 DOM 内模板

**原因：** 浏览器会在 Vue 读取模板前折叠标签名，并按 HTML 规则处理自定义标签的自闭合写法。

**后果：** 组件名不能按原意解析，后续兄弟节点还可能被吞入未闭合标签。

**错误示例：**

~~~~html
<IndependentCounter />
<span>后续内容</span>
~~~~

**正确写法：**

~~~~html
<independent-counter></independent-counter>
<span>后续内容</span>
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 DOM 内 table 中直接放自定义组件标签

**触发条件：** 在 DOM 内 table 中直接放自定义组件标签

**原因：** table 等元素只允许特定子元素，浏览器会在 Vue 接管前移动或修正非法节点。

**后果：** 组件离开预期父元素，表格结构、样式和可访问语义都可能错误。

**错误示例：**

~~~~html
<table>
  <result-row></result-row>
</table>
~~~~

**正确写法：**

~~~~html
<table>
  <tbody>
    <tr is="vue:result-row"></tr>
  </tbody>
</table>
~~~~

**验证方式：** 对照正确写法验证结果。

### 沿用 Vue 2 的组件必须单根规则

**触发条件：** 沿用 Vue 2 的组件必须单根规则

**原因：** Vue 3 已用 Fragment 正式支持多根组件，单根不再是语法要求。

**后果：** 为了不存在的限制加入无语义 wrapper，可能干扰布局、选择器和可访问结构。

**错误示例：**

~~~~vue
<template>
  <div>
    <header>标题</header>
    <main>正文</main>
  </div>
</template>
~~~~

**正确写法：**

~~~~vue
<template>
  <header>标题</header>
  <main>正文</main>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 九、从源码推导适用场景

:::steps
### 按状态所有权和变化原因划分组件

每个实例拥有独立 setup state。某块 UI 可以独立命名、交互或测试时，适合让状态回到该组件；只有几行且不会独立变化的标记不必强拆。

### 用重复实例承载互不影响的局部交互

渲染器会为每个组件 VNode 创建实例。计数器、可展开帮助区等状态天然属于单个展示单元时，可复用同一定义并保留各自状态。

### 把局部 import 当成可阅读的依赖图

setup 绑定会直接进入模板编译结果。页面级、功能级组件保持局部导入，代码评审、重命名、IDE 跳转与 tree-shaking 都能利用这条静态关系。

### 只为真正应用级词汇使用全局注册

应用上下文隔离全局注册。只有名称和实现都是稳定公共契约、并被大量页面使用的基础组件，才值得承担隐式依赖的取舍。

### 用 Fragment 保留正确文档语义

wrapper 只为满足旧 Vue 2 限制时可以删除；若它承担 article、form、navigation、样式或布局职责，则即使 Vue 3 支持多根也应保留。

### 服务端模板集成先识别模板来源

服务器若把模板直接输出进挂载容器，就必须遵守 DOM 内模板规则；若只加载已编译 SFC 应用，则组件模板仍由 Vue 工具链处理。

### 名称兼容用于跨模板来源，不用于放松规范

camelCase 与 PascalCase 回退让同一定义适配不同模板来源。项目自身 SFC 仍统一 PascalCase，避免把兼容能力误当成多套推荐写法。
:::

:::exercise
### 拆出两个独立的折叠提示实例

**要求：**

~~~~text
创建 `IndependentNotice.vue`，在自己的 script setup 中用 ref 保存展开状态，并用原生按钮切换。父 SFC 局部导入一次、静态使用两次。分别操作两个实例，确认互不影响；不要加入父子通信。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
<!-- IndependentNotice.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <section>
    <button type="button" @click="open = !open">
      {{ open ? '收起提示' : '展开提示' }}
    </button>
    <p v-if="open">这是当前实例自己的内容。</p>
  </section>
</template>

<!-- StudyPage.vue -->
<script setup lang="ts">
import IndependentNotice from './IndependentNotice.vue'
</script>

<template>
  <IndependentNotice />
  <IndependentNotice />
</template>
~~~~
:::

- [ ] 组件按独立职责和状态所有权拆分，而不是只按行数
- [ ] 当前 SFC 显式导入自己使用的局部组件
- [ ] 同一定义的多个实例分别维护实例级状态
- [ ] SFC 使用 PascalCase，DOM 内模板遵守浏览器解析规则
- [ ] 全局注册只用于稳定的应用级公共组件
