# Vue Core 中级课程：Attributes 透传调研

> 核验日期：2026-07-31
>
> 适用版本：Vue 3.5.40。
>
> 资料范围：Vue 中文/英文官方文档，以及 `vuejs/core` 的 `v3.5.40` 固定标签运行时
> 源码与官方测试。外部资料使用 Tavily Search / Extract 定位和提取；版本机制再回到固定标签
> 源码、测试逐行核验。

## 课程定位与冻结边界

| 字段 | 冻结值 |
| --- | --- |
| 课程 ID | `vue.core.learn.intermediate.attrs` |
| 标题 | `Attributes 透传` |
| 阶段 | 重构实施计划阶段 6 / Vue Core 中级 / 组件内容与双向绑定 |
| 当前 catalog 状态 | `planned`；后续实施完成并通过验证后只把本课改为 `available` |
| 线性位置 | `vue.core.learn.intermediate.slots` 之后、组件 `v-model` 之前 |
| 难度 | `intermediate` |
| 建议时长 | 45 分钟 |

本课唯一直接 prerequisite 冻结为：

`vue.core.learn.intermediate.slots`

这是当前 track 中紧邻本课之前的已上线课程。组件基础、Props、Emits 已经通过基础阶段和 Slots
传递性覆盖，不重复写成 prerequisite。

`related` 必须严格按以下顺序冻结：

1. `vue.core.learn.intermediate.slots`
2. `vue.core.learn.basics.props`
3. `vue.core.learn.basics.emits`
4. `vue.core.reference.components.attrs`

顺序表达“上一课 -> 输入消费边界 -> 事件消费边界 -> 深入参考”。四个 ID 在当前仓库均可导航。
不得加入组件 `v-model`、Provide / Inject、组合式函数、动态组件或其他后续规划课程。

本课只回答一个主问题：**父组件传入但未被当前组件声明消费的 attributes，怎样到达语义正确的
元素或根组件，并在 class、style 和监听器已有值时正确合并。** 主线限定为 SFC、
`<script setup lang="ts">`、Composition API 和有状态组件，覆盖：

- fallthrough attributes 的准确定义与 `props` / `emits` 消费边界。
- 单元素根节点的自动继承，以及 `class`、`style` 和原生监听器合并。
- 单组件根节点继续转发，和下一层组件把 key 声明为 prop 后的再次消费。
- 包装组件使用 `inheritAttrs: false` 与 `v-bind="$attrs"` 控制唯一落点。
- 多根节点没有自动落点，必须显式绑定 `$attrs`，否则开发环境警告。
- 模板 `$attrs`、`useAttrs()`、原始键名和非响应式限制。
- 未声明同名 emit 时，父监听器作为原生监听器透传并与手动 emit 形成重复触发的风险。

以下内容明确排除，不进入正文练习或 Demo：

- 组件 `v-model`、`defineModel()`、`modelValue`、`update:*` 和 model modifiers。
- Props 与 Emits 的完整入门教学；本课只复用其“已声明即消费”的既有知识。
- Slots 的完整语法、slot forwarding 或无头组件设计。
- Provide / Inject、事件总线、Pinia 或跨层状态方案。
- 函数组件的特殊 fallthrough 白名单；源码只把它列为版本实现旁注。
- Options API 的完整课程；`inheritAttrs` 只用 `defineOptions()` 主线表达。
- 自定义元素、SSR、hydration、Teleport、Transition、KeepAlive、Suspense。
- `mergeProps()`、`cloneVNode()` 或渲染函数的使用教程。
- 手写 attributes 白名单框架、事件拆分工具、组件库多态 `as` API。
- 故意在运行 Demo 中制造多根警告或重复触发；错误机制用静态反例说明。

在线指南不按 `3.5.40` 补丁版本冻结。公开语义以 2026-07-31 核验的中英文官方文档为准；
props/attrs 分流、根节点合并、监听器数组化和开发期警告，以 `vuejs/core@v3.5.40` 为版本证据。

## 学习目标

完成本课后，学习者应能：

1. 判断一个父级传入 key 会进入当前组件的 props、emits listener 还是 `$attrs`。
2. 预测单元素根节点最终得到的 `id`、`class`、`style` 和原生事件监听器。
3. 说明根元素自有监听器和父级透传监听器为何都会执行，而不是相互覆盖。
4. 使用 `defineOptions({ inheritAttrs: false })` 关闭自动继承，并把 `$attrs` 只绑定到语义目标。
5. 使用 `$attrs['data-course-id']` 和 `$attrs.onClick` 读取原始 attribute / listener 键。
6. 说明 `useAttrs()` 始终反映最新对象内容，但不能作为 `watch()` 的响应式依赖源。
7. 判断多根组件为何没有自动落点，并用一个显式 `v-bind="$attrs"` 消除警告。
8. 预测单组件根节点上的 attributes 会继续转发，且可能在下一层被声明 prop 消费。
9. 识别“根 DOM 原生 click + 组件手动 emit('click') + 未声明 emits”造成的重复触发风险。
10. 把公开契约、Vue 3.5.40 实现事实和本课程的设计推导分别陈述。

## 建议教学顺序

### 1. 先按“是否被声明消费”分类

从父组件调用开始，不从 `$attrs` API 开始：

```vue
<ActionButton
  label="保存"
  class="parent-accent"
  data-course-id="attrs-01"
  @inspect="recordInspect"
  @click="recordNativeClick"
/>
```

接收组件声明：

```vue
<script setup lang="ts">
defineProps<{ label: string }>()
defineEmits<{ inspect: [] }>()
</script>
```

分类结果必须先写清：

| 父级输入 | 当前组件分类 | 是否在 `$attrs` | 原因 |
| --- | --- | --- | --- |
| `label` | prop | 否 | 匹配 `defineProps()` |
| `@inspect` / `onInspect` | emits listener | 否 | 匹配 `defineEmits()` |
| `class` | fallthrough attribute | 是 | 未被 props / emits 声明 |
| `data-course-id` | fallthrough attribute | 是 | 未被声明，保留原始键名 |
| `@click` / `onClick` | fallthrough listener | 是 | `click` 未被声明为 emit |

**官方事实：** fallthrough attribute 是传给组件、但没有被该组件声明为 prop 或 emits 的
attribute 或 `v-on` 监听器。常见例子包括 `class`、`style` 和 `id`。

**证据：** [中文 Attributes 指南](https://cn.vuejs.org/guide/components/attrs.html#attribute-inheritance)、
[英文 Fallthrough Attributes 指南](https://vuejs.org/guide/components/attrs.html#attribute-inheritance)、
[`componentProps.ts` L372-L426](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts#L372-L426)。

### 2. 再观察单元素根节点的自动继承

```vue
<!-- ActionButton.vue -->
<template>
  <button type="button" class="child-button">{{ label }}</button>
</template>

<!-- 父组件 -->
<ActionButton class="parent-accent" id="save-action" />
```

最终原生按钮同时具有 `child-button parent-accent`，并得到 `id="save-action"`。自动透传目标是
组件的根元素，不是 Vue 根据 `id`、ARIA 或监听器语义猜出的“最合适元素”。

**官方事实：** 单元素根节点自动接收 fallthrough attributes；根节点已有 `class` 和 `style` 时
合并，而不是简单替换。

**证据：** [Attributes 继承](https://cn.vuejs.org/guide/components/attrs.html#attribute-inheritance)、
[class 与 style 合并](https://cn.vuejs.org/guide/components/attrs.html#class-and-style-merging)、
[`rendererAttrsFallthrough.spec.ts` L28-L91](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts#L28-L91)。

### 3. 把原生 listener 当作待合并的 VNode prop

```vue
<!-- 子组件根按钮已有本地监听器 -->
<button type="button" @click="recordLocalClick">保存</button>

<!-- 父级还传入原生 click 监听器 -->
<ActionButton @click="recordParentClick" />
```

点击根按钮时两个函数都执行。这里不是 DOM 冒泡穿过组件边界，而是父监听器作为 `onClick`
fallthrough prop 被合并到同一个根按钮。

**官方事实：** 根元素已有同类 `v-on` 监听器时，本地监听器与父级继承监听器都会触发。

**版本实现事实：** `cloneVNode()` 合并根 VNode props，`mergeProps()` 对 `class` 调用
`normalizeClass()`，对 `style` 调用 `normalizeStyle()`，对 `on*` listener 保留不同函数并组成数组，
同时对同一函数引用去重。

**证据：** [v-on listener 继承](https://cn.vuejs.org/guide/components/attrs.html#v-on-listener-inheritance)、
[`componentRenderUtils.ts` L149-L177](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts#L149-L177)、
[`vnode.ts` L864-L885](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts#L864-L885)。

### 4. 用包装组件暴露“默认落点不等于语义落点”

```vue
<template>
  <div class="button-wrapper">
    <button type="button">保存</button>
  </div>
</template>
```

上面的组件只有一个根元素，因此父级 `id`、ARIA、class 和 `@click` 默认都落到外层 `div`。
Vue 不知道调用方想操作内层按钮。

正确的主线写法：

```vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="button-wrapper">
    <button type="button" class="child-button" v-bind="$attrs">保存</button>
  </div>
</template>
```

`inheritAttrs: false` 只关闭自动加到根节点的步骤，不会清空 `$attrs`。无参数 `v-bind` 把对象
属性绑定到所选目标，因此 class、style 和 listener 仍使用 Vue 的正常合并规则。

**证据：** [禁用 Attributes 继承](https://cn.vuejs.org/guide/components/attrs.html#disabling-attribute-inheritance)、
[`defineOptions()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineoptions)、
[`rendererAttrsFallthrough.spec.ts` L290-L310](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts#L290-L310)、
[`rendererAttrsFallthrough.spec.ts` L341-L370](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts#L341-L370)。

### 5. 冻结 `$attrs` / `useAttrs()` 的键名和响应性边界

```vue
<script setup lang="ts">
import { onUpdated, useAttrs } from 'vue'

const attrs = useAttrs()

onUpdated(() => {
  console.log(attrs['data-course-id'], attrs.onClick)
})
</script>
```

- 模板可直接使用 `$attrs`；`<script setup>` 使用 `useAttrs()`。
- `foo-bar`、`data-course-id` 等 key 保留传入时的原始大小写，必须使用方括号访问。
- `@click` 在对象中以 `onClick` 暴露。
- attrs 对象始终反映当前值，但官方明确说明它出于性能考虑不是响应式对象，不能依赖
  `watch(() => attrs.foo)` 观察变化。
- 需要响应式逻辑时把该值声明为 prop；只需更新后执行副作用时，在 `onUpdated()` 中读取最新值。

**证据：** [在 JavaScript 中访问 fallthrough attributes](https://cn.vuejs.org/guide/components/attrs.html#accessing-fallthrough-attributes-in-javascript)、
[`useAttrs()` API](https://cn.vuejs.org/api/composition-api-helpers.html#useattrs)、
[`componentProps.ts` L401-L426](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts#L401-L426)、
[`apiSetupHelpers.ts` L408-L421](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiSetupHelpers.ts#L408-L421)。

### 6. 分开讲单组件根节点和多根节点

单组件根节点：

```vue
<!-- ActionButton 只有 BaseButton 一个组件根节点 -->
<template>
  <BaseButton />
</template>
```

`ActionButton` 未消费的 attributes 会继续传给 `BaseButton`。`BaseButton` 可以把其中某个 key
声明为自己的 prop；该 key 到这一层后被消费，其余 attrs 再按 `BaseButton` 的根节点规则处理。

多根节点：

```vue
<template>
  <header>操作</header>
  <main v-bind="$attrs">正文</main>
  <footer>状态</footer>
</template>
```

多根组件没有唯一自动落点。未显式使用 `$attrs` 时，Vue 开发环境分别报告 extraneous non-props
attributes / non-emits event listeners；显式选择一个语义目标后不再依赖自动猜测。

**证据：** [深层组件继承](https://cn.vuejs.org/guide/components/attrs.html#nested-component-inheritance)、
[多根节点继承](https://cn.vuejs.org/guide/components/attrs.html#attribute-inheritance-on-multiple-root-nodes)、
[`rendererAttrsFallthrough.spec.ts` L207-L288](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts#L207-L288)、
[`rendererAttrsFallthrough.spec.ts` L373-L393](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts#L373-L393)。

### 7. 最后解释未声明同名 emit 的重复触发风险

```vue
<!-- 错误：组件会 emit click，但没有声明 click。 -->
<script setup lang="ts">
const emit = defineEmits()
</script>

<template>
  <button type="button" @click="emit('click')">保存</button>
</template>
```

父级 `<ActionButton @click="save" />` 的 `onClick` 因未匹配 emits 而留在 `$attrs`，自动合并到
根按钮；按钮本地 handler 又执行 `emit('click')`。同一次原生 click 因而可能直接调用一次父监听器，
再经组件 emit 调用一次。

正确方式是声明同名事件：

```vue
<script setup lang="ts">
const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button type="button" @click="emit('click', $event)">保存</button>
</template>
```

声明后父 `onClick` 在 props/attrs 分流阶段被消费，不再作为原生 listener 透传；官方测试断言一次
原生 click 只调用父监听器一次，并收到组件发出的 `'custom'` 载荷。

**官方事实：** Vue 推荐完整声明事件，使其能区分组件事件和 fallthrough attributes；若 `click`
在 emits 中声明，父监听器只监听组件触发的 click，不再响应根元素原生 click。

**课程推导：** 上述“双路径”是由官方分流、根 listener 合并和手动 emit 三个事实合成的风险模型；
它不是“所有未声明事件必然执行两次”。只有同名 listener 同时经根 DOM 和组件 emit 到达父级时才发生。

**证据：** [声明触发的事件](https://cn.vuejs.org/guide/components/events.html#declaring-emitted-events)、
[`componentProps.ts` L401-L426](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts#L401-L426)、
[`vnode.ts` L864-L885](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts#L864-L885)、
[`rendererAttrsFallthrough.spec.ts` L595-L659](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts#L595-L659)。

## 最小核心知识矩阵

| 场景 | 默认结果 | 应用方需要做什么 |
| --- | --- | --- |
| 未声明普通 attribute | 进入 `$attrs` | 单根可自动继承；包装/多根要选落点 |
| 已声明 prop | 进入 props，不在 `$attrs` | 子组件显式使用 prop |
| 已声明 emits listener | 被当前组件消费，不在 `$attrs` | 子组件显式 emit |
| 未声明 `onClick` | 进入 `$attrs` | 预测它会成为根原生 listener |
| 单元素根 | 自动合并 attrs 到根元素 | 确认根元素就是语义目标 |
| 单组件根 | attrs 继续传给根组件 | 继续检查下一层的 props/emits/root |
| 包装元素根 | attrs 默认落在包装元素 | `inheritAttrs: false` + 定向 `v-bind` |
| 多根 / Fragment | 无自动落点，开发期可能警告 | 在一个明确节点显式绑定 `$attrs` |
| `class` / `style` | 与目标已有值合并 | 不手写字符串拼接替代 Vue 合并 |
| 同名原生 listener | 本地和透传 listener 都执行 | 若它是组件事件，声明 emits 并只走一条公开路径 |

## 易错点（9 个）

### 1. 把父级传入的所有 key 都叫作 `$attrs`

**错误：**

```ts
const attrs = useAttrs()
console.log(attrs.label, attrs.onInspect)
```

**正确：**

```ts
const props = defineProps<{ label: string }>()
const emit = defineEmits<{ inspect: [] }>()
const attrs = useAttrs()

console.log(props.label, attrs['data-course-id'])
```

**原因：** 已声明 prop 和已声明事件 listener 被当前组件消费，不在 `$attrs`；只有未声明 key
进入 attrs 分支。声明会改变运行时分流，不只是补 TypeScript 类型。

### 2. 包装组件让 ARIA、id 和 click 自动落到外层 `div`

**错误：**

```vue
<template>
  <div class="wrapper">
    <button type="button">保存</button>
  </div>
</template>
```

**正确：**

```vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="wrapper">
    <button type="button" v-bind="$attrs">保存</button>
  </div>
</template>
```

**原因：** 自动继承只看根节点，不推断交互语义。错误落点会让可访问名称、选择器、表单属性和
点击区域作用于 `div`。

### 3. 设置 `inheritAttrs: false` 后以为 `$attrs` 也消失了

**错误：**

```vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <button type="button">保存</button>
</template>
```

**正确：**

```vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <button type="button" v-bind="$attrs">保存</button>
</template>
```

**原因：** 该选项只关闭“自动加到根节点”，attrs 仍可在模板 `$attrs`、`useAttrs()` 和 setup
context 中访问。关闭自动继承后必须自己选择是否及在哪里转发。

### 4. 认为父级 `@click` 会覆盖根按钮自己的 `@click`

**错误：**

```vue
<button type="button" @click="recordLocalClick">保存</button>
<!-- 误以为父级 @click 到来后 recordLocalClick 不再执行。 -->
```

**正确：**

```vue
<button type="button" @click="recordLocalClick">保存</button>
<!-- 把本地与父级 listener 视为同一 DOM 事件上的两个 handler。 -->
```

**原因：** Vue 合并不同 listener；官方契约明确两者都会触发。业务若要求唯一命令路径，应把
组件事件与原生 click 职责分开，而不是依赖覆盖顺序。

### 5. 触发 `emit('click')` 却不声明 `click`

**错误：**

```vue
<script setup lang="ts">
const emit = defineEmits()
</script>

<template>
  <button type="button" @click="emit('click')">保存</button>
</template>
```

**正确：**

```vue
<script setup lang="ts">
const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button type="button" @click="emit('click', $event)">保存</button>
</template>
```

**原因：** 未声明时父 `onClick` 仍可能作为根 DOM listener 透传，手动 emit 再走第二条路径；
声明后 listener 被 emits 消费，只响应组件显式触发的事件。

### 6. 用 camelCase 读取连字符 attribute，或用 `click` 读取 listener

**错误：**

```ts
const attrs = useAttrs()
console.log(attrs.dataCourseId, attrs.click)
```

**正确：**

```ts
const attrs = useAttrs()
console.log(attrs['data-course-id'], attrs.onClick)
```

**原因：** 未声明 attributes 保留原始大小写；listener 使用 `onXxx` VNode prop 键。prop 的
kebab-to-camel 归一化规则不能套用到 `$attrs`。

### 7. 用 `watch()` 侦听 `useAttrs()` 的成员

**错误：**

```ts
const attrs = useAttrs()
watch(() => attrs['data-course-id'], syncCourseId)
```

**正确：**

```ts
const props = defineProps<{ courseId: string }>()
watch(() => props.courseId, syncCourseId)
```

如果该值不应升级为 prop，可在 `onUpdated()` 中读取最新 attrs 做更新后副作用。

**原因：** attrs 对象会更新内容，但不是可被 `watch()` 追踪的响应式对象。需要响应性就是一个
明确的 prop 契约，不应把 `$attrs` 当作隐式 store。

### 8. 多根组件依赖 Vue 自动选择“最像正文”的节点

**错误：**

```vue
<template>
  <header>标题</header>
  <main>正文</main>
  <footer>状态</footer>
</template>
```

**正确：**

```vue
<template>
  <header>标题</header>
  <main v-bind="$attrs">正文</main>
  <footer>状态</footer>
</template>
```

**原因：** Fragment 没有唯一自动落点。Vue 不根据标签名或视觉面积猜测；未使用 attrs 时开发
环境会警告，attribute/listener 不会自动出现在任一根节点。

### 9. 认为透传经过组件根时永远保持为 attribute

**错误：**

```vue
<!-- Wrapper.vue -->
<BaseButton />
<!-- 误以为 disabled 一定最终成为原生 attribute。 -->
```

**正确：**

```vue
<!-- BaseButton.vue -->
<script setup lang="ts">
const props = defineProps<{ disabled?: boolean }>()
</script>

<template>
  <button type="button" :disabled="props.disabled">保存</button>
</template>
```

**原因：** attrs 到达根组件后会按下一层组件的 props/emits 再次分类。`BaseButton` 声明
`disabled` 后，它在这一层成为 prop，只有显式绑定才进入最终 DOM。

## Vue 3.5.40 源码与测试的独立推导

本节刻意分开三种陈述：公开文档拥有的**官方契约**、固定标签代码显示的**版本实现事实**、
以及为本仓库课程和 Demo 作出的**课程推导**。后两者不能反向扩写官方 API 承诺。

### 官方契约

1. 未在当前组件 props / emits 中声明的 attribute 或 listener 才是 fallthrough attribute。
2. 单元素根节点自动继承；class、style 和同类 listener 与根节点已有值合并。
3. 单组件根节点继续接收 attrs；当前层已消费的 prop / emits listener 不再继续。
4. `inheritAttrs: false` 关闭自动继承，`$attrs` / `useAttrs()` 仍提供显式访问。
5. attrs 保留原始键名，`@click` 暴露为 `onClick`；attrs 不是可 watch 的响应式对象。
6. 多根组件没有自动落点，未显式使用 attrs 时开发环境警告。

### Vue 3.5.40 版本实现事实

1. `setFullProps()` 先跳过保留 key，再用 camelized key 匹配 props；未匹配 prop 且不是
   `isEmitListener()` 的 key 才写入 attrs，并明确保留原始 key casing。
   见 [`componentProps.ts` L372-L426](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts#L372-L426)。
2. 有状态组件直接把实例 `attrs` 作为 `fallthroughAttrs`；只有 `inheritAttrs !== false` 才进入
   根节点合并。元素根或组件根通过 `cloneVNode()` 合并，Fragment/text/Teleport 等无合适根时
   进入开发期警告分支。
   见 [`componentRenderUtils.ts` L111-L211](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts#L111-L211)。
3. `mergeProps()` 分别规范化 class/style；不同 `on*` listener 组合为数组，同一函数引用会去重。
   这解释“两个 listener 都执行”，但 listener 数组结构属于内部实现，不应成为业务 API。
   见 [`vnode.ts` L864-L885](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts#L864-L885)。
4. `useAttrs()` 返回当前 setup context 的 attrs；辅助函数本身不创建新的 attrs 副本。
   见 [`apiSetupHelpers.ts` L408-L421](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiSetupHelpers.ts#L408-L421)。
5. 官方测试直接覆盖：普通 attrs/class/style/listener 动态合并、组件根继续转发、
   `inheritAttrs: false`、显式 spreading、多根警告、声明 emits 后 listener 只执行一次。
   见文末固定测试清单。

### 课程推导

1. 本课用“props -> emits listener -> attrs”的分类表作为首个判断工具；这是教学组织，不是新的
   Vue API 或完整编译顺序说明。
2. 包装交互组件默认采用 `inheritAttrs: false` 并把 `$attrs` 定向到真实按钮，因为本 Demo 的
   API 语义要求调用方 attributes 描述按钮；这不是所有包装组件的通用强制规则。
3. Demo 用 `inspect` 作为已声明组件事件、用 `click` 作为原生 fallthrough listener，故意让两条
   职责不同且每次各执行一次；这样证明消费边界而不制造重复 click 错误。
4. “未声明 click 可能重复触发”来自 attrs 分流、listener 合并和手动 emit 的组合推演，只在
   两条同名路径同时存在时成立，不能简化成“未声明 emits 一定触发两次”。
5. related 的数量、顺序，唯一 Demo，按钮文案和断言均是当前仓库冻结选择，不属于 Vue 官方事实。

### 不进入课程主线的实现旁注

`componentRenderUtils.ts` 对没有显式 props 的函数组件只自动选择 `class`、`style` 和 `on*`
白名单，而有状态 SFC 使用完整 attrs。本课只教授仓库既有的有状态 `<script setup>` SFC，不把这条
函数组件差异扩成第二套规则。固定实现见
[`componentRenderUtils.ts` L344-L351](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts#L344-L351)。

## 唯一 Demo 冻结规格

### 唯一 Demo ID

`vue.core.learn.intermediate.attrs.attribute-routing-lab-demo`

本课正文只能出现这一个 `type: 'demo'` block。易错点使用静态代码块，不得再注册第二个 Demo、
playground 变体或警告复现 Demo。

### 父子组件结构

```text
attribute-routing-lab-demo.vue              父 Demo，拥有外部 attributes 与断言计数
└── parts/ForwardedActionButton.vue          包装子组件，决定 attributes 的语义落点
    ├── div[data-role="wrapper"]             单一外层根节点，不接收父级 attrs
    └── button[data-role="action"]           v-bind="$attrs" 的唯一目标
```

`ForwardedActionButton.vue` 的冻结契约：

- `defineOptions({ inheritAttrs: false })`。
- 声明 prop `label: string`，证明 `label` 被消费且不在 `$attrs`。
- 声明 emit `inspect: [localCount: number]`，证明 `onInspect` 被消费且不作为原生 listener 透传。
- 调用 `useAttrs()`，只用于展示 `data-course-id` 原始键和 `onClick` 是否存在；不用 `watch()`。
- wrapper 只负责布局，真实 `button` 写 `v-bind="$attrs"`，并保留本地 class、style 和 click handler。
- 本地 click handler 每次只做两件事：本地计数加一、`emit('inspect', localCount)`。
- 不手动 `emit('click')`，避免把错误反例带进运行 Demo。

父 Demo 传入子组件：

```vue
<ForwardedActionButton
  label="检查透传"
  class="parent-accent"
  :class="{ 'parent-emphasis': emphasized }"
  :style="parentStyle"
  data-course-id="attrs-01"
  aria-label="检查 Attributes 透传"
  @click="recordNativeClick"
  @inspect="recordInspect"
/>
```

### 初始状态

- `emphasized = true`。
- 父级原生 click 计数为 `0`。
- 父级 inspect 计数为 `0`，最近 inspect 载荷显示“尚未检查”。
- 子级本地 click 计数为 `0`。
- 父级 style 提供 `borderColor` 与 `borderWidth: '2px'`；子按钮本地 style 保留
  `fontWeight: '600'`。
- wrapper 不含 `parent-accent`、`parent-emphasis`、`data-course-id`、`aria-label` 或父级
  `onClick`。
- action button 同时含本地 class 和父级 class，具有父级 style、`data-course-id="attrs-01"`
  和 `aria-label="检查 Attributes 透传"`。
- 子组件的 attrs 检视区显示：`data-course-id = attrs-01`、`onClick = function`、
  `label = consumed`、`onInspect = consumed`。

### 可操作项

1. 点击“检查透传”按钮。
2. 点击“切换父级强调”按钮，在 true / false 间切换父级 class 和边框颜色。
3. 点击“重置计数”按钮，把父级原生 click、inspect 与子级本地 click 计数归零。

不增加模式下拉、多根警告开关、异步请求、timer、随机值、组件 `v-model` 或额外 Demo。

### 可断言结果

1. 初始页面只有一个 Demo，`.demo-box .missing` 为 `0`。
2. wrapper 不接收父级 `class` / `style` / `data-*` / ARIA / listener；attrs 只落在 action button。
3. action button 的 class 同时包含 `forwarded-action`、`parent-accent`、`parent-emphasis`。
4. action button 同时具有子级 `font-weight: 600` 和父级 `border-width: 2px`，证明 style 合并。
5. 第一次点击 action button 后：子级本地计数 `1`、父级原生 click 计数 `1`、父级 inspect
   计数 `1`、最近载荷 `1`；没有任一计数变成 `2`。
6. 第二次点击后四个相应数值推进到 `2`，每次点击只增加一次。
7. 切换强调后 `parent-emphasis` 从 action button 移除，父级边框颜色改变；本地
   `forwarded-action` 和 `font-weight: 600` 保持。
8. 再次切换后父级强调 class 与初始边框颜色恢复。
9. `data-course-id` 使用原始连字符键读取；检查区不把它显示成 `dataCourseId`。
10. `label` 和 `onInspect` 明确显示为 consumed，且 action button DOM 不出现 `label` attribute。
11. 重置后三个计数与最近载荷恢复初态，attributes 落点和样式不改变。
12. 整个流程无 console error / warning，不产生 extraneous attrs 或重复组件 click。

### 布局与可访问性约束

- 390px 下严格单列；宽屏可用 flex、`flex-wrap` 与 margin，不使用 CSS Grid 或 `gap`。
- flex 子项设置 `min-width: 0`，长键名和状态文字允许换行，不产生页面级横向滚动。
- 所有操作使用原生 `<button type="button">`，最小触控高度 44px。
- “检查透传”“切换父级强调”“重置计数”使用完整可见命令，不以单个图标代替。
- 计数、消费状态、落点与 class/style 结果均用文本表达，颜色不是唯一信号。
- 最近 inspect 载荷可使用 `aria-live="polite"`，但不重复播报整张检查表。
- 390px 与 200% 文本缩放下按钮、raw key 和状态值不截断。
- 不使用远程资源、动画、Transition、动态组件、截图模拟或伪造时间戳。

## 建议 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.attrs',
  type: 'lesson',
  title: 'Attributes 透传',
  summary: '识别未被 Props 和 Emits 消费的 attributes，并把它们合并到语义正确的目标',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.slots'],
  related: [
    'vue.core.learn.intermediate.slots',
    'vue.core.learn.basics.props',
    'vue.core.learn.basics.emits',
    'vue.core.reference.components.attrs',
  ],
  tags: ['$attrs', 'useAttrs', 'inheritAttrs', 'Attributes 透传', '事件监听器'],
  sources: [
    {
      title: 'Vue 透传 Attributes 指南',
      url: 'https://cn.vuejs.org/guide/components/attrs.html',
    },
    {
      title: 'Vue useAttrs',
      url: 'https://cn.vuejs.org/api/composition-api-helpers.html#useattrs',
    },
    {
      title: 'Vue 组件事件声明',
      url: 'https://cn.vuejs.org/guide/components/events.html#declaring-emitted-events',
    },
    {
      title: 'Vue 3.5.40 componentProps.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts',
    },
    {
      title: 'Vue 3.5.40 componentRenderUtils.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts',
    },
    {
      title: 'Vue 3.5.40 vnode.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts',
    },
    {
      title: 'Vue 3.5.40 attrs fallthrough tests',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-31',
  estimatedMinutes: 45,
})
```

上述 prerequisite 是唯一直接前置；四个 related 的内容和顺序精确冻结。唯一 Demo ID 也是冻结
契约。后续实施不得顺手调整 Slots，且不得开始组件 `v-model` 或其他阶段 6 课程。

## 后续最小实施范围

后续实现可限定为：

- `src/content/entries/learn/vue/core/intermediate/attrs.ts`
- `src/content/demos/vue/core/learn/intermediate/attrs/attribute-routing-lab-demo.vue`
- `src/content/demos/vue/core/learn/intermediate/attrs/parts/ForwardedActionButton.vue`
- `src/content/catalog/manifests/vue-core-track.ts`
- `src/content/catalog/vue-core-track.spec.ts`
- `src/content/interactive/registry.spec.ts`
- `tests/e2e/progress.spec.ts`
- `docs/重构实施计划.md`

不需要修改 schema、interactive registry 实现、现有 reference attrs、Slots 课程、全局样式或其他
课程。只把本课从 `planned` 改为 `available`；单课完成不等于阶段 6 或 Gate 6 关闭。

最小验证只覆盖：

- 本课紧跟 Slots，唯一 prerequisite 与四个 related 精确匹配并可解析。
- 唯一 Demo ID 可解析，同源源码入口可读取父 Demo 文件。
- props/emits 消费、raw attrs key、定向落点、class/style/listener 合并和每次点击各计数一次。
- 390px 单列、无横向滚动、无 console warning/error、`.demo-box .missing` 为 `0`。

不要为九个易错点分别创建单元测试；多根警告与声明 emits 的机制已有 Vue 官方固定标签测试，
本地只测试课程真正承诺的可观察回路。

## 固定来源清单

### Vue 官方文档

- [中文：透传 Attributes](https://cn.vuejs.org/guide/components/attrs.html)：定义、单根自动继承、
  class/style/listener 合并、组件根继续转发、`inheritAttrs: false`、原始键名、多根与非响应式限制。
- [英文：Fallthrough Attributes](https://vuejs.org/guide/components/attrs.html)：与中文页面交叉核对
  定义、消费边界、nested component 和 disabling inheritance。
- [Composition API：`useAttrs()`](https://cn.vuejs.org/api/composition-api-helpers.html#useattrs)：
  返回 setup context attrs 的公开类型和用途。
- [`defineOptions()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineoptions)：在
  `<script setup>` 内声明 `inheritAttrs: false`。
- [组件事件：声明触发的事件](https://cn.vuejs.org/guide/components/events.html#declaring-emitted-events)：
  emits 声明帮助 Vue 区分组件事件与 fallthrough listener；声明原生同名事件后的监听边界。

### vuejs/core v3.5.40 源码行锚点

- [`componentProps.ts` L372-L426](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts#L372-L426)：
  props / emits listener / attrs 分流与原始 key 保留。
- [`componentRenderUtils.ts` L111-L211](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts#L111-L211)：
  有状态组件 fallthrough attrs、`inheritAttrs`、元素/组件根合并和多根警告。
- [`componentRenderUtils.ts` L344-L351](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts#L344-L351)：
  函数组件无 props 时的白名单旁注；不进入课程主线。
- [`vnode.ts` L864-L885](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts#L864-L885)：
  class、style 和不同 listener 的合并/去重。
- [`apiSetupHelpers.ts` L408-L421](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiSetupHelpers.ts#L408-L421)：
  `useAttrs()` 返回当前 setup context attrs。

### vuejs/core v3.5.40 官方测试行锚点

- [`rendererAttrsFallthrough.spec.ts` L28-L91](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts#L28-L91)：
  普通 attrs、动态 class/style、listener 自动继承与更新。
- [`rendererAttrsFallthrough.spec.ts` L207-L288](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts#L207-L288)：
  组件根继续转发、下一层声明 prop 后消费。
- [`rendererAttrsFallthrough.spec.ts` L290-L310](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts#L290-L310)：
  `inheritAttrs: false` 关闭自动继承。
- [`rendererAttrsFallthrough.spec.ts` L341-L393](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts#L341-L393)：
  显式 spreading 仍合并 class，多根失败给出 attrs/listener 警告。
- [`rendererAttrsFallthrough.spec.ts` L595-L659](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts#L595-L659)：
  声明 emits 后同名 listener 不再透传，单次原生 click 只调用父监听器一次。

## 自检结论

- 课程 ID、标题、阶段、唯一 prerequisite、related 精确顺序和唯一 Demo ID 已冻结。
- fallthrough 定义、props/emits 消费、class/style/listener 合并、`inheritAttrs: false`、
  `$attrs` / `useAttrs()`、原始键名、非响应式限制、单根/多根/组件根和未声明 emits 风险均覆盖。
- 共列出 9 个含错误、正确、原因的高质量易错点。
- 官方公开事实、Vue 3.5.40 版本实现事实和课程推导已分节，未把内部数组结构写成公共 API。
- 固定来源均为 Vue 官方文档、`vuejs/core@v3.5.40` 源码或同标签官方测试，无二手资料。
- 明确排除组件 `v-model` 与所有后续课程，未扩大到函数组件、SSR 或组件库设计。
