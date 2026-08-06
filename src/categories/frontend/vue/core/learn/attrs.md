---
id: vue.core.learn.intermediate.attrs
type: lesson
title: Attributes 透传
summary: 识别未被 Props 和 Emits 消费的 attributes，并把它们合并到语义正确的目标
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.intermediate.slots
  - vue.core.learn.basics.props
  - vue.core.learn.basics.emits
  - vue.core.reference.components.attrs
tags:
  - $attrs
  - useAttrs
  - inheritAttrs
  - Attributes 透传
  - 事件监听器
appliesTo: Vue 3.5.40
verifiedAt: 2026-07-31
sources:
  - title: Vue 透传 Attributes 指南
    url: https://cn.vuejs.org/guide/components/attrs.html
  - title: Vue useAttrs
    url: https://cn.vuejs.org/api/composition-api-helpers.html#useattrs
  - title: Vue 组件事件声明
    url: https://cn.vuejs.org/guide/components/events.html#declaring-emitted-events
  - title: Vue 3.5.40 componentProps.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentProps.ts
  - title: Vue 3.5.40 componentRenderUtils.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentRenderUtils.ts
  - title: Vue 3.5.40 vnode.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts
  - title: Vue 3.5.40 attrs fallthrough tests
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererAttrsFallthrough.spec.ts
stage: intermediate
level: intermediate
estimatedMinutes: 45
prerequisites:
  - vue.core.learn.intermediate.slots
objectives:
  - 判断父级传入的 key 会进入 props、emits listener 还是 $attrs
  - 预测单元素根节点最终获得的 id、class、style 和原生监听器
  - 说明根节点本地监听器与透传监听器为何都会执行
  - '用 inheritAttrs: false 和 v-bind="$attrs" 控制唯一语义落点'
  - 按原始键名读取 $attrs，并识别 onClick 形式的监听器
  - 说明 useAttrs() 始终反映最新内容但不能作为 watch() 依赖源
  - 处理单组件根继续转发与多根节点显式绑定
  - 识别未声明同名 emits 时可能形成的重复事件路径
  - 区分公开契约、Vue 3.5.40 实现事实与课程推导
recap:
  - 透传 attributes 是没有被当前组件 props 或 emits 声明消费的剩余输入。
  - 单元素根默认接收 attrs，class、style 与同类 listener 会和根节点已有值合并。
  - 自动继承只认根节点，不会寻找后代中语义最合适的元素。
  - "inheritAttrs: false 关闭自动落根，但 $attrs 仍可用于显式定向绑定。"
  - 未声明 attributes 保留原始键名，事件监听器以 onClick 形式暴露。
  - useAttrs() 内容保持最新但不是可 watch 的响应式依赖；响应式业务值应声明为 prop。
  - 单组件根会继续转发 attrs，下一层可再次把 key 消费为 prop 或 emits listener。
  - 多根组件没有自动落点，应在一个语义目标上显式绑定 $attrs。
  - 未声明同名 emit 只有同时走根 DOM 与手动 emit 两条路径时才可能重复触发。
  - Vue 3.5.40 的分流、根合并与 listener 数组是解释证据，不是新增公共 API。
---

# Attributes 透传

## 正文大纲

上一课已经用插槽明确内容与出口的所有权。本课继续处理组件边界：父组件传入、却没有被当前组件声明为 Prop 或 Emits 监听器的 key，会成为透传 attributes。目标不是把所有值机械转发，而是先分类，再把它们交给语义正确的元素或根组件。

| 部分 | 核心问题 | 完成标志 |
| --- | --- | --- |
| 消费分类 | 这个 key 属于谁 | 能区分 props、emits 与 attrs |
| 单根合并 | 默认会落到哪里 | 能预测 class、style 与 listener |
| 定向透传 | 包装组件怎样选落点 | 会用 inheritAttrs 与 $attrs |
| 根节点差异 | 组件根和多根怎样处理 | 不会依赖 Vue 猜测 |
| 脚本访问 | useAttrs 有什么边界 | 不用 watch 追踪 attrs |
| 版本推导 | 源码能说明什么 | 不把内部实现写成公共承诺 |

:::tip
本课只讲有状态 SFC、&lt;script setup lang="ts"&gt; 与 Composition API。组件 v-model、函数组件的特殊规则、渲染函数和组件库透传框架留在后续课程。
:::

## 先按是否被声明消费分类

fallthrough attribute 的判断发生在当前组件边界：匹配 defineProps() 的 key 进入 props，匹配 defineEmits() 的监听器由组件事件契约消费；剩余普通 attribute、class、style 和监听器进入 $attrs。声明不仅补充 TypeScript 类型，也会改变运行时分流。

~~~~vue
<script setup lang="ts">
defineProps<{ label: string }>()
defineEmits<{ inspect: [] }>()
</script>

<!-- 父组件 -->
<ActionButton
  label="保存"
  class="parent-accent"
  data-course-id="attrs-01"
  @inspect="recordInspect"
  @click="recordNativeClick"
/>
~~~~

| 父级输入 | 当前组件分类 | 是否在 $attrs |
| --- | --- | --- |
| label | 已声明 prop | 否 |
| @inspect / onInspect | 已声明 emits listener | 否 |
| class | fallthrough attribute | 是 |
| data-course-id | fallthrough attribute | 是 |
| @click / onClick | 未声明的原生 listener | 是 |

:::warning
“未声明”只针对当前组件。attribute 继续到下一层组件后，还会根据下一层的 props 与 emits 再分类一次。
:::

## 单元素根节点自动继承

有状态组件渲染单个元素根节点时，透传 attributes 默认合并到这个根元素。Vue 不会根据 id、ARIA 或事件语义寻找“最像目标”的后代元素；它只处理最终根节点。

~~~~vue
<!-- ActionButton.vue -->
<template>
  <button type="button" class="child-button">保存</button>
</template>

<!-- 父组件 -->
<ActionButton id="save-action" class="parent-accent" />

<!-- 最终根元素同时包含 child-button 与 parent-accent -->
~~~~

根元素已有 class 和 style 时，父级值会参与合并而不是简单覆盖。已有同类 v-on 监听器时，本地监听器与父级透传监听器也都会执行。这里是两个 handler 被合并到同一个根 DOM 事件，不是 DOM 冒泡穿过了组件边界。

~~~~vue
<script setup lang="ts">
/** 记录根按钮自己的点击工作。 */
function recordLocalClick(): void {
  console.log('local')
}
</script>

<template>
  <button type="button" @click="recordLocalClick">保存</button>
</template>

<!-- 父级 @click 与 recordLocalClick 都会执行 -->
<ActionButton @click="recordParentClick" />
~~~~

## 包装组件必须选择语义落点

包装按钮若以 div 为唯一根节点，父级 id、ARIA、class 和 click 默认都会落到 div。若调用方的 attributes 描述的是真实按钮，应关闭自动继承，再把完整 $attrs 对象只绑定到按钮。

~~~~vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="button-wrapper">
    <button type="button" class="child-button" v-bind="$attrs">保存</button>
  </div>
</template>
~~~~

inheritAttrs: false 只关闭“自动加到根节点”，不会清空 $attrs。无参数 v-bind 把对象绑定到选中的目标，class、style 和 listener 仍按 Vue 的正常规则与目标已有值合并。通常应选一个明确落点；把同一份 id 或 listener 同时绑定到多个节点会制造重复标识和重复操作。

:::demo{id="vue.core.learn.intermediate.attrs.attribute-routing-lab-demo" playground="true"}
观察 props/emits 消费、原始 attrs 键和 class、style、listener 的定向合并
:::

## $attrs、useAttrs 与原始键名

模板中直接使用 $attrs；脚本确实需要读取透传集合时使用 useAttrs()。未声明 attributes 保留原始键名，data-course-id 要写 attrs['data-course-id']；@click 在对象中对应 onClick。不要套用 prop 的 kebab-to-camel 归一化规则。

~~~~ts
import { onUpdated, useAttrs } from 'vue'

const attrs = useAttrs()

onUpdated(() => {
  console.log(attrs['data-course-id'], attrs.onClick)
})
~~~~

useAttrs() 返回的对象内容会随组件更新保持最新，但官方明确说明它出于性能考虑不是响应式对象。watch(() =&gt; attrs.foo) 不能建立可靠依赖；需要响应式业务逻辑时，把该值升级为明确 prop。只需更新后做副作用时，可在 onUpdated() 中读取最新 attrs。

## 单组件根与多根节点

当唯一根节点本身是组件时，当前层没有消费的 attrs 会继续转发给根组件。下一层若把某个 key 声明为 prop，它就在下一层被消费，只有下一层显式绑定后才会进入 DOM。

~~~~vue
<!-- WrapperButton.vue：attributes 继续交给 BaseButton -->
<template>
  <BaseButton />
</template>

<!-- BaseButton.vue：disabled 到这一层成为 prop -->
<script setup lang="ts">
const props = defineProps<{ disabled?: boolean }>()
</script>

<template>
  <button type="button" :disabled="props.disabled">保存</button>
</template>
~~~~

多个根节点之间没有唯一自动落点。若 $attrs 未被显式使用，开发环境会报告无法继承的普通 attributes 或 listeners；Vue 不会依据 header、main、footer 的标签名替你选择。

~~~~vue
<template>
  <header>操作标题</header>
  <main v-bind="$attrs">正文</main>
  <footer>状态</footer>
</template>
~~~~

## 未声明同名 emit 的重复路径

若组件手动 emit('click') 却没有声明 click，父级 onClick 仍可能留在 $attrs 并透传到根按钮。同一次原生点击先直接触发根按钮上的父 listener，本地 handler 又 emit click 再触发一次父 listener，于是形成两条同名路径。

~~~~vue
<!-- 错误：会触发 click，却没有声明 click -->
<script setup lang="ts">
const emit = defineEmits()
</script>

<template>
  <button type="button" @click="emit('click')">保存</button>
</template>

<!-- 正确：声明后 onClick 由组件事件契约消费 -->
<script setup lang="ts">
const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button type="button" @click="emit('click', $event)">保存</button>
</template>
~~~~

:::warning
未声明 emits 不等于一定触发两次。只有同名 listener 同时经根 DOM 透传与组件手动 emit 两条路径到达父级时，才会出现重复风险。
:::

## 易错使用提示

:::pitfalls
### 把父级传入的所有 key 都当成 $attrs

**触发条件：** 把父级传入的所有 key 都当成 $attrs

**原因：** 忽略 props 与 emits 声明会先消费匹配的输入。

**后果：** 脚本读到 undefined，并误判组件公开接口的所有权。

**错误示例：**

~~~~ts
const attrs = useAttrs()
console.log(attrs.label, attrs.onInspect)
~~~~

**正确写法：**

~~~~ts
const props = defineProps<{ label: string }>()
defineEmits<{ inspect: [] }>()
const attrs = useAttrs()
console.log(props.label, attrs['data-course-id'])
~~~~

**验证方式：** 对照正确写法验证结果。

### 让包装组件把 ARIA、id 和 click 自动交给 div

**触发条件：** 让包装组件把 ARIA、id 和 click 自动交给 div

**原因：** 唯一根是包装 div，但调用方的 attributes 实际描述内层按钮。

**后果：** 可访问名称、选择器和点击区域落到错误元素。

**错误示例：**

~~~~vue
<template>
  <div class="wrapper"><button type="button">保存</button></div>
</template>
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>
<template>
  <div class="wrapper"><button type="button" v-bind="$attrs">保存</button></div>
</template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 关闭 inheritAttrs 后忘记显式绑定

**触发条件：** 关闭 inheritAttrs 后忘记显式绑定

**原因：** 误以为关闭自动继承后 Vue 仍会寻找另一个目标。

**后果：** 父级 attributes 留在 $attrs 中，却没有进入任何 DOM 节点。

**错误示例：**

~~~~vue
<script setup>
defineOptions({ inheritAttrs: false })
</script>
<template><button type="button">保存</button></template>
~~~~

**正确写法：**

~~~~vue
<script setup>
defineOptions({ inheritAttrs: false })
</script>
<template><button type="button" v-bind="$attrs">保存</button></template>
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为父级 click 会覆盖根按钮本地 click

**触发条件：** 认为父级 click 会覆盖根按钮本地 click

**原因：** 把 listener 合并误解成后写值覆盖前写值。

**后果：** 一次点击执行两个 handler，副作用次数与设计预期不符。

**错误示例：**

~~~~vue
<button type="button" @click="recordLocalClick">保存</button>
<!-- 误以为父级 @click 到来后本地 handler 不执行。 -->
~~~~

**正确写法：**

~~~~vue
<button type="button" @click="recordLocalClick">保存</button>
<!-- 明确把本地与透传 click 当作同一事件上的两个 handler。 -->
~~~~

**验证方式：** 对照正确写法验证结果。

### 触发 emit click 却不声明 click

**触发条件：** 触发 emit click 却不声明 click

**原因：** 父 onClick 同时可能作为根 DOM listener 透传，并被手动 emit 再调用。

**后果：** 计数、请求或状态切换重复执行。

**错误示例：**

~~~~ts
const emit = defineEmits()
// 点击时执行 emit('click')
~~~~

**正确写法：**

~~~~ts
const emit = defineEmits<{ click: [event: MouseEvent] }>()
// 点击时执行 emit('click', event)
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 camelCase 读取连字符 attribute

**触发条件：** 用 camelCase 读取连字符 attribute

**原因：** 把 prop 的名称归一化规则套给 $attrs。

**后果：** data 属性与 listener 都读到 undefined。

**错误示例：**

~~~~ts
const attrs = useAttrs()
console.log(attrs.dataCourseId, attrs.click)
~~~~

**正确写法：**

~~~~ts
const attrs = useAttrs()
console.log(attrs['data-course-id'], attrs.onClick)
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 watch 侦听 useAttrs() 成员

**触发条件：** 用 watch 侦听 useAttrs() 成员

**原因：** 误以为 attrs 对象内容更新就等同于可追踪的响应式依赖。

**后果：** 父级更新 attribute 后，watch 回调不可靠地保持静默。

**错误示例：**

~~~~ts
const attrs = useAttrs()
watch(() => attrs['data-course-id'], syncCourseId)
~~~~

**正确写法：**

~~~~ts
const props = defineProps<{ courseId: string }>()
watch(() => props.courseId, syncCourseId)
~~~~

**验证方式：** 对照正确写法验证结果。

### 让多根组件自动选择 main

**触发条件：** 让多根组件自动选择 main

**原因：** 误以为 Vue 会按标签语义或视觉面积选择透传目标。

**后果：** 开发环境出现警告，attributes 与 listeners 没有自动落点。

**错误示例：**

~~~~vue
<header>标题</header>
<main>正文</main>
<footer>状态</footer>
~~~~

**正确写法：**

~~~~vue
<header>标题</header>
<main v-bind="$attrs">正文</main>
<footer>状态</footer>
~~~~

**验证方式：** 对照正确写法验证结果。

### 认为组件根转发后永远保持为 attribute

**触发条件：** 认为组件根转发后永远保持为 attribute

**原因：** 忽略下一层组件还会重新执行 props、emits 与 attrs 分类。

**后果：** 下一层已消费的 disabled 等 key 不会自动出现在最终 DOM。

**错误示例：**

~~~~vue
<template><BaseButton /></template>
<!-- 误以为 disabled 一定自动进入原生按钮。 -->
~~~~

**正确写法：**

~~~~vue
<script setup lang="ts">
const props = defineProps<{ disabled?: boolean }>()
</script>
<template><button :disabled="props.disabled">保存</button></template>
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 从 Vue 3.5.40 源码与官方测试推导

以下五点分别陈述固定版本的实现事实和本课程推导。实现细节帮助解释 Vue 3.5.40 的可观察行为，但不会扩大官方公共 API。

:::steps
### 推导 1：attrs 是消费后的剩余集合

官方事实：componentProps.ts 的 setFullProps() 先匹配 props，再跳过已声明 emits listener，剩余 key 才写入 attrs，并保留原始 key。课程推导：调试透传时先核对两份声明，不从 DOM 缺少 attribute 直接推断 Vue 丢失了值；内部函数与分支顺序不是公共 API。

### 推导 2：自动透传取决于当前根 VNode

官方事实：componentRenderUtils.ts 只在 inheritAttrs 未关闭且根是元素或组件时合并 fallthroughAttrs；不合适的多根进入开发期警告分支。课程推导：组件结构从按钮变成包装 div 时必须重新审查落点，不能假设原有 attrs 语义保持；根判断过程不是公共 API。

### 推导 3：class、style 与 listener 使用不同合并规则

官方事实：vnode.ts 的 mergeProps() 规范化 class/style，并把不同 on&#42; listener 组合执行，同一函数引用会去重。课程推导：Demo 分别观察 class、style 与两个计数，不用字符串拼接或覆盖顺序模拟 Vue；listener 数组形态不是业务契约。

### 推导 4：useAttrs 不创建响应式副本

官方事实：apiSetupHelpers.ts 的 useAttrs() 返回当前 setup context attrs，官方指南明确该对象不可作为 watch 依赖。课程推导：脚本只用它检查原始键和 listener 是否存在；需要驱动状态的值升级为 prop，不建立 attrs 同步层。

### 推导 5：事件重复来自两条同名路径

官方事实：固定测试覆盖声明 emits 后同名 listener 不再透传，根原生 click 只调用父 listener 一次。课程推导：未声明 click 的风险由 attrs 分流、listener 合并与手动 emit 共同形成；运行 Demo 让原生 click 和 inspect 事件名称不同，每条路径每次只执行一次。
:::

:::exercise
### 实现把 attributes 定向到真实按钮的包装组件

**要求：**

~~~~text
创建 ForwardedActionButton：声明 label Prop 与 inspect Emit，关闭自动继承，把 $attrs 只绑定到内层按钮；父级传入 data-course-id、aria-label、class、style 与原生 click，并分别统计原生 click 和 inspect。验证 wrapper 没有父级 attributes，按钮保留本地与父级样式。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
<script setup lang="ts">
import { ref } from 'vue'
import ForwardedActionButton from './ForwardedActionButton.vue'

const nativeCount = ref(0)
const inspectCount = ref(0)

/** 记录父级原生点击监听器。 */
function recordNativeClick(): void {
  nativeCount.value += 1
}

/** 记录子组件显式发出的检查事件。 */
function recordInspect(): void {
  inspectCount.value += 1
}
</script>

<template>
  <ForwardedActionButton
    label="检查透传"
    class="parent-accent"
    data-course-id="attrs-01"
    aria-label="检查 Attributes 透传"
    @click="recordNativeClick"
    @inspect="recordInspect"
  />
</template>

<!-- ForwardedActionButton.vue -->
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const props = defineProps<{ label: string }>()
const emit = defineEmits<{ inspect: [] }>()

/** 发出组件拥有的检查意图。 */
function inspect(): void {
  emit('inspect')
}
</script>

<template>
  <div class="wrapper">
    <button type="button" class="forwarded-action" v-bind="$attrs" @click="inspect">
      {{ props.label }}
    </button>
  </div>
</template>
~~~~
:::

- [ ] 先用 props 与 emits 声明判断哪些输入已被消费
- [ ] 知道单元素根默认接收剩余 attributes
- [ ] 知道 class、style 与同类 listener 会合并
- [ ] 包装组件会关闭自动继承并选择唯一语义落点
- [ ] 按原始键读取 data-&#42;，按 onClick 读取 listener
- [ ] 不使用 watch 追踪 useAttrs() 成员
- [ ] 知道单组件根会继续转发并在下一层重新分类
- [ ] 多根组件显式绑定 $attrs，不等待 Vue 猜测
- [ ] 组件发出同名原生事件时完整声明 emits
- [ ] 不会把 Vue 3.5.40 内部合并结构写成公共承诺

## 完成本课后的判断顺序

先检查当前组件的 Props 与 Emits 声明，把剩余 key 视为 $attrs；再确认当前根是元素、组件还是多根，并判断默认根是否就是语义目标。包装或多根组件要关闭或绕过自动继承，只在一个明确目标上 v-bind="$attrs"。脚本读取时保留原始键名，不用 watch 追踪 attrs。最后检查是否存在未声明同名 emit 与原生 listener 的双路径。
