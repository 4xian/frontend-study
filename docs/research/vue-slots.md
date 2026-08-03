# Vue Core 中级课程：插槽调研

> 核验日期：2026-07-31
>
> 适用版本：Vue 3.5.40。
>
> 资料范围：Vue 官方中文文档，以及 `vuejs/core` 的 `v3.5.40` 固定标签源码与
> 同标签官方测试。外部资料通过 Tavily Search / Extract 定位和提取；本文不采用博客、
> 问答、第三方教程、`main` 分支或浮动版本链接作为事实来源。

## 课程定位与边界

本课目标 ID 冻结为 `vue.core.learn.intermediate.slots`，位于
`vue.core.learn.intermediate.template-refs` 之后，是“组件内容与双向绑定”分类的第一课。
学习者已经掌握组件基础与 Props，并刚完成模板引用；因此唯一直接 prerequisite 冻结为：

`vue.core.learn.intermediate.template-refs`

本课只回答一个主问题：**父组件怎样提供模板片段，子组件怎样决定这些片段的出口、可见数据和
允许执行的命令，同时保持父、子渲染作用域与状态所有权清楚。** 主线限定为 SFC、
`<script setup lang="ts">`、Composition API 与 Vue 3.5.40，覆盖：

- 插槽内容与 `<slot>` 出口的父子职责。
- 父级渲染作用域，以及子状态必须通过 slot props 显式提供的规则。
- 默认插槽、后备内容、具名插槽与隐式 `default`。
- `v-slot`、`#name`、动态插槽名与动态参数语法限制。
- 作用域插槽、解构 slot props，以及“只读状态 + 窄命令”的 API 设计。
- 使用 `$slots` 和 `v-if` 创建条件插槽包装。
- `$slots`、`useSlots()` 与 `defineSlots()` 的职责和 TypeScript 边界。
- Vue 3.5.40 对插槽函数的归一化、渲染、fallback 判定和更新策略。
- compiler-core 对静态、动态、条件、循环和错误插槽声明的转换。

以下内容明确排除，不进入正文练习或 Demo：

- Attributes 透传。
- 组件 `v-model`。
- Provide / Inject。
- 动态组件、异步组件与 `KeepAlive`。
- `Teleport`、`Suspense` 和 Transition。
- SSR 架构、hydration 或服务端插槽实现。
- 渲染函数教程、JSX 教程或手写 VNode 课程。
- Web Components 原生 `<slot>` 的 shadow DOM 语义。
- slot forwarding、无头组件库、表格引擎或表单框架的完整设计。
- 用 slot props 传递整个可写 store、可变领域对象或子组件内部 ref。

课程语义以 2026-07-31 核验的 Vue 3 中文插槽指南、内置指令、特殊元素、组件实例、
Composition API 辅助函数和 `<script setup>` API 为准。插槽函数归一化、fallback 有效内容、
fallback key、动态插槽标记和编译错误，以 `vuejs/core@v3.5.40` 为固定证据。

**课程依据：** [Vue 插槽指南](https://cn.vuejs.org/guide/components/slots.html)、
[`v-slot` 指令](https://cn.vuejs.org/api/built-in-directives.html#v-slot)、
[`<slot>` 特殊元素](https://cn.vuejs.org/api/built-in-special-elements.html#slot)、
[`defineSlots()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineslots)。

## 学习目标

完成本课后，学习者应能：

1. 解释插槽内容由父组件定义、由子组件出口调用，且表达式仍属于父级渲染作用域。
2. 使用默认插槽和 fallback，并说明父级内容何时替代后备内容。
3. 用 `<template #header>` 等具名插槽把不同片段发送到对应出口。
4. 在同时使用默认作用域插槽与具名插槽时显式书写 `<template #default>`。
5. 用 `<slot :state="state" :command="command">` 提供作用域插槽契约。
6. 只暴露值类型状态与窄命令，不把子组件可写对象交给父级插槽内容。
7. 使用 `$slots.name` 决定是否渲染插槽外围结构，并理解它只检查插槽函数是否存在。
8. 正确书写动态插槽名，并遵守动态指令参数的字符串和语法限制。
9. 在 TypeScript SFC 中使用 `defineSlots()` 描述插槽名称与 slot props。
10. 区分模板 `$slots`、运行时 `useSlots()` 与类型宏 `defineSlots()` 的适用场景。

## 建议教学顺序

### 1. 先建立“内容所有者”和“出口所有者”

不要从 `useSlots()` 或内部源码开始。先用最小父子 SFC 说明：父组件拥有内容，子组件拥有出口。

```vue
<!-- FancyButton.vue -->
<template>
  <button type="button" class="fancy-button">
    <slot />
  </button>
</template>

<!-- ParentView.vue -->
<template>
  <FancyButton>保存草稿</FancyButton>
</template>
```

`保存草稿` 写在父组件模板中，由父组件编译；`<slot>` 写在子组件模板中，决定内容最终放入
按钮内部。插槽不是“把父 DOM 节点搬进子组件”，而是父组件提供一段可由子组件在渲染期调用的
模板内容。

**官方事实：** [插槽内容与出口](https://cn.vuejs.org/guide/components/slots.html#slot-content-and-outlet)。

### 2. 紧接着冻结父级渲染作用域

插槽内容能直接读取父组件变量，因为它定义在父组件模板中；它不能因为最终渲染在子组件内部，
就自动读取子组件局部变量。这与 JavaScript 词法作用域一致。

```vue
<script setup lang="ts">
const parentLabel = '来自父组件'
</script>

<template>
  <LearningPanel>
    <p>{{ parentLabel }}</p>
  </LearningPanel>
</template>
```

若 `LearningPanel` 内部还有 `activeTopic`，上面的父模板不能直接使用它。子组件必须把允许读取的
值作为 slot props 传出。

**官方事实：** [渲染作用域](https://cn.vuejs.org/guide/components/slots.html#render-scope)。

### 3. 再教默认插槽和 fallback

未命名的 `<slot>` 隐式名为 `default`。写在出口标签内部的是后备内容；父组件没有提供可用的
默认插槽内容时，才渲染后备内容。

```vue
<!-- SubmitButton.vue -->
<template>
  <button type="submit">
    <slot>提交</slot>
  </button>
</template>
```

`<SubmitButton />` 显示“提交”；`<SubmitButton>保存</SubmitButton>` 显示“保存”。fallback 属于
子组件，因此 fallback 中的表达式只能访问子组件作用域。

**官方事实：** [默认内容](https://cn.vuejs.org/guide/components/slots.html#fallback-content)。

### 4. 用多个出口引入具名插槽

`<slot name="header">` 声明名为 `header` 的出口；父组件用 `<template #header>` 提供内容。
未写 `name` 的出口仍是 `default`。

```vue
<BaseLayout>
  <template #header>
    <h2>课程标题</h2>
  </template>

  <p>默认正文</p>

  <template #footer>
    <small>课程状态</small>
  </template>
</BaseLayout>
```

`#header` 是 `v-slot:header` 的缩写。`#` 缩写必须带参数；默认插槽应写 `#default`，不能写
`#="{ value }"`。

**官方事实：** [具名插槽](https://cn.vuejs.org/guide/components/slots.html#named-slots)、
[`v-slot` 指令](https://cn.vuejs.org/api/built-in-directives.html#v-slot)。

### 5. 由“看不到子状态”过渡到作用域插槽

子组件在 `<slot>` 出口上绑定的额外 attributes 会成为 slot props。父组件通过 `v-slot` 或
`#name="slotProps"` 接收这些参数。

```vue
<!-- LearningPanel.vue -->
<slot :active-topic="activeTopic" :select-topic="selectTopic" />

<!-- ParentView.vue -->
<LearningPanel v-slot="{ activeTopic, selectTopic }">
  <p>当前主题：{{ activeTopic }}</p>
  <button type="button" @click="selectTopic('source')">查看源码</button>
</LearningPanel>
```

这里父组件仍没有直接取得子组件内部 ref。它收到的是当前值与一个明确命令。命令参数和值域应在
TypeScript 中收窄，避免把“作用域插槽”误解成对子组件全部状态的后门。

**官方事实：** [作用域插槽](https://cn.vuejs.org/guide/components/slots.html#scoped-slots)。

### 6. 冻结默认作用域插槽与具名插槽的组合语法

组件级 `v-slot` 只适合单个默认作用域插槽。只要同一组件还提供具名插槽，默认插槽也必须放在
显式 `<template #default>` 中。

```vue
<LearningPanel>
  <template #default="{ activeTopic }">
    <p>当前主题：{{ activeTopic }}</p>
  </template>

  <template #actions="{ reset }">
    <button type="button" @click="reset">重置</button>
  </template>
</LearningPanel>
```

显式边界让 `activeTopic` 只存在于默认插槽片段，`reset` 只存在于 `actions` 片段。把
`v-slot="{ activeTopic }"` 直接写在 `LearningPanel` 上再嵌套 `#actions` 会编译失败。

**官方事实：** [具名作用域插槽](https://cn.vuejs.org/guide/components/slots.html#named-scoped-slots)。

### 7. 最后加入条件和动态插槽

子组件若只想在父级提供某个插槽时创建标题或操作区包装，可直接在模板中检查 `$slots`：

```vue
<header v-if="$slots.header">
  <slot name="header" />
</header>
```

动态名称写作 `#[activeSlotName]`。动态参数值应为字符串或 `null`，复杂表达式应先放入计算属性；
空格和引号等不合法 attribute 名字符号不能直接写进动态参数表达式。

```vue
<BaseLayout>
  <template #[activeSlotName]>
    动态目标内容
  </template>
</BaseLayout>
```

**官方事实：** [条件插槽](https://cn.vuejs.org/guide/components/slots.html#conditional-slots)、
[动态插槽名](https://cn.vuejs.org/guide/components/slots.html#dynamic-slot-names)、
[动态参数限制](https://cn.vuejs.org/guide/essentials/template-syntax.html#dynamic-argument-syntax-constraints)。

## 最小核心知识

### 插槽是父级提供的渲染函数契约

公开 API 将每个插槽表示为可调用函数，参数是 slot props，结果是 VNode 数组：

```ts
type Slot = (...args: any[]) => VNode[]
```

模板使用者通常不需要手写这个函数；编译器会把父组件的插槽模板转换为函数，子组件的 `<slot>`
出口转换为 `renderSlot()` 调用。这个模型能统一解释渲染作用域、slot props、fallback 和为什么
插槽函数必须在渲染期间调用。

**证据：** [`$slots`](https://cn.vuejs.org/api/component-instance.html#slots)、
[`componentSlots.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentSlots.ts)。

### default 只是一个保留的隐式名称

没有 `name` 的 `<slot>` 等价于 `name="default"`。父组件中不位于具名 `<template>` 内的顶层内容，
会进入默认插槽。具名插槽不是事件，也不是 prop 名；它是 slots 对象上的函数 key。

**证据：** [具名插槽](https://cn.vuejs.org/guide/components/slots.html#named-slots)、
[`$slots`](https://cn.vuejs.org/api/component-instance.html#slots)。

### slot outlet 的 name 不属于 slot props

`<slot name="header" message="hello">` 中，`name` 只选择目标插槽；它是 Vue 保留 attribute，
不会出现在父组件收到的参数中。父级 `headerProps` 只有 `{ message: 'hello' }`。

**证据：** [`<slot>` 特殊元素](https://cn.vuejs.org/api/built-in-special-elements.html#slot)、
[`transformSlotOutlet.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/transforms/transformSlotOutlet.spec.ts)。

### slot props 是能力参数，不是新的双向绑定

作用域插槽允许子组件在调用插槽时传参，但不会改变父级模板的所有权。为保持单向状态所有权，
子组件应传值类型快照或显式只读视图，并配套少量命令：

```ts
type TopicId = 'template' | 'source'

type DefaultSlotProps = {
  readonly activeTopic: TopicId
  readonly activeTopicLabel: string
  readonly selectTopic: (topic: TopicId) => void
}
```

TypeScript 的 `readonly` 只约束类型层面的属性赋值；若传出可变对象、数组或 ref，父级代码仍可能
通过嵌套引用改变内部数据。Demo 因此只传字符串、布尔值与收窄命令。

**依据：** [作用域插槽](https://cn.vuejs.org/guide/components/slots.html#scoped-slots)、
[`defineSlots()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineslots)。

### 条件插槽检查的是函数是否存在

模板中的 `$slots.header` 对应名为 `header` 的插槽函数。`v-if="$slots.header"` 适合决定是否渲染
外围 `<header>`。它不是“最终有几个 DOM 节点”的计数，也不承诺调用函数后一定得到用户可见文本。

**证据：** [条件插槽](https://cn.vuejs.org/guide/components/slots.html#conditional-slots)、
[`$slots`](https://cn.vuejs.org/api/component-instance.html#slots)。

### fallback 由出口渲染时决定

fallback 写在子组件 `<slot>` 内，只有目标插槽没有产生有效 VNode 内容时才使用。Vue 3.5.40
运行时会忽略纯注释和只包含无效片段的结果，再决定是否调用 fallback 函数。`$slots.name` 的存在
判断与“最终是否采用 fallback”不是同一个判定。

**源码与测试：**
[`renderSlot.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/renderSlot.ts)、
[`renderSlot.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/renderSlot.spec.ts)。

### useSlots 是运行时入口

`useSlots()` 从当前 setup context 返回 slots 对象。已提供的属性是接收参数并返回 VNode 数组的
函数；读取未提供的名称会得到 `undefined`：

```ts
/** 返回当前组件 setup context 中的插槽函数对象。 */
function useSlots(): Record<string, ((...args: any[]) => VNode[]) | undefined>
```

模板中做存在性判断或渲染出口时直接使用 `$slots` 与 `<slot>` 更清楚。只有脚本确实需要读取插槽
结构时才使用 `useSlots()`；不能在 setup 中提前执行插槽函数并缓存 VNode 结果。

**证据：** [`useSlots()`](https://cn.vuejs.org/api/composition-api-helpers.html#useslots)、
[`<script setup>` 中的 useSlots](https://cn.vuejs.org/api/sfc-script-setup.html#useslots-useattrs)。

### defineSlots 是 TypeScript 编译器宏

`defineSlots()` 自 Vue 3.3 起可用，只接受类型参数，不接受运行时参数。类型字面量的 key 是插槽名，
值是插槽函数；函数第一个参数描述 slot props。当前函数返回类型会被忽略，不能验证父级实际
渲染内容。

```ts
const slots = defineSlots<{
  header(): any
  default(props: DefaultSlotProps): any
  actions(props: {
    readonly detailsVisible: boolean
    readonly toggleDetails: () => void
  }): any
  support?(): any
}>()
```

宏返回的 `slots` 对象等价于 setup context / `useSlots()` 的 slots 对象。TypeScript 项目优先用
`defineSlots()` 获得插槽名和参数提示，但它不是 runtime schema 或必填校验器。

**证据：** [`defineSlots()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineslots)、
[`useSlots()`](https://cn.vuejs.org/api/composition-api-helpers.html#useslots)。

## Vue 3.5.40 源码与官方测试推导

以下每点先写固定版本事实，再给课程推导。课程推导用于建立实现判断，不扩写成新的 Vue 公共
API 承诺。

### 1. 实例插槽统一为返回 VNode 数组的函数

**官方事实：** `componentSlots.ts` 的 `normalizeSlotValue()` 把单个值包装为数组、把数组逐项
`normalizeVNode()`；对象插槽中的函数由 `normalizeSlot()` 包装。非函数插槽值仍会被兼容包装，
但开发环境发出“Prefer function slots for better performance”警告。官方测试覆盖函数、字符串、
数组和默认非函数子节点的归一化。

**课程推导：** 模板学习者应把插槽理解为延迟执行的函数契约，而不是静态字符串容器。课程只
解释这个心智模型，不扩展为手写渲染函数教程。

**证据：**
[`componentSlots.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentSlots.ts)、
[`componentSlots.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentSlots.spec.ts)。

### 2. 插槽函数必须在渲染期调用才能追踪依赖

**官方事实：** 归一化后的插槽函数记录创建上下文。开发模式发现调用发生在组件 render 之外时，
会警告其中使用的响应式依赖无法被正确追踪，并要求在 render 内调用。

**课程推导：** 不在 setup、普通事件或 `computed()` 初始化中执行 `slots.default?.()` 并缓存结果。
模板应继续使用 `<slot>`，脚本只在确实需要时检查函数是否存在。

**证据：**
[`componentSlots.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentSlots.ts)。

### 3. updateSlots 会保留容器并删除已消失的名称

**官方事实：** `initSlots()` 为实例创建内部 slots 对象；`updateSlots()` 根据编译器标志更新同一
对象，并在需要 deletion check 时删除新输入中已不存在的非内部 key。稳定编译插槽可以跳过不必要
的删除检查，动态插槽必须参与更新。

**课程推导：** 不要在 setup 中把 `Object.keys(slots)` 或 `Boolean(slots.footer)` 缓存成永久事实。
若组件需要根据插槽存在性渲染结构，让模板在每次渲染中读取 `$slots.footer`。

**证据：**
[`componentSlots.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentSlots.ts)、
[`componentSlots.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentSlots.spec.ts)。

### 4. renderSlot 按名称调用函数并惰性选择 fallback

**官方事实：** `renderSlot()` 取得 `slots[name]`，用 `props` 调用目标函数；没有有效结果时才调用
编译器提供的 fallback 函数。官方测试分别验证正常内容与 fallback 内容。

**课程推导：** fallback 留在子组件出口中，不在父级预先复制一份默认片段。父级只负责是否提供
插槽；子组件负责缺省体验和出口结构。

**证据：**
[`renderSlot.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/renderSlot.ts)、
[`renderSlot.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/renderSlot.spec.ts)。

### 5. 有效内容检查会穿过 Fragment 并忽略纯注释

**官方事实：** `ensureValidVNode()` 遍历插槽结果；Comment 不算有效内容，Fragment 会递归检查
children。官方测试验证全是注释、嵌套空 Fragment 等情况会采用 fallback。

**课程推导：** `$slots.name` 只能回答“父级是否提供了这个插槽函数”，不能回答“函数最终是否
产生用户可见内容”。业务上若必须区分“有数据 / 无数据”，应传显式状态，不依赖 VNode 空值细节。

**证据：**
[`renderSlot.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/renderSlot.ts)、
[`renderSlot.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/renderSlot.spec.ts)。

### 6. fallback 与真实内容使用不同 key

**官方事实：** `renderSlot()` 在没有有效内容且存在 fallback 时，为 Fragment key 追加 `_fb`。
官方测试传入 `key: 'foo'`，断言 fallback key 为 `foo_fb`；源码注释说明这是为了区分 fallback
内容与实际内容。

**课程推导：** 同一出口在 fallback 与父级内容之间切换时，运行时会把两条分支区分开。课程测试
只验证可见内容切换，不依赖或暴露 `_fb` 这个内部 key。

**证据：**
[`renderSlot.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/renderSlot.ts)、
[`renderSlot.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/renderSlot.spec.ts)。

### 7. 编译器把条件、循环和动态名称标为动态插槽

**官方事实：** `vSlot.ts` 的 `buildSlots()` 为编译插槽计算 `STABLE`、`DYNAMIC` 或 `FORWARDED`
标志。插槽位于 `v-if`、`v-for`、另一插槽作用域中，或使用动态名称 / 作用域变量时，会生成动态
插槽结构和 `DYNAMIC_SLOTS` patch flag。官方测试覆盖具名插槽的 `v-if`、`v-else-if`、`v-else`、
`v-for` 和动态参数。

**课程推导：** 可以用条件和动态名称表达真正变化的插槽结构，但不应为了“灵活”把固定出口都
改成动态名称。静态具名插槽更易读，也给编译器更稳定的更新信息。

**证据：**
[`vSlot.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/vSlot.ts)、
[`vSlot.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/transforms/vSlot.spec.ts)。

### 8. 编译器显式拒绝含糊或重复的插槽声明

**官方事实：** `vSlot.spec.ts` 覆盖组件级 `v-slot` 与模板级具名插槽混用、重复插槽名称、显式
具名 `default` 后仍存在额外默认 children，以及把 `v-slot` 用在普通元素等错误。slot outlet
转换测试还验证 `name` 从 slot props 中排除，动态 `:name` 编译为运行时名称表达式。

**课程推导：** 只要一个组件有多个插槽，就对每个作用域插槽使用独立 `<template #name>`；默认
作用域插槽显式写 `#default`。不要依赖编译器猜测哪一段内容属于哪个作用域。

**证据：**
[`vSlot.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/transforms/vSlot.spec.ts)、
[`transformSlotOutlet.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/transformSlotOutlet.ts)、
[`transformSlotOutlet.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/transforms/transformSlotOutlet.spec.ts)。

## 高质量常见易错点

### 1. 在父组件插槽内容中直接读取子组件状态

**错误假设：** 内容最终出现在子组件 DOM 内，所以能直接读取子组件的 `activeTopic`。

```vue
<LearningPanel>
  <p>{{ activeTopic }}</p>
</LearningPanel>
```

**后果：** `activeTopic` 仍按父组件作用域解析，类型检查报属性不存在，或运行时得到错误值。

```vue
<LearningPanel v-slot="{ activeTopic }">
  <p>{{ activeTopic }}</p>
</LearningPanel>
```

子组件只把允许读取的状态作为 slot prop 提供。

**证据：** [渲染作用域](https://cn.vuejs.org/guide/components/slots.html#render-scope)。

### 2. 在组件上声明默认 v-slot，同时嵌套具名插槽

**错误假设：** 组件级 `v-slot` 的变量会自然进入内部所有具名插槽。

```vue
<LearningPanel v-slot="{ activeTopic }">
  <p>{{ activeTopic }}</p>
  <template #actions>操作</template>
</LearningPanel>
```

**后果：** 默认 slot props 的作用域含糊，模板编译失败。

```vue
<LearningPanel>
  <template #default="{ activeTopic }">
    <p>{{ activeTopic }}</p>
  </template>
  <template #actions>操作</template>
</LearningPanel>
```

**证据：** [具名作用域插槽](https://cn.vuejs.org/guide/components/slots.html#named-scoped-slots)、
[`vSlot.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/transforms/vSlot.spec.ts)。

### 3. 把 # 当成无参数的 v-slot 缩写

**错误假设：** `#` 可以像无参数 `v-slot` 一样直接接收默认 slot props。

```vue
<LearningPanel #="{ activeTopic }">
  {{ activeTopic }}
</LearningPanel>
```

**后果：** `#` 后缺少插槽名，模板语法无效。

```vue
<LearningPanel #default="{ activeTopic }">
  {{ activeTopic }}
</LearningPanel>
```

动态名称使用 `#[activeSlotName]`，不能省略方括号，也不能在 attribute 名位置放空格或引号。

**证据：** [`v-slot` 指令](https://cn.vuejs.org/api/built-in-directives.html#v-slot)、
[动态参数语法限制](https://cn.vuejs.org/guide/essentials/template-syntax.html#dynamic-argument-syntax-constraints)。

### 4. 把 slot outlet 的 name 当成普通 slot prop

**错误假设：** `<slot name="header" message="hello" />` 会传出 `{ name, message }`。

```vue
<Panel>
  <template #header="{ name, message }">
    {{ name }}：{{ message }}
  </template>
</Panel>
```

**后果：** `name` 是选择出口的保留 attribute，不会出现在 slot props 中。

```vue
<Panel>
  <template #header="{ message }">
    {{ message }}
  </template>
</Panel>
```

**证据：** [`<slot>` 特殊元素](https://cn.vuejs.org/api/built-in-special-elements.html#slot)、
[`transformSlotOutlet.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/transforms/transformSlotOutlet.spec.ts)。

### 5. 把可写对象当成“只读 slot props”传出

**错误假设：** slot props 像组件 props 一样会自动阻止父级修改嵌套对象。

```vue
<slot :panel-state="panelState" />
```

父级若收到同一个可变对象，仍可能修改 `panelState.activeTopic`，绕过子组件规则。

```vue
<slot
  :active-topic="activeTopic"
  :details-visible="detailsVisible"
  :select-topic="selectTopic"
  :toggle-details="toggleDetails"
/>
```

**后果：** 状态所有权模糊，父级可以制造子组件未验证的组合状态。应传值类型状态与收窄命令；
TypeScript `readonly` 只是额外的类型提示，不是嵌套对象的运行时冻结。

**依据：** [作用域插槽](https://cn.vuejs.org/guide/components/slots.html#scoped-slots)、
[`defineSlots()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineslots)。

### 6. 把 $slots.name 存在等同于一定有可见内容

**错误假设：** `$slots.actions` 为真，就证明调用结果一定有按钮或文本。

```vue
<footer v-if="$slots.actions">
  <slot name="actions" />
</footer>
```

这段写法适合“父级是否提供了 actions 插槽”这一需求，但不能作为业务上的“操作数据非空”判断。
父级插槽函数可能因为内部条件只产生注释或空 Fragment。

```vue
<Panel :has-actions="actions.length > 0">
  <template v-if="actions.length > 0" #actions>...</template>
</Panel>
```

**后果：** 包装区可能存在却没有可见内容，或 fallback 与包装条件出现不同结果。真正的业务空状态
应使用显式数据；`$slots` 只负责插槽是否提供。

**证据：** [条件插槽](https://cn.vuejs.org/guide/components/slots.html#conditional-slots)、
[`renderSlot.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/renderSlot.spec.ts)。

### 7. 在 setup 中提前执行插槽函数并缓存结果

**错误假设：** `useSlots()` 返回的是普通内容工厂，setup 时调用一次即可永久复用。

```ts
const slots = useSlots()
const cachedContent = slots.default?.()
```

**后果：** 插槽读取的响应式依赖不在正确渲染上下文中追踪；开发环境可能警告，后续状态变化不会
按预期更新缓存结果。

```vue
<template>
  <slot />
</template>
```

脚本只做插槽存在性等确有必要的检查，不缓存函数执行结果。

**证据：** [`useSlots()`](https://cn.vuejs.org/api/composition-api-helpers.html#useslots)、
[`componentSlots.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentSlots.ts)。

### 8. 模板条件判断也绕到 useSlots 中实现

**错误假设：** `<script setup>` 中所有插槽操作都必须使用 `useSlots()`。

```ts
const slots = useSlots()
const hasHeader = Boolean(slots.header)
```

把一次 setup 快照用于长期结构判断，可能与后续插槽更新不一致。

```vue
<header v-if="$slots.header">
  <slot name="header" />
</header>
```

**后果：** 增加脚本状态与模板结构之间的同步负担。模板可直接使用 `$slots`；TypeScript 脚本需要
类型提示时优先 `defineSlots()`。

**证据：** [`<script setup>` 中的 useSlots](https://cn.vuejs.org/api/sfc-script-setup.html#useslots-useattrs)、
[`useSlots()`](https://cn.vuejs.org/api/composition-api-helpers.html#useslots)。

### 9. 把 defineSlots 当作运行时校验器

**错误假设：** 可以传运行时配置，并让 Vue 在浏览器中拒绝缺失或错误内容。

```ts
defineSlots({
  default: { required: true },
})
```

**后果：** 宏不接收运行时参数；类型声明也不会验证父级最终 VNode 内容。

```ts
defineSlots<{
  default(props: {
    readonly activeTopic: string
    readonly selectTopic: (topic: string) => void
  }): any
}>()
```

插槽函数返回类型在 Vue 3.5.40 中仍被忽略，不要把 `any` 误读为 runtime schema。

**证据：** [`defineSlots()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineslots)。

### 10. 重复名称或显式 default 后继续写额外默认内容

**错误假设：** 同名 `<template #header>` 会自动合并；显式 `#default` 外的顶层内容也会追加进去。

```vue
<Panel>
  <template #default>正文 A</template>
  正文 B
  <template #header>标题 A</template>
  <template #header>标题 B</template>
</Panel>
```

**后果：** 重复 slot name 或显式默认插槽之外的额外默认 children 触发编译错误。

```vue
<Panel>
  <template #default>
    <p>正文 A</p>
    <p>正文 B</p>
  </template>
  <template #header>
    <h2>标题 A</h2>
    <p>标题 B</p>
  </template>
</Panel>
```

**证据：**
[`vSlot.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/transforms/vSlot.spec.ts)。

## 单一同源 Demo 冻结

### 名称、ID 与主命题

唯一 Demo 命名为“学习面板插槽实验”，精确资产 ID：

`vue.core.learn.intermediate.slots.learning-panel-slots-demo`

它只验证一个主命题：**父组件拥有插槽内容和父级变量，子组件拥有出口与状态；子组件只通过
slot props 暴露值类型只读状态和窄命令，fallback 仍由子组件负责。**

### 文件结构与同源约束

```text
src/content/demos/vue/core/learn/intermediate/slots/
├─ learning-panel-slots-demo.vue
└─ parts/
   └─ LearningSlotPanel.vue
```

- `learning-panel-slots-demo.vue` 是唯一公开 Demo ID、运行入口和 raw source 面板来源。
- `LearningSlotPanel.vue` 是私有真实子 SFC，不注册第二个 Demo ID。
- 父文件不复制一个伪子组件，也不新增多文件源码查看器。
- registry 继续只发现目录根部的公开 Demo；`parts/` 保持私有。
- 实现不修改 registry 或 schema。

### 子组件插槽契约

`LearningSlotPanel.vue` 内部拥有：

- `activeTopic: 'template' | 'source'`，初始为 `template`。
- `activeTopicLabel`，初始显示“模板”。
- `detailsVisible = true`。
- `selectTopic(topic)`，只接受 `'template' | 'source'`。
- `toggleDetails()`，只切换详情可见状态。

所有示例命名函数上方必须有规范中文注释：

```ts
type TopicId = 'template' | 'source'

/** 选择当前学习主题。 */
function selectTopic(topic: TopicId) {
  activeTopic.value = topic
}

/** 切换学习详情的显示状态。 */
function toggleDetails() {
  detailsVisible.value = !detailsVisible.value
}
```

子组件用 `defineSlots()` 冻结四个出口：

- `header`：具名插槽，由父组件提供标题；不需要子状态。
- `default`：默认作用域插槽，提供 `activeTopic`、`activeTopicLabel`、`detailsVisible` 和
  `selectTopic()`。
- `actions`：具名作用域插槽，提供 `detailsVisible` 和 `toggleDetails()`。
- `support`：可选具名插槽；父组件故意不提供，用于显示子组件 fallback。

状态参数只传字符串和布尔值，不传内部 ref、reactive object 或数组。父组件改变子状态只能调用
`selectTopic()` 与 `toggleDetails()` 两个窄命令。

### 父组件内容契约

`learning-panel-slots-demo.vue` 保留父级状态：

- `parentNote = '父级备注：内容布局由父组件决定'`。
- `parentAudience = 'Vue 中级学习者'`。

父组件：

- 在 `#header` 中显示“插槽学习面板”和 `parentAudience`，证明具名插槽来自父级。
- 在显式 `#default` 中显示 `parentNote`，证明插槽内容可读取父级渲染作用域。
- 同一默认插槽解构子级 `activeTopicLabel` 与 `selectTopic()`，展示作用域插槽。
- 提供“选择模板”和“选择源码”按钮，只调用 `selectTopic()`。
- 在 `#actions` 中根据 `detailsVisible` 显示“收起详情 / 展开详情”，只调用
  `toggleDetails()`。
- 不提供 `#support`，让子组件显示“当前没有父级补充资料”的 fallback。

父组件不直接访问子组件实例，不读取或写入子组件 ref，不用 Props / Emits 模拟插槽状态，不用
Provide / Inject 或 store 建立旁路。

### E2E 可验证交互

1. 初始渲染只出现一个 Demo；标题区显示“插槽学习面板”和“Vue 中级学习者”。
2. 默认插槽显示“父级备注：内容布局由父组件决定”，证明父级变量可用。
3. 初始状态显示“当前主题：模板”和“详情状态：已展开”。
4. 点击“选择源码”后，真实状态更新为“当前主题：源码”；按钮通过 slot prop 的窄命令工作。
5. 点击“选择模板”后，状态恢复为“当前主题：模板”。
6. 点击“收起详情”后，详情内容消失，状态改为“详情状态：已收起”，按钮文案改为“展开详情”。
7. 点击“展开详情”后，详情内容和“详情状态：已展开”恢复。
8. `actions` 插槽存在时才渲染操作区包装；操作区包含真实原生按钮。
9. 因父组件未提供 `support`，页面显示“当前没有父级补充资料”的真实 fallback。
10. 整个流程无 console error；每次命令只产生一次明确状态变化，不显示伪造时间戳。

### 布局与可访问性约束

- 390px 下严格单列；宽屏使用 flex、`flex-wrap` 与 margin 排列。
- 禁止使用 CSS Grid 和 `gap` 属性。
- flex 子项设置 `min-width: 0`，长状态文字允许换行，不产生页面级横向滚动。
- 所有操作使用原生 `<button type="button">`，最小触控高度 44px。
- 状态区使用文本表达，并可设置 `aria-live="polite"`；颜色不是唯一状态信号。
- 标题使用真实 heading 层级，操作区使用可识别的语义容器。
- 390px 与 200% 文本缩放下按钮文案不截断，`.demo-box .missing` 必须为 `0`。
- 不使用 timer、远程请求、Transition、动态组件或 SSR 模拟制造效果。

## 建议 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.slots',
  type: 'lesson',
  title: '插槽',
  summary: '在父级渲染作用域中提供模板片段，并由子组件定义出口与状态能力边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.template-refs'],
  related: [
    'vue.core.learn.intermediate.template-refs',
    'vue.core.learn.basics.component-basics',
    'vue.core.learn.basics.props',
    'vue.core.reference.components.slots',
  ],
  tags: ['插槽', 'v-slot', '作用域插槽', '$slots', 'useSlots', 'defineSlots'],
  sources: [
    {
      title: 'Vue 插槽指南',
      url: 'https://cn.vuejs.org/guide/components/slots.html',
    },
    {
      title: 'Vue v-slot 指令',
      url: 'https://cn.vuejs.org/api/built-in-directives.html#v-slot',
    },
    {
      title: 'Vue slot 特殊元素',
      url: 'https://cn.vuejs.org/api/built-in-special-elements.html#slot',
    },
    {
      title: 'Vue useSlots',
      url: 'https://cn.vuejs.org/api/composition-api-helpers.html#useslots',
    },
    {
      title: 'Vue defineSlots',
      url: 'https://cn.vuejs.org/api/sfc-script-setup.html#defineslots',
    },
    {
      title: 'Vue 3.5.40 componentSlots.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentSlots.ts',
    },
    {
      title: 'Vue 3.5.40 renderSlot.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/renderSlot.ts',
    },
    {
      title: 'Vue 3.5.40 vSlot.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/vSlot.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-31',
  estimatedMinutes: 50,
})
```

上述 prerequisite 是唯一直接前置；四个 related 的内容与顺序精确冻结。不得增加 Attributes、
组件 `v-model`、Provide / Inject、动态组件或 SSR 条目，也不得把 reference Slots 设为 prerequisite。

## 后续实施文件范围

后续实现可限定为：

- `src/content/entries/learn/vue/core/intermediate/slots.ts`
- `src/content/demos/vue/core/learn/intermediate/slots/learning-panel-slots-demo.vue`
- `src/content/demos/vue/core/learn/intermediate/slots/parts/LearningSlotPanel.vue`
- `src/content/catalog/manifests/vue-core-track.ts`
- `src/content/catalog/vue-core-track.spec.ts`
- `src/content/interactive/registry.spec.ts`
- `tests/e2e/progress.spec.ts`
- `docs/重构实施计划.md`

不需要修改 schema、Demo registry 实现、现有 `vue.core.reference.components.slots`、全局样式或
其他课程。实现时只把本课从 planned 改为 available；不能同时开始 Attributes、组件 `v-model`
或下一分类，也不能把本课完成写成 Stage 6、Vue Core 中级或整个 remediation 关闭。

最小验证只覆盖：课程位置与唯一 prerequisite、四个 related 可解析、唯一 Demo ID 可解析、默认与
具名插槽内容、父级 `parentNote`、slot props 状态、`selectTopic()`、`toggleDetails()`、真实
fallback、390px 单列与无横向滚动。不要为十个易错点分别增加测试。

## 固定来源清单

### Vue 官方中文文档

- [Vue 插槽指南](https://cn.vuejs.org/guide/components/slots.html)：内容与出口、渲染作用域、fallback、
  默认 / 具名 / 条件 / 动态 / 作用域插槽，以及混合默认与具名插槽的显式语法。
- [`v-slot` 内置指令](https://cn.vuejs.org/api/built-in-directives.html#v-slot)：适用位置、参数、
  绑定值、解构与 `#` 缩写。
- [`<slot>` 内置特殊元素](https://cn.vuejs.org/api/built-in-special-elements.html#slot)：默认名称、
  `name` 保留 attribute 与 slot props。
- [动态参数语法限制](https://cn.vuejs.org/guide/essentials/template-syntax.html#dynamic-argument-syntax-constraints)：
  动态名称的字符串 / `null` 值和 attribute 语法限制。
- [`$slots`](https://cn.vuejs.org/api/component-instance.html#slots)：slots 对象、默认 key 和函数签名。
- [`useSlots()`](https://cn.vuejs.org/api/composition-api-helpers.html#useslots)：setup context 运行时入口，
  以及 TypeScript 优先 `defineSlots()` 的建议。
- [`defineSlots()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineslots)：Vue 3.3+、纯类型参数、
  slot props 推导、返回对象与暂未使用的函数返回类型。
- [`useSlots()` 与 `$slots`](https://cn.vuejs.org/api/sfc-script-setup.html#useslots-useattrs)：模板优先
  直接访问，runtime helper 与 setup context 等价。

### vuejs/core v3.5.40

- [`packages/runtime-core/src/componentSlots.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentSlots.ts)：
  插槽函数 / VNode 数组归一化、render 外调用警告、初始化、更新和陈旧 key 删除。
- [`packages/runtime-core/src/helpers/renderSlot.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/renderSlot.ts)：
  按名称和 props 调用、有效 VNode 判定、fallback 与 `_fb` key。
- [`packages/runtime-core/__tests__/componentSlots.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentSlots.spec.ts)：
  函数 / 非函数插槽归一化、警告、动态更新与稳定标记回归。
- [`packages/runtime-core/__tests__/helpers/renderSlot.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/renderSlot.spec.ts)：
  正常内容、fallback、纯注释、嵌套无效片段、fallback key 与 block tracking 回归。
- [`packages/compiler-core/src/transforms/vSlot.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/vSlot.ts)：
  插槽作用域、静态 / 动态 / 转发标记，以及条件和循环插槽生成。
- [`packages/compiler-core/__tests__/transforms/vSlot.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/transforms/vSlot.spec.ts)：
  具名 / 作用域 / 动态 / 条件 / 循环插槽，以及混用、重复和额外默认 children 错误。
- [`packages/compiler-core/src/transforms/transformSlotOutlet.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/src/transforms/transformSlotOutlet.ts)：
  `<slot>` 名称、props、fallback 到 `renderSlot()` 的转换。
- [`packages/compiler-core/__tests__/transforms/transformSlotOutlet.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-core/__tests__/transforms/transformSlotOutlet.spec.ts)：
  默认 / 静态 / 动态 outlet、props camelize 与 `name` 排除回归。

## 结论

本课应把插槽教成“父级定义内容函数，子级定义调用出口与能力参数”的组合契约，而不是任意穿透
父子状态的机制。父级渲染作用域解释内容能读什么；slot props 解释子组件愿意提供什么；fallback、
条件包装和具名出口解释子组件如何拥有结构。

最值得转化为教学判断的固定版本证据是：实例插槽统一为返回 VNode 数组的函数；插槽函数应在
渲染期调用；`$slots.name` 的存在与 `renderSlot()` 的有效内容判定不同；fallback 与真实内容用不同
内部 key；条件、循环和动态名称被编译器标成动态插槽；含糊、重复或额外默认声明会被编译器拒绝。

唯一“学习面板插槽实验”通过父级标题与备注、子级只读状态、`selectTopic()`、`toggleDetails()`
和未提供 `support` 时的 fallback 验证核心契约。动态名称、`useSlots()` 手动调用和编译器优化只留在
正文判断中，不把 Demo 扩成多个高级主题。
