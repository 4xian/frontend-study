# Vue Core 基础课程：组件基础调研

> 核验日期：2026-07-30
>
> 适用版本：Vue 3.5.40。
>
> 资料范围：Vue 中文/英文官方文档、Vue 3 官方迁移指南，以及 `vuejs/core` 的
> `v3.5.40` 固定标签编译器、运行时源码与同标签官方测试。外部资料通过 Tavily
> 检索和提取，结论均回到一手页面或固定标签源码核验。

## 课程定位与边界

本课目标 ID 为 `vue.core.learn.basics.component-basics`。按当前仓库冻结顺序，它紧随
`vue.core.learn.basics.form-bindings`，之后才是独立的 Props 与 Emits 课程。本课回答：为什么要把
界面拆成组件、一个组件定义如何被父组件导入和静态使用、同一定义为什么能创建多个独立实例，
以及 Vue 如何在 SFC 与 DOM 内模板中识别组件标签。

本课只覆盖以下主线：

- 按职责把界面拆成独立、可复用的组件，并用组件树理解父子组合关系。
- 在 `<script setup lang="ts">` 中导入 SFC，并在当前模板中静态使用。
- 区分组件定义、组件实例与最终 DOM；同一定义每使用一次就创建一个实例。
- 建立局部注册优先、全局注册仅在当前应用范围生效的边界。
- 在 SFC 中采用 PascalCase 组件名，理解 kebab-case 兼容解析及未解析组件警告。
- 知道 Vue 3 支持多根组件，并准确限定 DOM 内模板的大小写、闭合标签与元素位置限制。
- 只在概念层说明父组件与子组件有独立作用域，后续通过 Props 和 Emits 建立公开接口。

以下内容明确排除，不进入正文练习或 Demo：

- 不声明或完整教授 Props、Emits；不使用 `defineProps()`、`defineEmits()` 演示通信。
- 不讲 Slots、组件 `v-model`、Attrs、Provide/Inject、模板引用或直接访问子组件实例。
- 不讲异步组件、Suspense、递归组件、命名空间组件或渲染函数。
- 不教学或在 Demo 中使用 `<component :is>`。动态组件与 KeepAlive 已冻结为独立中级课程
  `vue.core.learn.intermediate.dynamic-components-keep-alive`，这里只列为后续关联。
- 不把全局注册扩展成插件、自动扫描、目录约定或组件库安装教程。

在线 Vue 指南会持续更新，并不按 `3.5.40` 补丁版本冻结。本文的公开心智模型由当前中英文官方
文档核验，涉及解析顺序、回退行为和多根运行时能力时，以 `vuejs/core@v3.5.40` 为版本权威。

## 学习目标

完成本课后，学习者应能：

1. 用“独立职责 + 可重复实例”解释为什么要拆组件，而不只把组件理解为缩短文件。
2. 在父 SFC 的 `<script setup>` 中导入子组件，并用 PascalCase 标签静态组合组件树。
3. 准确区分组件定义、每次使用产生的组件实例和实例渲染出的 DOM。
4. 预测同一有状态组件使用两次时的行为，并避免把实例状态误放进共享模块。
5. 说明局部导入、Options API 局部注册与应用级全局注册的可见范围和取舍。
6. 解释 SFC 中组件名的编译期解析路径，以及找不到组件时为什么会出现运行时警告。
7. 正确使用 Vue 3 多根组件，并识别 DOM 内模板与 SFC 模板的解析规则差异。
8. 说出父子接口的后续学习方向，但不提前实现 Props、Emits 或其他通信机制。

## 建议教学顺序

### 1. 从一个过大的页面识别组件职责

先展示由标题、筛选表单、结果摘要和重复结果项组成的页面轮廓，让学习者按“可以独立命名、重复
出现、变化原因不同”识别组件，而不是按任意行数切文件。

```text
App
├─ SearchForm
├─ ResultSummary
└─ ResultItem × n
```

组件树描述的是组件之间的包含关系，不等同于最终 DOM 树。一个组件可能渲染一个根元素、多个根
节点，或继续组合其他组件；本课先关注定义与实例，不画虚构的一一 DOM 映射。

### 2. 复用上一课的 SFC 知识，完成第一次静态组合

只用一句话回顾：一个 `.vue` 文件通常定义一个 SFC 模块。随后立即进入父组件的局部导入，不再
重复 SFC 三个区块、编译链或 scoped CSS 教程。

```vue
<script setup lang="ts">
import ResultSummary from './ResultSummary.vue'
</script>

<template>
  <main>
    <h1>学习记录</h1>
    <ResultSummary />
  </main>
</template>
```

在 `<script setup>` 中，导入的 `ResultSummary` 是当前 SFC 作用域里的组件变量，模板编译器可以
直接引用它；不需要再写一份 `components: { ResultSummary }`。

### 3. 区分定义、实例与 DOM

把同一个 `IndependentCounter` 连续使用两次：

```vue
<IndependentCounter />
<IndependentCounter />
```

- `IndependentCounter.vue` 提供一份组件定义。
- 两个标签位置各创建一个组件实例；每个实例分别执行一次 `<script setup>`。
- 两个实例各自渲染 DOM，并分别维护在 setup 中创建的 `count`。

这一步是本课最重要的反馈环。先点击第一个计数器，再观察第二个保持不变，之后才解释原因。

### 4. 建立局部与全局注册边界

课程主线坚持 SFC `<script setup>` 局部导入。随后用一个对照表说明另两种形式，不让新手同时维护
多套写法：

| 形式 | 可见范围 | 本课建议 |
| --- | --- | --- |
| `<script setup>` 导入 | 当前 SFC 模板 | 默认选择，依赖显式 |
| Options API `components` | 当前组件模板 | 只识别，不在 Demo 混用 |
| `app.component()` | 当前应用中的所有组件 | 仅适合确实应用级通用的组件 |

局部注册不会自动传给后代组件；需要使用某个子组件的 SFC 必须自己导入。全局注册也只是应用实例
范围内的“全局”，同一页面上的另一个 `createApp()` 不会自动共享它。

### 5. 再讲组件名与解析

SFC 和字符串模板中推荐 PascalCase：它是合法 JavaScript 标识符，IDE 容易补全，也能直观看出
不是原生 HTML 元素。Vue 同时允许 `<my-component>` 命中以 `MyComponent` 注册或导入的组件，
但课程代码保持一种风格，不随机混写。

源码层只建立最小路径：模板先检查 `<script setup>` 绑定；未命中时才生成运行时组件解析调用。
运行时按自身名称、局部注册、全局注册查找，并兼容原名、camelCase 和 PascalCase 变体。找不到
普通组件时，开发环境会警告并把原标签字符串交回渲染路径。

### 6. 用 Vue 3 多根节点修正旧知识

Vue 3 组件可以有多个根节点：

```vue
<template>
  <header>课程标题</header>
  <main>课程正文</main>
</template>
```

因此不应为了满足已经过时的“必须单根”规则机械增加 `<div>`。是否使用单根应由语义、样式与
布局决定。多根组件接收未声明 attributes 时没有唯一自动落点，这属于后续 Attrs 课程；本课只
预告边界，不教授 `$attrs` 或 `inheritAttrs`。

### 7. 最后隔离 DOM 内模板规则

先明确适用条件：只有 Vue 从已经被浏览器解析过的页面 DOM（例如挂载容器的 `innerHTML`）读取
模板时，才受以下限制。SFC 和 JavaScript 字符串模板由 Vue 编译器读取原始字符串，不应套用这些
限制。

- DOM 内模板的标签名会被浏览器折叠为小写，组件使用 kebab-case。
- 自定义组件必须显式写结束标签，不能依赖 `<my-component />`。
- `<table>`、`<select>` 等有内容模型限制；必要时保留合法原生元素并使用
  `is="vue:component-name"`。

课程以“父子有各自状态与作用域，公开输入和输出留给 Props/Emits”收束，不接着演示动态组件。

## 最小核心知识

### 组件定义、实例与组件树

组件定义描述视图与行为，可以是 SFC 编译产物，也可以是 JavaScript 组件选项对象。组件定义本身
不是页面上可见的一块 DOM。渲染器在遇到组件 VNode 时创建组件实例，初始化该实例的 props、
slots 和 setup 状态，再运行其渲染过程。

每次使用一个组件都会创建新实例，所以实例内状态默认独立。组件树以根组件为起点，记录哪个
组件渲染了哪些子组件；它适合表达职责与状态所有权，但不能替代浏览器 DOM 树检查。

### `<script setup>` 的静态局部使用

```vue
<script setup lang="ts">
import IndependentCounter from './IndependentCounter.vue'
</script>

<template>
  <IndependentCounter />
  <IndependentCounter />
</template>
```

`compileScript.ts` 把 `.vue` 默认导入记录为 setup 常量绑定，并把绑定元数据交给模板编译器。
`transformElement.ts` 检查到匹配的 setup 绑定后直接生成对该变量的引用，不需要运行时再按字符串
名字查询注册表。官方编译测试同时覆盖 PascalCase 与 kebab-case 标签命中 setup 绑定。

### 局部注册与应用级全局注册

```ts
import { createApp } from 'vue'
import App from './App.vue'
import AppButton from './AppButton.vue'

const app = createApp(App)
app.component('AppButton', AppButton)
app.mount('#app')
```

`app.component()` 把定义放入该应用上下文的组件注册表。全局组件可被当前应用的任意后代模板解析，
但会隐藏使用处的直接依赖，并可能让构建工具无法移除未使用注册项。局部导入把依赖写在使用处，
更利于维护和 tree-shaking。

Options API 的局部 `components` 只对当前组件生效，不向后代继承。`<script setup>` 项目不应为了
“显式注册”再重复写 Options API 配置，因为导入绑定本身就是模板可见的局部组件引用。

### 名称与解析规则

SFC 中推荐：

- 文件名使用 `IndependentCounter.vue`。
- 导入变量使用 `IndependentCounter`。
- 模板标签使用 `<IndependentCounter />`。

运行时注册表查询会尝试 `name`、`camelize(name)` 和 `capitalize(camelize(name))`，因此
`foo-bar` 可以命中 `FooBar`。这是一项兼容能力，不代表项目应混用多种命名风格。

如果普通组件标签既不是 setup 绑定，也未在局部或全局注册表找到，`resolveComponent()` 在开发
环境发出 `Failed to resolve component`，然后返回原字符串。页面可能留下一个未知标签，而不是
可靠地“什么都不渲染”；排查时应先核对导入、拼写和组件可见范围。

### 父子组件的最小心智模型

父组件通过模板决定“在哪里使用哪个子组件”；子组件管理自己的内部视图与实例状态。父模板不能
因为形成了包含关系就直接读取子组件 `<script setup>` 的局部变量，子组件也不会自动继承父组件
作用域里的组件注册。

真实应用还需要稳定的父子接口：父到子输入由下一课 Props 负责，子到父意图由再下一课 Emits
负责。Slots、组件 `v-model`、Attrs 与 Provide/Inject 各有独立课程，本课不把这些机制压缩成
一句“组件可以互相传数据”。

### 多根组件与 DOM 内模板

Vue 3 运行时以 Fragment 表达多个根节点，固定标签测试确认组件可返回多个根节点。多根不是必须
使用的风格；一个语义完整的 `<article>` 仍应保留为单根。

DOM 内模板则先经过浏览器 HTML 解析。`runtime-dom` 在根组件没有 template 时读取挂载容器的
`innerHTML`，此时 Vue 获得的是浏览器修正后的字符串：大小写已经折叠，自闭合自定义标签可能已
吞入后续节点，非法的 table 子节点可能被移出原位置。

```html
<!-- DOM 内模板：正确 -->
<independent-counter></independent-counter>

<table>
  <tbody>
    <tr is="vue:result-row"></tr>
  </tbody>
</table>
```

`vue:` 前缀只是在原生元素 `is` attribute 上告诉 Vue 将其解析为组件，同时避免和浏览器原生
customized built-in element 混淆。它不是本课动态组件教学入口。

## Vue 3.5.40 源码与测试推导

### 1. SFC 导入组件优先成为 setup 绑定

`packages/compiler-sfc/src/compileScript.ts` 分析非类型导入：`.vue` 默认导入被标成
`SETUP_CONST`，模板编译选项会收到完整 binding metadata。非内联模式还只把模板实际使用到的
导入暴露给渲染上下文。

`packages/compiler-core/src/transforms/transformElement.ts` 的组件类型解析先检查 setup 引用，
同时尝试原名、camelCase 和 PascalCase。命中后直接使用 `$setup[...]` 或内联变量；官方测试明确
断言这条路径不引入 `RESOLVE_COMPONENT` helper。

**教学推导：** 在 `<script setup>` 中，`import Child from './Child.vue'` 加 `<Child />` 已经形成
完整局部依赖，不存在还要执行一次“注册 API”的隐藏步骤。

### 2. 运行时解析顺序体现可见范围

`packages/runtime-core/src/helpers/resolveAssets.ts` 先匹配显式组件自身名称，再查当前组件的局部
注册表，最后查 `instance.appContext.components` 全局注册表。每个注册表都尝试原名、camelCase
和 PascalCase。

对应测试覆盖 `FooBar`、`Foo-bar`、`fooBar` 与 `foo-bar` 命中同一组件，也覆盖局部解析优先于
全局回退及自身名称解析。

**教学推导：** 全局注册不是跨应用或跨页面进程的全局变量；局部依赖也不会沿组件树自动下发。

### 3. 未解析组件会警告并回退为标签字符串

普通 `resolveComponent(name)` 找不到注册项时在开发环境发出警告，返回值最终退回 `name`。渲染器
随后可能把这个字符串当元素类型处理。官方测试覆盖缺失警告和原生标签回退。

**教学推导：** 组件“没有显示”不能只看 DOM 是否为空；console 中的解析警告、最终未知标签、
导入路径和当前 SFC 可见性共同构成最小诊断证据。

### 4. 每个组件 VNode 挂载时创建新实例

`packages/runtime-core/src/renderer.ts` 的组件挂载路径为每个待挂载组件 VNode 调用
`createComponentInstance()`，随后调用 `setupComponent()`。`packages/runtime-core/src/component.ts`
为新实例分配独立 uid、setup state、生命周期列表和 effect scope，并执行有状态组件的 setup。

**教学推导：** 两个 `<IndependentCounter />` 不是同一实例的两个入口。只要 `ref()` 在
`<script setup>` 实例路径中创建，两个计数互不影响；若把 ref 放到被双方导入的模块顶层，则共享
来自 ES 模块单例，而不是 Vue 破坏了实例隔离。

### 5. Vue 3 多根节点由 Fragment 支持

`packages/runtime-core/__tests__/rendererFragment.spec.ts` 的首个用例直接断言组件可以返回
`[h('div', 'one'), 'two']`，运行时用边界锚点管理这组根节点。Vue 3 官方迁移指南也把多根组件列为
正式能力。

**教学推导：** “组件必须恰好一个根元素”是 Vue 2 规则，不应带入 Vue 3.5.40。多根时 attributes
如何分配是另一个接口问题，不能为了避免提前讲 Attrs 而反过来声称多根无效。

### 6. DOM 内模板限制发生在 Vue 编译之前

`packages/runtime-dom/src/index.ts` 在根组件没有模板时读取容器 `innerHTML`。浏览器已先按 HTML
规则解析、纠正和序列化该 DOM，因此 Vue 无法恢复原来的 PascalCase、自闭合意图或非法 table
嵌套。

`packages/compiler-core/src/parser.ts` 与对应测试确认 `is="vue:foo"` 会把原生标签判定为组件；
`transformElement.ts` 再去掉 `vue:` 解析 `foo`。字符串模板解析测试则确认 Vue 自己的解析器支持
自闭合标签，证明这不是 SFC 的限制。

**教学推导：** 教材必须先问“模板字符串来自哪里”，再给命名和闭合规则，不能把浏览器 HTML
解析限制推广到所有 Vue 模板。

## 真实常见易错点

### 1. 只写组件标签，认为同目录文件会被自动发现

**原因：** 文件系统位置不会创建 setup 绑定或注册项。SFC 模板遇到大写标签时仍需要命中导入
绑定、局部注册或应用级注册。

**后果：** 开发环境出现 `Failed to resolve component`；页面可能留下未知标签，实际子组件逻辑
不会执行。

```vue
<!-- 错误：同目录存在 ResultSummary.vue 并不够 -->
<template>
  <ResultSummary />
</template>

<!-- 正确：在使用它的 SFC 中显式导入 -->
<script setup lang="ts">
import ResultSummary from './ResultSummary.vue'
</script>

<template>
  <ResultSummary />
</template>
```

**一手来源：** [Vue 局部注册](https://cn.vuejs.org/guide/components/registration.html#local-registration)、
[`transformElement.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/transformElement.ts)、
[`resolveAssets.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/resolveAssets.ts)。

### 2. 把实例状态提到共享模块，仍期待每次使用互不影响

**原因：** `<script setup>` 随每个实例执行，但 ES 模块顶层通常只初始化一次。两个实例导入同一个
模块级 ref 时，主动选择了共享状态。

**后果：** 点击第一个计数器，第二个也变化；学习者误以为 Vue 对同一组件只创建了一个实例。

```ts
// 错误方向：counter-state.ts 的模块单例被所有实例共享
import { ref } from 'vue'

export const count = ref(0)
```

```vue
<!-- 正确：IndependentCounter.vue 为每个实例创建自己的 ref -->
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
```

**一手来源：** [Vue 组件复用与独立实例](https://cn.vuejs.org/guide/essentials/component-basics.html#using-a-component)、
[Vue `<script setup>` 基本语法](https://cn.vuejs.org/api/sfc-script-setup.html#basic-syntax)、
[`component.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)。

### 3. 认为父组件的局部导入会自动传给所有后代

**原因：** 局部可见性属于当前组件模板，不是依赖注入。子组件编译自己的模板时没有父组件的
setup binding metadata。

**后果：** 父组件可以渲染 `StatusBadge`，孙组件中的同名标签却解析失败；依赖关系变得靠猜。

```vue
<!-- 错误认知：Parent.vue 的 import 不会让 Child.vue 自动认识 StatusBadge -->
<script setup lang="ts">
import StatusBadge from './StatusBadge.vue'
import Child from './Child.vue'
</script>

<template>
  <Child />
</template>
```

```vue
<!-- 正确：Child.vue 自己声明所使用的组件依赖 -->
<script setup lang="ts">
import StatusBadge from './StatusBadge.vue'
</script>

<template>
  <StatusBadge />
</template>
```

**一手来源：** [Vue 组件注册：局部注册不向后代传播](https://cn.vuejs.org/guide/components/registration.html#local-registration)、
[`compileScript.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/compileScript.ts)。

### 4. 为了省略 import，把所有组件都全局注册

**原因：** 全局注册看起来减少了模板附近的样板代码，却把真实依赖移动到应用入口，并让任意后代
都能使用该名称。

**后果：** 大项目难以从使用处定位实现；未使用组件可能无法 tree-shake；名称冲突和改名影响面
扩大。

```ts
// 错误方向：把只在一个页面使用的组件全部注册到应用
app.component('CheckoutSummary', CheckoutSummary)
app.component('CouponEditor', CouponEditor)
```

```vue
<!-- 正确：页面私有组件在使用处局部导入 -->
<script setup lang="ts">
import CheckoutSummary from './CheckoutSummary.vue'
import CouponEditor from './CouponEditor.vue'
</script>
```

真正应用级通用且团队已约定的基础组件可以全局注册，但必须是有意识的范围决策，不是默认手段。

**一手来源：** [Vue 组件注册：全局注册的缺点](https://cn.vuejs.org/guide/components/registration.html#local-registration)。

### 5. 用原生或含糊名称命名组件，误判模板到底渲染什么

**原因：** 组件标签和原生 HTML 标签共享模板语法。小写原生名会由平台判定为元素；PascalCase
则清楚表达组件变量，并能获得更好的 IDE 支持。

**后果：** 试图覆盖 `button`、`select` 等原生名字时，模板仍可能生成原生元素；阅读者也无法快速
区分 DOM 与组件边界。

```vue
<!-- 错误方向：名字不能表达这是业务组件，还与原生 button 混淆 -->
<button>保存</button>

<!-- 正确：组件名使用多个单词和 PascalCase -->
<PrimaryActionButton />
```

组件定义文件相应命名为 `PrimaryActionButton.vue`，不要依赖大小写兼容能力制造多套拼写。

**一手来源：** [Vue 组件名格式](https://cn.vuejs.org/guide/components/registration.html#component-name-casing)、
[`component.ts` 的名称校验](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)。

### 6. 把 SFC 的 PascalCase 和自闭合写法原样放进 DOM 内模板

**原因：** 浏览器在 Vue 读取模板前已把标签名转成小写；HTML 解析器也不把普通自定义标签的
`/>` 当作可靠结束标记。

**后果：** PascalCase 绑定无法按原意出现，后续兄弟节点可能被吞进未闭合的组件标签中，最终
DOM 层级错位。

```html
<!-- 错误：直接写在挂载容器中的模板 -->
<IndependentCounter />
<span>后续内容</span>

<!-- 正确：DOM 内模板使用 kebab-case 和显式结束标签 -->
<independent-counter></independent-counter>
<span>后续内容</span>
```

SFC 中继续使用 `<IndependentCounter />`，不要反向把 DOM 限制推广到 `.vue` 文件。

**一手来源：** [Vue DOM 内模板：大小写与闭合标签](https://cn.vuejs.org/guide/essentials/component-basics.html#in-dom-template-parsing-caveats)、
[`runtime-dom/src/index.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/index.ts)。

### 7. 在 DOM 内 `<table>` 中直接放自定义组件标签

**原因：** HTML 对 table、select、ul 等元素允许的子元素有内容模型限制。浏览器会在 Vue 接管前
移动或修正无效子节点。

**后果：** 组件最终不在预期父元素中，表格结构、样式和可访问语义都可能错误。

```html
<!-- 错误：浏览器不会把未知标签当作合法 table 行 -->
<table>
  <result-row></result-row>
</table>

<!-- 正确：保留合法原生结构，并用 vue: 前缀指定组件 -->
<table>
  <tbody>
    <tr is="vue:result-row"></tr>
  </tbody>
</table>
```

**一手来源：** [Vue DOM 内模板：元素位置限制](https://cn.vuejs.org/guide/essentials/component-basics.html#element-placement-restrictions)、
[`parser.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/parser.ts)、
[`transformElement.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/transforms/transformElement.spec.ts)。

### 8. 沿用 Vue 2 的“组件必须单根”规则

**原因：** 旧教程和旧报错形成了惯性，但 Vue 3 已用 Fragment 正式支持多根组件。

**后果：** 为满足不存在的语法限制加入无语义 wrapper，可能干扰布局、选择器和可访问结构；反过来
也可能忽略多根组件没有唯一 attributes 落点的后续接口问题。

```vue
<!-- 错误动机：仅因为误以为 Vue 3 强制单根而包一层 -->
<template>
  <div>
    <header>标题</header>
    <main>正文</main>
  </div>
</template>

<!-- 正确：语义上是两个并列区域时可以使用多根 -->
<template>
  <header>标题</header>
  <main>正文</main>
</template>
```

若 wrapper 本身承担 `<article>`、布局或样式职责，应保留；错误的是把它说成 Vue 3 语法要求。

**一手来源：** [Vue 3 官方迁移指南：Fragments](https://v3-migration.vuejs.org/new/fragments)、
[`rendererFragment.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererFragment.spec.ts)。

## 源码推导的适用场景与高级提示

以下内容用于回答“什么时候这样拆”和“源码边界会怎样影响工程选择”，不要求初学者背内部函数。

### 1. 按状态所有权和变化原因划分组件

组件实例拥有独立 setup state，适合把只服务于某块 UI 的状态放回该组件。搜索条件、结果摘要、
结果项若由不同交互驱动，就比按文件行数平均切分更稳定。

**适用场景：** 页面中某一块可以独立命名、重复使用或单独测试，并且它的状态与更新原因能被清楚
描述。只有几行且不会独立变化的标记不必为了“组件化率”强行拆分。

### 2. 用重复实例承载互不影响的局部交互

渲染器对每个组件 VNode 创建实例，因此标签页摘要、小型计数器、可独立展开的帮助面板可以复用
同一定义并保留各自局部状态。

**适用场景：** 状态天然属于单个展示单元。若业务要求所有实例同步，则应显式设计共享状态，
而不是偶然依赖模块顶层 ref；共享状态管理不属于本课。

### 3. 把局部 import 当成可阅读的依赖图

setup 绑定会直接进入模板编译结果，父文件顶部的 import 就是该组件实际依赖。代码评审、重命名、
IDE 跳转和 tree-shaking 都能利用这条静态关系。

**适用场景：** 页面级、功能级和只在少数位置使用的组件。不要为了省一行 import 换取隐式全局
耦合。

### 4. 只为真正应用级词汇使用全局注册

应用上下文隔离全局注册，适合团队明确约定、在大量页面都使用的基础视觉组件。即便如此，也要
考虑自动导入工具、组件库入口和 bundle 策略是否属于另一个工程化任务。

**适用场景：** 例如整个应用统一的 `AppIcon`，且其名称和实现是稳定公共契约。一次性业务卡片不
符合这个条件。

### 5. 用 Fragment 保留正确文档语义

多根能力适合组件天然输出多个并列区域，不必为 Vue 添加无意义节点。例如页面片段需要同时提供
相邻的 header 与 main。若组件本身是一个 article、form 或 navigation，语义根元素仍有价值。

**适用场景：** wrapper 只用于满足旧 Vue 2 限制时可以删除；wrapper 承担 landmark、样式或布局
时保留。父级 attributes 的明确落点留到 Attrs 课程设计。

### 6. 服务端模板集成先识别模板来源

服务端框架可能把 Vue 根模板直接输出进挂载容器，此时必须采用 DOM 内模板规则。若服务端只是
加载已编译的 SFC 应用，则组件模板仍由 Vue 工具链处理。

**适用场景：** 无构建步骤渐进增强或服务器渲染出根容器内部模板。任何不可信字符串都不得混入
可执行 Vue 模板；`runtime-dom` 源码明确把 DOM template 标为潜在不安全输入边界。

### 7. 名称兼容用于跨模板来源，不用于放松代码规范

运行时的 camelize/PascalCase 回退让同一个 `MyComponent` 注册既能服务 SFC 的
`<MyComponent />`，也能服务 DOM 内模板的 `<my-component></my-component>`。

**适用场景：** 同一组件定义确实面对不同模板来源。项目自身的 SFC 仍统一 PascalCase，避免把
兼容分支当作多种命名风格都同等推荐。

## 单一同源 Demo 冻结

### 名称与目标

唯一公开 Demo 命名为“独立组件实例实验”，建议资产 ID：

`vue.core.learn.basics.component-basics.independent-instances-demo`

它只回答一个问题：父组件局部导入同一个 `IndependentCounter` 定义并静态使用两次后，为什么
点击一个实例不会改变另一个实例。

### 文件结构与同源约束

```text
src/content/demos/vue/core/learn/basics/component-basics/
├─ independent-instances-demo.vue
└─ parts/
   └─ IndependentCounter.vue
```

- `independent-instances-demo.vue` 是唯一公开 Demo ID、运行入口和源码面板的 raw source 来源。
- 父文件只做静态 `import IndependentCounter`，在两个有独立标题的区域各使用一次。
- `IndependentCounter.vue` 在自己的 `<script setup>` 中创建 `ref(0)`，提供一个增加按钮和当前值。
- 不把相同 Demo 实现复制进课程 entry 的 code block；正文使用不同名称的最小教学片段。
- 当前 Demo registry 的单文件源码接口不为此扩展成多文件 viewer。子文件是实际运行依赖，不再
  创建第二个 Demo ID，也不为了展示源码复制到父文件。

### 冻结状态与交互

- 两个实例初始值均为 `0`。
- 在“实例 A”区域点击两次，只显示 A 为 `2`，B 仍为 `0`。
- 再在“实例 B”区域点击一次，A 保持 `2`，B 变为 `1`。
- 每个按钮只修改当前实例 setup 中的 ref；不使用共享 store、模块级 ref、模板引用或父级重置。
- 页面同时显示父组件文件名、子组件文件名和两个实例标题，但不放教学说明卡片或功能说明文案。

Demo 不使用 Props、Emits、Slots、组件 `v-model`、Attrs、Provide/Inject、动态组件、KeepAlive、
异步组件或远程请求。它不把两个子组件写成两份定义，也不加入与学习目标无关的主题切换、删除、
排序或持久化。

### 390px 与可访问性验收

- 390px 下两个实例区域严格纵向排列；使用 flex 与相邻 margin，不使用 CSS Grid 或 `gap`。
- 根容器、两个实例区域和按钮宽度不超过可视区域，长文件名可换行，不产生横向滚动。
- 两个实例区域分别由可见标题命名；E2E 在各自区域内定位按钮，避免只靠视觉位置区分。
- 按钮使用原生 `<button type="button">`，可用键盘触发，触控高度至少 44px，并有清楚的可见名称。
- 每个当前值使用 `<output>` 或普通文本；更新可用局部 `aria-live="polite"`，不能让一次点击重复
  播报整页状态。
- 独立性不能只靠颜色表达；同时显示“实例 A：2”“实例 B：0”之类文本状态。
- 200% 文本缩放和 390px 宽度下标题、数值、按钮不重叠或被截断。
- 课程 DemoBox 中 `.missing` 数量为 0，源码入口可读取父 Demo 文件。

## prerequisites / related ID 本地核对

以下 ID 已通过当前本地 entry 与 catalog 精确核对。planned 课程没有正文，不作为本课可导航
related。

### prerequisites

- `vue.core.learn.basics.form-bindings`：唯一前置。它是冻结 track 中紧邻本课的上一项，并已存在
  available entry。此前 SFC、模板、响应式、列表、事件等能力已经由线性顺序覆盖，不重复堆叠为
  直接 prerequisite。

### related

- `vue.core.learn.basics.sfc-basics`：回看 SFC 文件、`<script setup>` 与组件模块基础。
- `vue.core.reference.application.define-component`：进一步区分组件定义、类型辅助、注册和挂载。
- `vue.core.reference.components.props`：下一课父到子输入的现有参考页；本课不使用其宏。
- `vue.core.reference.components.emits`：再下一课子到父意图的现有参考页；本课不发自定义事件。

`vue.core.learn.basics.props` 与 `vue.core.learn.basics.emits` 当前仍是 planned，不能提前写进 related
假装可导航。`vue.core.learn.intermediate.dynamic-components-keep-alive` 也仍是 planned，只在课程
收束中作为后续路线提示，不进入本批 related。

Slots、Attrs、组件 v-model、Provide/Inject、异步组件和 KeepAlive 虽已有部分 reference entry，
但与本课的最小目标距离更远，不扩张 related 列表。

## 实施文件建议

后续实现应限定为：

- `src/content/entries/learn/vue/core/basics/component-basics.ts`
- `src/content/demos/vue/core/learn/basics/component-basics/independent-instances-demo.vue`
- `src/content/demos/vue/core/learn/basics/component-basics/parts/IndependentCounter.vue`
- `src/content/catalog/manifests/vue-core-track.ts`
- `src/content/catalog/vue-core-track.spec.ts`
- `src/content/interactive/registry.spec.ts`
- `tests/e2e/progress.spec.ts`
- `docs/重构实施计划.md`

不需要修改 schema、Demo registry 实现、旧 component registry、参考 manifest 或全局样式。约定目录
glob 会自动发现唯一父 Demo；`parts/` 的子组件不会成为新的公开 Demo ID。

实现时只把 `component-basics` 从 planned 改为 available，保持它位于 form-bindings 之后、Props
之前。计数应同步更新为：

- Vue Core：从 `8 available / 23 planned` 变为 `9 available / 22 planned`，总数仍为 31。
- 当前冻结的 Vue 三条路线合计：从 `8 available / 52 planned` 变为
  `9 available / 51 planned`，总数仍为 60。
- Gate 6 仍未关闭，不能把第七批单课闭环写成整体 Vue 课程覆盖完成。

## 最小测试与 E2E 验收

### 定向单元验证

- `vue-core-track.spec.ts`：基础阶段顺序在 form-bindings 后新增 component-basics，available 总数为
  9；本课唯一 prerequisite 必须指向更早且已存在的 form-bindings。
- `registry.spec.ts`：基础课程 Demo ID 数组只新增
  `vue.core.learn.basics.component-basics.independent-instances-demo`，并断言可解析。
- 不为静态正文、组件标签拼写或 `ref` 基础行为创建重复单元测试；现有 schema、catalog 与 Vue
  自身能力已覆盖这些机制。

### 现有 390px E2E 路径扩展

在当前 progress 流程的表单课程末尾继续执行：

1. 点击“下一篇：组件基础”，断言 URL、课程标题和 Demo 均可见。
2. 在实例 A 区域点击两次，断言 A 为 2、B 仍为 0。
3. 在实例 B 区域点击一次，断言 A 保持 2、B 为 1。
4. 通过键盘聚焦并触发至少一个实例按钮，确认使用原生可操作控件。
5. 断言 `.demo-box .missing` 为 0，唯一 Demo ID 已成功解析。
6. 断言 `document.documentElement.scrollWidth <= window.innerWidth`。

这些行为已经覆盖“同一定义、两个实例、状态独立”的主命题。不为每个命名变体、Options API
注册形式或 DOM 内模板限制创建浏览器用例；它们由官方固定版本测试和课程静态示例支撑。

### 实施后的命令验收

- `npm run type-check`
- `npm run lint`
- `npm run format:check`
- `npm run test:unit -- src/content/catalog/vue-core-track.spec.ts src/content/interactive/registry.spec.ts`
- 定向运行包含课程链的 `tests/e2e/progress.spec.ts`

## 固定来源清单

### Vue 官方文档

- [Vue 中文官网：组件基础](https://cn.vuejs.org/guide/essentials/component-basics.html)
- [Vue 英文官网：Components Basics](https://vuejs.org/guide/essentials/component-basics.html)
- [Vue 中文官网：组件注册](https://cn.vuejs.org/guide/components/registration.html)
- [Vue 英文官网：Component Registration](https://vuejs.org/guide/components/registration.html)
- [Vue 中文官网：`<script setup>`](https://cn.vuejs.org/api/sfc-script-setup.html)
- [Vue 英文官网：`<script setup>`](https://vuejs.org/api/sfc-script-setup.html)
- [Vue 中文官网：创建一个 Vue 应用](https://cn.vuejs.org/guide/essentials/application.html)
- [Vue 3 官方迁移指南：Fragments](https://v3-migration.vuejs.org/new/fragments)
- [Vue 无障碍访问最佳实践](https://cn.vuejs.org/guide/best-practices/accessibility.html)

### vuejs/core v3.5.40

- [`packages/vue/package.json` 版本锚](https://github.com/vuejs/core/blob/v3.5.40/packages/vue/package.json)
- [`compiler-sfc/src/compileScript.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/src/compileScript.ts)
- [`compiler-sfc compileScript.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/__tests__/compileScript.spec.ts)
- [`compiler-sfc importUsageCheck.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/__tests__/compileScript/importUsageCheck.spec.ts)
- [`compiler-core/src/transforms/transformElement.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/transformElement.ts)
- [`compiler-core transformElement.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/transforms/transformElement.spec.ts)
- [`compiler-core/src/parser.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/parser.ts)
- [`compiler-core parse.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/parse.spec.ts)
- [`runtime-core/src/helpers/resolveAssets.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/resolveAssets.ts)
- [`runtime-core resolveAssets.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/resolveAssets.spec.ts)
- [`runtime-core/src/component.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)
- [`runtime-core/src/renderer.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts)
- [`runtime-core rendererFragment.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererFragment.spec.ts)
- [`runtime-dom/src/index.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/index.ts)

## 实施验收清单

- 课程 meta ID 精确为 `vue.core.learn.basics.component-basics`，唯一 prerequisite 是
  `vue.core.learn.basics.form-bindings`。
- 正文先讲职责拆分、静态导入和实例独立，再讲注册、命名、多根与 DOM 内模板限制。
- 明确组件定义、组件实例、组件树与 DOM 树不是同一个概念。
- `<script setup>` 导入组件后不再重复写 `components`；Options API 只作形式对照。
- 局部注册不向后代传播；全局注册限定在单个应用上下文，并说明 tree-shaking 与可维护性取舍。
- SFC 统一 PascalCase；DOM 内模板使用 kebab-case、显式结束标签与合法元素位置。
- 明确 Vue 3 支持多根组件，不把单根写成语法要求；Attrs 行为只作后续边界。
- Demo 只有一个公开 ID，同一 `IndependentCounter` 定义静态使用两次，交互能证明状态独立。
- Demo 和正文不使用 `<component :is>`，动态组件与 KeepAlive 留在独立中级课程。
- Props、Emits、Slots、组件 v-model、Attrs、Provide/Inject、异步组件均不进入 Demo 实现。
- 390px 严格单列，无 CSS Grid、无 `gap`、无横向溢出；按钮和状态具有可访问名称与文本反馈。
- 后续实现的每个方法定义上方添加规范中文注释，只增加最少的 track、registry 与现有 E2E 断言。
- 计划计数更新为 Vue Core `9 / 22`、全部冻结 Vue 路线 `9 / 51`，同时保留 Gate 6 未关闭。

## 结论

本课最重要的心智模型是：组件定义是一份可复用蓝图，父组件通过静态导入和模板标签组合它；每次
使用都会创建新的组件实例，实例拥有自己的 setup 状态并渲染 DOM。局部依赖应写在使用处，全局
注册只属于当前应用上下文，也不应成为省略 import 的默认工具。

Vue 3.5.40 的 SFC 编译、模板组件解析、运行时注册回退、实例创建与 Fragment 测试共同支撑这条
主线。DOM 内模板的限制来自浏览器先行解析，必须与 SFC 规则分开讲。按“独立组件实例实验”冻结
Demo，可以让新手直接观察定义复用与状态隔离，同时把 Props、Emits、动态组件和 KeepAlive 留给
后续课程，避免在组件第一课一次引入多个接口与生命周期问题。
