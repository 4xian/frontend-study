# Vue Core 中级课程：模板引用调研

> 核验日期：2026-07-31
>
> 适用版本：Vue 3.5.40。
>
> 资料范围：Vue 中文官方文档、Vue 3.5 官方发布说明，以及 `vuejs/core` 的
> `v3.5.40` 固定标签运行时源码与同标签官方测试。外部资料通过 Tavily Search / Extract
> 定位和提取；本文不采用博客、问答或第三方封装作为事实来源。

## 课程定位与边界

本课目标 ID 为 `vue.core.learn.intermediate.template-refs`，位于
`vue.core.learn.intermediate.lifecycle-update-timing` 之后，是“生命周期与模板引用”分类的
第二课。模板引用必须先理解挂载、卸载和 `nextTick()`，因此唯一直接 prerequisite 冻结为上一课；
Props 与 Emits 已通过线性路线传递，不重复声明为 prerequisite。

本课只回答一个主问题：**声明式渲染不足以完成聚焦、测量或命令式组件操作时，怎样取得当前真实
目标，并让引用跟随目标的挂载、更新和卸载。** 主线限定为 SFC、`<script setup lang="ts">`、
Composition API 与 Vue 3.5+，覆盖：

- 普通 DOM 元素上的静态字符串 `ref` 与 `useTemplateRef()`。
- 模板引用从 `null` 到目标，再回到 `null` 的生命周期。
- 状态更新后配合 `await nextTick()` 读取最新 DOM。
- 子组件公开实例、`defineExpose()` 和最小命令式接口。
- `v-for` 引用数组、数组顺序不保证及按业务 ID 保存引用。
- 函数模板引用的赋值、重复调用和卸载清理。
- `v-if` / `v-show` 对引用寿命的不同影响。
- 动态字符串引用、动态组件引用和必要的 TypeScript 类型收窄。
- SSR 阶段无 DOM、客户端 hydration 后引用才可用的边界。

以下内容明确排除，不进入正文练习或 Demo：

- 不重新教授生命周期或 `nextTick()` 调度，只把它们作为已学前置能力使用。
- 不以 Options API 的 `this.$refs` 为主线；只保留迁移识别和 `$refs` 非响应式说明。
- 不教授完整动态组件、异步组件、`KeepAlive`、`Suspense`、`Teleport` 或 Transition。
- 不教授 SSR 架构、hydration mismatch、流式渲染或服务端数据获取。
- 不扩展为 ResizeObserver、IntersectionObserver、焦点陷阱、编辑器或图表库教程。
- 不用模板引用替代 Props、Emits、组件 `v-model`、Provide/Inject 或 store。
- 不教授渲染函数手写 VNode ref、内部组件实例或 `getCurrentInstance()`。
- 不把泛型组件和 `vue-component-type-helpers` 设为必学内容，只在类型边界中给出官方入口。

课程语义以 2026-07-31 核验的官方模板引用、TypeScript、条件渲染、SSR 文档为准；动态名称切换、
数组维护、公开实例代理和 hydration 赋值等实现结论，以 `vuejs/core@v3.5.40` 为固定证据。

**课程依据：** [Vue 模板引用指南](https://cn.vuejs.org/guide/essentials/template-refs.html)、
[`useTemplateRef()` API](https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref)、
[Vue 3.5 发布说明](https://blog.vuejs.org/posts/vue-3-5#usetemplateref)、
[`ref` 特殊 attribute](https://cn.vuejs.org/api/built-in-special-attributes.html#ref)。

## 学习目标

完成本课后，学习者应能：

1. 区分普通响应式 `ref()`、模板中的 `ref` attribute 与 `useTemplateRef()`。
2. 解释引用为什么在 setup、SSR、未挂载和 `v-if` 卸载后是 `null`。
3. 在一次状态修改后使用 `await nextTick()`，再聚焦、滚动或测量最新 DOM。
4. 为普通元素选择正确的 DOM 类型，并在使用前做空值判断。
5. 通过组件 ref 调用 `defineExpose()` 明确公开的最小命令，而不是读取全部内部状态。
6. 正确处理 `v-for` 引用数组，避免用数组索引建立业务身份。
7. 用函数模板引用和稳定业务 ID 维护 `Map`，并在收到 `null` 时删除过期条目。
8. 解释 `v-if` 会结束引用寿命，而 `v-show` 通常保留同一目标引用。
9. 为动态字符串 ref 或动态组件编写不会假定固定目标的类型与运行时判断。
10. 在 SSR 应用中把 DOM 引用操作留到客户端 mounted/hydration 完成后。

## 建议教学顺序

### 1. 先把三个同名概念分开

不要从 `this.$refs` 或 API 清单开始。先展示同一段最小代码中的三个角色：

```vue
<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

const enabled = ref(true) // 业务响应式状态
const inputElement = useTemplateRef<HTMLInputElement>('search-input') // 模板引用句柄
</script>

<template>
  <input v-if="enabled" ref="search-input" /> <!-- 特殊 attribute -->
</template>
```

`ref()` 创建业务响应式状态；模板 `ref="search-input"` 给渲染目标登记名称；
`useTemplateRef('search-input')` 取得由 Vue 同步的只读浅层 ref。模板的 `ref` 是 Vue 消费的特殊
attribute，不会作为普通 HTML attribute 留在 DOM 上。

**官方事实：** [`useTemplateRef()` 返回类型](https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref)、
[`ref` 特殊 attribute](https://cn.vuejs.org/api/built-in-special-attributes.html#ref)。

### 2. 用一条 null 时间线建立正确心智模型

引用不是 setup 时主动查询 DOM 的结果，而是渲染器在目标存在时写入的结果：

```text
setup / SSR        客户端挂载完成         v-if 移除 / 卸载
    null      ─────────► 目标元素或实例 ─────────► null
```

因此类型中的 `T | null` 不是“为了让 TypeScript 安静”的形式要求，而是真实运行状态。若目标受
`v-if`、动态组件或异步解析控制， mounted 之后也不能永久假定非空。需要持续响应引用变化时，
watcher 的回调也必须同时处理目标和 `null` 两条路径。

**官方事实：** [访问模板引用](https://cn.vuejs.org/guide/essentials/template-refs.html#accessing-the-refs)、
[模板引用类型与 null](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-template-refs)。

### 3. 把“目标存在”和“DOM 已更新”分成两个判断

mounted 只解决首次引用可用。事件中先修改会影响目标的状态，再立即读取引用，可能仍得到旧 DOM；
此时应等待本轮 Vue DOM 更新：

```ts
visible.value = true
await nextTick()
inputElement.value?.focus()
```

不要把所有 DOM 操作都放进 `onUpdated()`。一次明确操作由触发它的事件处理函数负责，并只等待
这次状态变更，因果关系更清楚。`nextTick()` 只保证 Vue 当前 DOM flush，不保证浏览器已经绘制。

**官方事实：** [DOM 更新时机](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#dom-update-timing)、
[`nextTick()`](https://cn.vuejs.org/api/general.html#nexttick)、
[`onUpdated()` 的替代建议](https://cn.vuejs.org/api/composition-api-lifecycle.html#onupdated)。

### 4. 再从 DOM 引用过渡到组件公开实例

普通元素 ref 得到 DOM 元素；子组件 ref 得到组件公开实例。使用 `<script setup>` 的子组件默认
私有，父组件只能看到 `defineExpose()` 明确公开的成员。暴露对象中的 ref 在公开实例上自动解包。

```vue
<!-- SearchPanel.vue -->
<script setup lang="ts">
/** 清空子组件当前查询条件。 */
function clear() {
  // ...
}

defineExpose({ clear })
</script>
```

应优先暴露 `clear()`、`open()`、`focus()` 这类窄命令，而不是把可写状态和全部内部实现暴露给
父组件。若交互可以自然表达为数据向下、事件向上，仍应使用 Props 与 Emits。

**官方事实：** [组件上的 ref 与 `defineExpose()`](https://cn.vuejs.org/guide/essentials/template-refs.html#ref-on-component)、
[`defineExpose()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineexpose)。

### 5. 最后处理 v-for 与函数模板引用

Vue 3.5+ 中，位于 `v-for` 的字符串 ref 对应数组。官方明确不保证这个数组与源数组同序，因此它
适合“遍历当前所有目标”，不适合用 `itemRefs[index]` 表示某个业务实体。

需要稳定对应关系时，使用函数 ref，把业务 ID 保存在闭包中：

```vue
<script setup lang="ts">
const elementById = new Map<string, HTMLButtonElement>()

/** 按业务 ID 同步按钮引用，并在卸载时删除。 */
function setItemElement(id: string, element: Element | null) {
  if (element instanceof HTMLButtonElement) elementById.set(id, element)
  else elementById.delete(id)
}
</script>

<template>
  <button
    v-for="item in items"
    :key="item.id"
    :ref="(element) => setItemElement(item.id, element)"
  >
    {{ item.label }}
  </button>
</template>
```

函数 ref 会在组件更新时调用，目标卸载时收到 `null`。回调必须幂等，不能每次调用都追加重复
listener 或创建无法配对销毁的第三方实例。

**官方事实：** [`v-for` 中的模板引用](https://cn.vuejs.org/guide/essentials/template-refs.html#refs-inside-v-for)、
[函数模板引用](https://cn.vuejs.org/guide/essentials/template-refs.html#function-refs)。

### 6. 以条件、动态目标、类型和 SSR 收尾

- `v-if` 销毁并重建条件块，引用会回到 `null`；`v-show` 保留 DOM，只切换 `display`。
- Vue 3.5 的 `useTemplateRef()` 通过运行时字符串 ID 匹配，支持模板 `:ref` 在已登记 ID 间变化。
- 动态组件可能产生多个实例类型，应使用联合类型和成员判断；只需要公共 `$el` 时可使用
  `ComponentPublicInstance`。
- SSR 没有客户端 DOM，mounted 不在服务端执行；hydration 完成后才能执行 DOM 命令。

**官方事实：** [`v-if` 与 `v-show`](https://cn.vuejs.org/guide/essentials/conditional.html#v-if-vs-v-show)、
[Vue 3.5 `useTemplateRef()` 说明](https://blog.vuejs.org/posts/vue-3-5#usetemplateref)、
[组件模板引用类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-template-refs)、
[SSR 生命周期](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)。

## 最小核心知识

### useTemplateRef 的版本与类型

Vue 3.5 引入 `useTemplateRef()`。当前公开签名为：

```ts
function useTemplateRef<T>(key: string): Readonly<ShallowRef<T | null>>
```

它返回只读浅层 ref：使用者读取 `.value`，由 Vue 渲染器负责写入目标或 `null`。浅层意味着 Vue
只跟踪引用槽位何时换成另一个目标，不会把原生 DOM 节点或组件公开实例深度转换为响应式对象。
Vue 3.5 以前需声明与模板静态 ref 同名的普通 `ref(null)`；旧写法仍兼容，但不是本课主线。

**证据：** [`useTemplateRef()` API](https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref)、
[Vue 3.5 发布说明](https://blog.vuejs.org/posts/vue-3-5#usetemplateref)、
[`useTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useTemplateRef.ts)。

### 普通元素与组件得到不同目标

模板 ref 位于普通 DOM 元素时，值是元素本身；位于有状态子组件时，值是子组件公开实例。不要把
组件 ref 当作稳定 DOM 元素，也不要依赖子组件 `$el` 来穿透其渲染结构。需要子组件内部 DOM
能力时，由子组件暴露一个语义化命令更稳妥。

**证据：** [`ref` 特殊 attribute](https://cn.vuejs.org/api/built-in-special-attributes.html#ref)、
[组件上的 ref](https://cn.vuejs.org/guide/essentials/template-refs.html#ref-on-component)、
[`rendererTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts)。

### ref 名称是渲染契约

`useTemplateRef('search-input')` 中的 key 必须与模板实际生成的 ref ID 匹配。函数在 setup 执行时
为这个字符串 key 登记通道；把响应式值的当前快照传给 `useTemplateRef(activeKey.value)`，不会让
调用本身随后重新订阅另一个 key。

动态模板 `:ref="activeKey"` 是受支持的，但应预先取得可能 key 的句柄，或改用函数 ref：

```ts
const primaryInput = useTemplateRef<HTMLInputElement>('primary')
const secondaryInput = useTemplateRef<HTMLInputElement>('secondary')
```

当模板从 `primary` 切到 `secondary` 时，旧句柄会被清空，新句柄在渲染后指向目标。

**官方事实：** [Vue 3.5 运行时字符串 ID](https://blog.vuejs.org/posts/vue-3-5#usetemplateref)。
**源码推导：** [`useTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useTemplateRef.ts)
按调用时 key 在实例 `refs` 上定义通道；
[`rendererTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts)
在动态 ref 改名时先清空旧 ref，再设置新 ref。

### 非空赋值与清空的时机不同

固定版本渲染器会把非空模板引用的设置排到 post-render 队列，避免引用指向尚未完成渲染的目标；
卸载或旧动态 ref 的清空不延后，以免旧引用覆盖同一轮新引用。这解释了为什么 setup 期间是 null，
以及为什么状态改变后应等待 `nextTick()` 再观察最终引用。

这是固定版本实现证据，不应扩写成“所有 post-flush watcher 与 ref 回调永远有某个私有先后顺序”。

**源码与测试：**
[`rendererTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts)、
[`rendererTemplateRef.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererTemplateRef.spec.ts)。

### v-if 与 v-show 决定引用寿命

`v-if` 是真实条件渲染，切换时销毁和重建条件块，所以引用随目标移除而变为 `null`。`v-show` 始终
渲染同一元素，只修改 CSS `display`，因此通常保留同一引用。是否选择 `v-show` 仍应由语义、初始
成本和切换频率决定，不能只为逃避 null 判断而替换所有 `v-if`。

**证据：** [`v-if` 与 `v-show`](https://cn.vuejs.org/guide/essentials/conditional.html#v-if-vs-v-show)、
[访问模板引用的 null 分支](https://cn.vuejs.org/guide/essentials/template-refs.html#accessing-the-refs)。

### v-for 数组只表达当前集合

字符串 ref 位于 `v-for` 中时，引用值是数组；目标挂载时进入数组，单项卸载时从数组移除。公开
文档明确不保证其顺序与源数组一致，所以可用它批量读取当前元素，但不能把数组位置当成业务 ID。
列表本身仍应使用稳定 `:key`；当代码需要 `ID → 元素` 时改用函数 ref 和 `Map`。

**官方事实：** [`v-for` 中的模板引用](https://cn.vuejs.org/guide/essentials/template-refs.html#refs-inside-v-for)。
**源码与测试：**
[`rendererTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts)
维护数组的追加与移除；
[`useTemplateRef.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/useTemplateRef.spec.ts)
覆盖 `ref_for` 三个目标。

### 函数模板引用是回调，不是一次性 mounted hook

函数 ref 使用动态 `:ref` 绑定。Vue 在组件更新时调用它，目标卸载时传入 `null`。因此回调要允许
相同目标重复到达，并为 `null` 做对称清理。它适合定制引用存储，不适合承载“只运行一次”的
副作用；第三方实例的创建销毁仍应由明确生命周期管理。

**证据：** [函数模板引用](https://cn.vuejs.org/guide/essentials/template-refs.html#function-refs)、
[`rendererTemplateRef.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererTemplateRef.spec.ts)。

### defineExpose 定义的是公开能力边界

`<script setup>` 组件默认关闭内部绑定。`defineExpose({ reset })` 才把 `reset` 放入父级可见的公开
实例；公开对象中的 ref 会自动解包。`defineExpose()` 必须在任何 `await` 之前调用，否则 await
之后暴露的成员不可访问。

非 `<script setup>` 或 Options API 组件的默认公开面更宽，可用 `expose` 选项限制。课程只用这条
对照说明迁移风险，不鼓励父组件依赖完整 `this`。

**证据：** [组件上的 ref 与公开实例](https://cn.vuejs.org/guide/essentials/template-refs.html#ref-on-component)、
[`defineExpose()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineexpose)、
[`component.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)。

### TypeScript 推断也不能消除运行时 null

Vue 3.5 与 `@vue/language-tools` 2.1+ 可对 SFC 中的静态模板 ref 自动推断元素或组件类型。无法推断
时可传泛型：普通 DOM 使用 `HTMLInputElement` 等接口；导入组件使用
`InstanceType<typeof Child>`；动态组件使用实例联合；只依赖所有组件共有属性时使用
`ComponentPublicInstance`。泛型只描述可能目标，不证明目标此刻已挂载。

**证据：** [为模板引用标注类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-template-refs)、
[为组件模板引用标注类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-template-refs)。

### SSR 与 hydration 是两段运行环境

服务端渲染阶段没有客户端 DOM，mounted 不执行，模板引用不能用于浏览器 API。客户端 hydration
会把引用关联到已经存在并被接管的 DOM 节点；这不改变“必须等客户端挂载完成后使用”的规则。
模板 `ref` 也不会被序列化成供用户查询的普通 HTML attribute。

**官方事实：** [SSR 生命周期与平台 API](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)、
[`ref` 注册时机](https://cn.vuejs.org/api/built-in-special-attributes.html#ref)。
**官方测试：**
[`hydration.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/hydration.spec.ts)
验证 hydration 后 ref 指向现有元素且 DOM 上没有 `ref` attribute。

## Vue 3.5.40 源码与官方测试推导

以下每点都先给出固定版本事实，再给出可用于课程的推导。推导不是新的 Vue 公共 API 承诺。

### 1. useTemplateRef 在当前组件实例上建立只读浅层通道

**官方事实：** `useTemplateRef.ts` 获取当前组件实例，创建 `shallowRef(null)`，在实例 `refs` 的
指定 key 上定义 getter/setter；开发模式返回 `readonly()` 包装，并对重复 key 或无 active instance
发出警告。

**课程推导：** `useTemplateRef()` 应在 setup 的同步调用链中执行，可封装在同步调用的 composable
内；不要在事件、timer 或普通异步回调中临时调用，也不要对返回值手工赋值。

**证据：** [`useTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useTemplateRef.ts)、
[`useTemplateRef.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/useTemplateRef.spec.ts)。

### 2. 渲染器按 VNode 类型选择 DOM 元素或组件公开实例

**官方事实：** `rendererTemplateRef.ts` 对有状态组件调用 `getComponentPublicInstance()`，其他普通
目标使用 `vnode.el`。

**课程推导：** 父组件不应假定“ref 总是 HTMLElement”。把同一动态 ref 用在元素和组件之间会
得到不同形状，应拆分名称或显式使用联合类型与运行时判断。

**证据：** [`rendererTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts)。

### 3. 非空引用后置，卸载清空即时

**官方事实：** 非空设置被包装成 `SchedulerJob` 并交给 `queuePostRenderEffect()`；值为 null 的卸载
路径立即执行。动态旧 ref 也先被清空。

**课程推导：** 一次事件若同时创建目标并立刻操作它，应修改状态后 `await nextTick()`；不要靠
可选链悄悄跳过本应执行的命令，因为那只会把时机错误变成无动作。

**证据：** [`rendererTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts)、
[`rendererTemplateRef.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererTemplateRef.spec.ts)。

### 4. 动态字符串 ref 会清空旧 ID，再写入新 ID

**官方事实：** 官方测试把同一元素的字符串 ref 从 `foo` 改为 `bar`，flush 后断言 `foo` 为 null、
`bar` 指向元素。

**课程推导：** 动态 ID 适合在少量已知通道间切换；若 key 集合来自任意业务数据，函数 ref 与
`Map` 更清晰，不必为每个运行时 key 调用一次 helper。

**证据：** [`rendererTemplateRef.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererTemplateRef.spec.ts)、
[Vue 3.5 发布说明](https://blog.vuejs.org/posts/vue-3-5#usetemplateref)。

### 5. v-for 引用数组按实际挂载和卸载维护

**官方事实：** `ref_for` 分支首次创建数组，非重复目标追加，卸载时移除具体 `refValue`；官方测试
验证三个目标进入数组。公开指南同时明确数组顺序不保证与源数组一致。

**课程推导：** 可以用数组长度验证“当前挂载数量”，但不能测试或业务绑定精确索引顺序；需要
身份时使用稳定 `:key` 加函数 ref Map。

**证据：** [`rendererTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts)、
[`useTemplateRef.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/useTemplateRef.spec.ts)、
[`v-for` 引用指南](https://cn.vuejs.org/guide/essentials/template-refs.html#refs-inside-v-for)。

### 6. 函数引用由渲染器直接调用

**官方事实：** 函数 ref 不写入实例 `refs` 字典，而由错误处理边界直接调用；官方测试覆盖首次
传元素、更新时调用当前函数，以及卸载时传 null。

**课程推导：** 回调只做引用登记和删除，保持快速、幂等；listener、observer 或第三方实例放在
明确的 mounted/unmounted 管理流程，不把函数 ref 当成副作用生命周期替代品。

**证据：** [`rendererTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts)、
[`rendererTemplateRef.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererTemplateRef.spec.ts)。

### 7. 公开实例代理会解包 defineExpose 中的 ref

**官方事实：** `getComponentPublicInstance()` 对 `instance.exposed` 创建带 `proxyRefs()` 的代理，并
保留 `$el` 等公共属性入口；官方文档明确公开 ref 在父组件看到时自动解包。

**课程推导：** 暴露一个可写 ref 会让父级容易绕过组件规则修改内部状态。更稳妥的公开面是窄
命令方法，内部 ref 保持私有。

**证据：** [`component.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)、
[`defineExpose()` 文档](https://cn.vuejs.org/api/sfc-script-setup.html#defineexpose)。

### 8. hydration 把引用绑定到已存在的 DOM

**官方事实：** hydration 官方测试先放入服务端 HTML，再挂载 `createSSRApp()`；最终 ref 指向原
容器首节点，同时元素没有 `ref` HTML attribute。

**课程推导：** SSR 输出中的节点“已经看得见”不代表 setup 中已有模板引用。DOM 增强逻辑仍应
从客户端 mounted 开始，并允许页面由纯客户端导航再次创建同一组件。

**证据：** [`hydration.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/hydration.spec.ts)、
[SSR 生命周期](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)。

## 高质量常见易错点

### 1. 在 setup、SSR 或 v-if 卸载后直接解引用

**错误假设：** 声明 `useTemplateRef()` 后 `.value` 立刻就是目标，并且 mounted 后永不再为空。

```ts
const input = useTemplateRef<HTMLInputElement>('input')
input.value.focus()
```

**后果：** 首次 setup、SSR、条件尚未成立或目标卸载时抛出 null 访问错误。

```ts
const input = useTemplateRef<HTMLInputElement>('input')

onMounted(() => {
  input.value?.focus()
})
```

持续条件变化时仍需保留空值判断；不要用非空断言掩盖真实生命周期。

**证据：** [访问模板引用](https://cn.vuejs.org/guide/essentials/template-refs.html#accessing-the-refs)、
[SSR 生命周期](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)。

### 2. 创建目标后不等 DOM flush 就执行命令

**错误假设：** `visible.value = true` 会同步创建 DOM 并同步填充模板引用。

```ts
visible.value = true
input.value?.focus() // 此刻可能仍为 null，因此命令被静默跳过
```

**后果：** 按钮看似显示了输入框，但焦点、滚动或测量偶发不生效。

```ts
/** 显示输入框并在本轮 DOM 更新后聚焦。 */
async function showAndFocus() {
  visible.value = true
  await nextTick()
  input.value?.focus()
}
```

**证据：** [DOM 更新时机](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#dom-update-timing)、
[`nextTick()`](https://cn.vuejs.org/api/general.html#nexttick)。

### 3. 把 ref 当成真实 HTML attribute

**错误假设：** `<input ref="search">` 会在 DOM 中留下 `ref="search"`，可以被 CSS 或
`querySelector('[ref="search"]')` 使用。

```ts
const input = document.querySelector('[ref="search"]')
```

**后果：** 查询为空；样式选择器不生效；测试依赖了 Vue 不会输出的实现标记。

```ts
const input = useTemplateRef<HTMLInputElement>('search')
```

若真正需要 DOM 标识，应单独使用 `id`、`data-*` 或语义化选择器，不复用模板 ref 名称。

**证据：** [`ref` 特殊 attribute](https://cn.vuejs.org/api/built-in-special-attributes.html#ref)、
[`hydration.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/hydration.spec.ts)。

### 4. 名称不匹配，或误以为 useTemplateRef 参数会响应式变化

**错误假设：** helper 的 key 可以与模板名字不同，或传入 `activeKey.value` 后会自动随 ref 改变。

```ts
const activeKey = ref('primary')
const input = useTemplateRef<HTMLInputElement>(activeKey.value)

// 后续 activeKey.value = 'secondary' 不会重新执行上面的 helper
```

**后果：** 引用长期为 null，或仍只登记初次 key 的通道。

```ts
const primary = useTemplateRef<HTMLInputElement>('primary')
const secondary = useTemplateRef<HTMLInputElement>('secondary')
```

模板可用 `:ref="activeKey"` 在两个已知 ID 间切换；任意业务 ID 集合则使用函数 ref Map。

**证据：** [Vue 3.5 运行时字符串 ID](https://blog.vuejs.org/posts/vue-3-5#usetemplateref)、
[`useTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useTemplateRef.ts)。

### 5. 手工给 useTemplateRef 的 value 赋值

**错误假设：** 它和业务 `ref()` 一样由调用方维护。

```ts
const input = useTemplateRef<HTMLInputElement>('input')
input.value = document.createElement('input')
```

**后果：** TypeScript 拒绝写入；开发模式 readonly 警告；即使绕过类型，后续渲染仍会覆盖值。

```ts
const input = useTemplateRef<HTMLInputElement>('input')
// 只读取 input.value，由模板挂载状态决定它的值
```

需要自行维护的业务引用应使用普通 `ref()` 或非响应式变量，不要伪造模板所有权。

**证据：** [`useTemplateRef()` 返回类型](https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref)、
[`useTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useTemplateRef.ts)。

### 6. 用 v-for 数据索引访问 ref 数组

**错误假设：** `itemRefs.value[index]` 永远对应 `items.value[index]`。

```ts
/** 按数组索引聚焦业务项。 */
function focusItem(index: number) {
  itemRefs.value?.[index]?.focus()
}
```

**后果：** 列表移动、插入或删除后可能操作错误元素；代码把未承诺的顺序当作身份契约。

```ts
const elementById = new Map<string, HTMLButtonElement>()

/** 按稳定业务 ID 聚焦。 */
function focusItem(id: string) {
  elementById.get(id)?.focus()
}
```

**证据：** [`v-for` 引用数组顺序不保证](https://cn.vuejs.org/guide/essentials/template-refs.html#refs-inside-v-for)。

### 7. 函数 ref 只追加，不处理重复调用与 null

**错误假设：** 函数 ref 只在首次挂载调用一次，并且参数永远是 Element。

```vue
<button :ref="(element) => elements.push(element)">项目</button>
```

**后果：** 更新后数组重复增长；卸载后仍保存脱离 DOM 的旧元素；若直接创建 listener 或第三方
实例，还会重复注册资源。

```ts
const elementById = new Map<string, HTMLButtonElement>()

/** 幂等登记元素，并在 null 路径删除。 */
function setElement(id: string, element: Element | null) {
  if (element instanceof HTMLButtonElement) elementById.set(id, element)
  else elementById.delete(id)
}
```

**证据：** [函数模板引用](https://cn.vuejs.org/guide/essentials/template-refs.html#function-refs)、
[`rendererTemplateRef.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererTemplateRef.spec.ts)。

### 8. 把 script setup 子组件当成默认公开全部内部状态

**错误假设：** 拿到组件实例就能直接访问子组件中的任意变量和方法。

```vue
<!-- Child.vue 没有 defineExpose -->
<script setup lang="ts">
/** 重置内部状态。 */
function reset() {}
</script>
```

**后果：** 父组件实例存在，但 `reset` 是 undefined；随后为了绕过问题而读取 `$el` 或内部实现，
造成更强耦合。

```vue
<script setup lang="ts">
/** 重置内部状态。 */
function reset() {}

defineExpose({ reset })
</script>
```

即使可以 expose，也应先判断 Props/Emits 是否更符合数据流。

**证据：** [组件上的 ref](https://cn.vuejs.org/guide/essentials/template-refs.html#ref-on-component)、
[`defineExpose()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineexpose)。

### 9. 在 await 后 defineExpose，或暴露整个内部状态

**错误假设：** `defineExpose()` 可以等异步初始化结束再调用；暴露越多越方便。

```ts
await loadInitialState()
defineExpose({ formState, reset, submit })
```

**后果：** await 后的成员无法由父组件访问；公开可写状态让父级绕过子组件校验和事件契约。

```ts
defineExpose({ reset })
await loadInitialState()
```

只公开父级确实需要的命令，并在任何 await 前定义公开面。

**证据：** [`defineExpose()` 调用时机](https://cn.vuejs.org/guide/essentials/template-refs.html#ref-on-component)、
[`component.ts` 公开实例代理](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)。

### 10. 把动态组件引用标成单一固定实例

**错误假设：** `<component :is="current">` 无论当前组件是谁，都具有同一组自定义方法。

```ts
type FooInstance = InstanceType<typeof FooPanel>
const panel = useTemplateRef<FooInstance>('panel')
```

**后果：** 切到 BarPanel 后类型仍声称存在 Foo 方法，运行时调用 undefined。

```ts
type PanelInstance = InstanceType<typeof FooPanel> | InstanceType<typeof BarPanel>
const panel = useTemplateRef<PanelInstance>('panel')

/** 仅在目标公开该命令时调用。 */
function resetPanel() {
  if (panel.value && 'reset' in panel.value) panel.value.reset()
}
```

若只需要所有组件共有的 `$el`，可使用官方提供的 `ComponentPublicInstance` 类型。

**证据：** [动态组件模板引用类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-template-refs)。

## 源码推导出的适用场景与高级用法

### 1. 表单校验失败后显示并聚焦第一个无效字段

先更新错误状态，使受 `v-if` 控制的错误字段或输入框进入渲染树，再 `await nextTick()` 聚焦。该
模式把“业务状态变更”和“DOM 命令”保留在同一事件流程，优于监听所有组件更新。

**推导依据：** 非空引用后置写入与 nextTick DOM flush。
[源码](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts)；
[官方更新时机](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#dom-update-timing)。

### 2. 一次动作后的滚动定位或尺寸读取

折叠面板展开、结果列表刷新或错误提示插入后，在触发动作中等待 `nextTick()`，再通过 DOM ref 调用
`scrollIntoView()` 或读取布局。若需要浏览器绘制完成、图片尺寸或动画结束，还必须等待对应浏览器
信号，不能继续叠加 `nextTick()` 猜测。

**推导依据：** [`nextTick()`](https://cn.vuejs.org/api/general.html#nexttick) 只等待 Vue DOM 更新；
模板引用在 post-render 设置。
[源码](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts)。

### 3. 由组件拥有第三方 DOM 实例

图表、编辑器或观察器应由渲染该容器的组件创建和销毁：mounted 时从模板 ref 取得容器，unmounted
时释放第三方实例。若容器使用 `v-if` 动态存在，还需把创建/销毁与引用 null 变化配对；若使用
`v-show`，DOM 引用通常持续存在，但可见性语义仍需由第三方库自行处理。

**推导依据：** [`v-if` / `v-show`](https://cn.vuejs.org/guide/essentials/conditional.html#v-if-vs-v-show)、
[生命周期资源清理](https://cn.vuejs.org/api/composition-api-lifecycle.html#onunmounted)。

### 4. 用业务 ID Map 管理可变列表目标

虚拟键盘、批量校验或可访问性 roving focus 需要按业务实体取得元素时，函数 ref Map 比数组索引
可靠。回调的 null 分支删除已卸载条目，Map 的 key 使用与列表 `:key` 相同的稳定 ID。

**推导依据：** 官方不保证 v-for ref 数组顺序，函数 ref 卸载时收到 null。
[官方指南](https://cn.vuejs.org/guide/essentials/template-refs.html#refs-inside-v-for)；
[源码](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts)。

### 5. 为对话框、表单或播放器公开窄命令

父级确实需要发出 `open()`、`reset()`、`focus()` 等命令时，子组件用 `defineExpose()` 公开方法，
状态仍由子组件私有。这样父级依赖的是语义化能力，不是子组件 DOM 结构或可写 ref。

**推导依据：** 公开实例代理只呈现 exposed 成员并自动解包 ref；官方仍建议优先 Props/Emits。
[源码](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)；
[官方指南](https://cn.vuejs.org/guide/essentials/template-refs.html#ref-on-component)。

### 6. 在少量已知动态 ID 间切换同一 DOM 目标

需要观察“当前角色”时，可为 `primary`、`secondary` 等有限 ID 分别调用 `useTemplateRef()`，模板
用动态 `:ref` 切换。旧句柄清空、新句柄指向同一 DOM。任意数量的运行时业务 ID 不适合这一模式，
应改用函数 ref Map。

**推导依据：** Vue 3.5 使用运行时字符串 ID，renderer 在 ref 改名时清空旧值。
[发布说明](https://blog.vuejs.org/posts/vue-3-5#usetemplateref)；
[官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererTemplateRef.spec.ts)。

### 7. 为动态组件定义共同公开协议

若多个动态面板都支持 `reset()`，可以让它们分别 `defineExpose({ reset })`，父级用联合类型或项目
内显式 `ResettablePanel` 协议描述共同命令，并在调用前保留 null 判断。若组件能力不同，则用成员
判断分支，不能靠类型断言伪造一致性。

**推导依据：** 动态组件类型需要联合，组件公开面由 defineExpose 控制。
[TypeScript 官方指南](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-template-refs)；
[`defineExpose()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineexpose)。

### 8. 在 SSR 页面做客户端渐进增强

服务端先输出可读 HTML，客户端 hydration 后在 mounted 中通过模板 ref 加入聚焦、测量或第三方
交互。代码不能用 setup 阶段的 null ref 决定服务端 HTML，也不能把模板 ref 名称当成序列化选择器。

**推导依据：** hydration 测试把 ref 绑定到既有 DOM 且不输出 ref attribute。
[官方测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/hydration.spec.ts)；
[SSR 官方指南](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)。

## 单一同源 Demo 冻结

### 名称、ID 与主命题

唯一 Demo 命名为“模板引用实验台”，精确资产 ID：

`vue.core.learn.intermediate.template-refs.template-ref-lab-demo`

它只验证一个主命题：**模板引用由真实渲染目标的生命周期驱动；一次状态变更后需等待 DOM flush，
组件引用只调用显式公开命令，动态列表通过函数 ref Map 和稳定业务 ID 定位元素。**

### 文件结构与同源约束

```text
src/content/demos/vue/core/learn/intermediate/template-refs/
├─ template-ref-lab-demo.vue
└─ parts/
   └─ ExposedSearchPanel.vue
```

- `template-ref-lab-demo.vue` 是唯一公开 Demo ID、运行入口和 raw source 面板来源。
- `ExposedSearchPanel.vue` 是私有真实子 SFC，只通过 `defineExpose()` 暴露 `clearAndFocus()`。
- 私有子组件不注册第二个 Demo ID，不复制成父文件内的伪组件，不新增多文件源码查看器。
- 当前 registry 按约定发现父 Demo；实现不修改 registry 或 schema。

### 状态与引用

父 Demo 保留：

- `domInputVisible = true`：控制 `v-if` 输入框是否真实存在。
- `domInput = useTemplateRef<HTMLInputElement>('dom-input')`：DOM 引用。
- `domReferenceStatus`：显示引用当前为 `null` 或 `HTMLInputElement`。
- `searchPanel = useTemplateRef<ExposedSearchPanelApi>('search-panel')`：只调用子组件公开命令。
- `模板 / API / 源码` 三个带稳定业务 ID 的列表项，以及按 ID 保存按钮的 `topicButtons` Map。
- `focusedTopic`：发布按 ID 聚焦后的可读结果，不在函数 ref 回调中制造更新循环。

Demo 保持 DOM 引用、组件公开命令和列表函数引用三条可验证路径。函数 ref Map 只承担动态元素的
业务 ID 索引，不复制列表状态，也不依赖渲染后的元素顺序。

### 必须可验证的交互

1. 初始输入框存在，状态显示 `引用状态：HTMLInputElement`；点击“聚焦输入框”后它成为
   `document.activeElement`。
2. 点击“隐藏输入框”后等待 `nextTick()`，输入框从 DOM 消失，状态显示 `引用状态：null`。
3. 点击“显示输入框”后等待 `nextTick()`，输入框重新出现且状态恢复为 `HTMLInputElement`；随后可
   通过“聚焦输入框”验证 DOM 引用。
4. 子组件输入框先写入内容；父级“调用子组件公开命令”只通过组件 ref 调用 `clearAndFocus()`，
   输入值清空并获得焦点。
5. `ExposedSearchPanel` 不公开内部 `searchTerm`、DOM 节点或 `$el`，父 Demo 不直接读写子状态。
6. 列表初始显示 `模板 / API / 源码`，函数 ref 按各自稳定业务 ID 登记按钮元素。
7. 点击“轮换列表顺序”后，列表位置改变；再点击“按 ID 聚焦 API”，仍准确聚焦 `API` 并显示
   `当前聚焦：API`。
8. 每条操作发布明确文字结果；不显示伪造时间戳，不用颜色作为唯一状态信号。

Demo 不使用 `onUpdated()`、watcher、动态 ref ID、动态组件、异步组件、KeepAlive、Suspense、
Teleport、Transition、第三方库、SSR 模拟、timer 或远程请求。

### 布局与可访问性约束

- 390px 下严格单列；宽屏使用 flex 与 margin 排列，不使用 CSS Grid 或 `gap`。
- flex 子项设置 `min-width: 0`，长类型名和状态文案允许换行，不产生页面级横向滚动。
- 所有操作使用原生 `<button type="button">`，最小触控高度 44px，按钮文案完整可见。
- 输入框有可见 `<label>`；聚焦结果由真实 focus 和文字状态共同表达。
- 状态区可使用 `aria-live="polite"`，一次操作只更新一次，避免重复播报。
- 隐藏已聚焦输入框后，不强制把焦点送到不可见元素；重新显示后由独立聚焦命令转移焦点。
- 父级命令使用“调用子组件公开命令”，与子组件输入框名称明确区分所有者。
- 200% 文本缩放和 390px 宽度下内容不截断，`.demo-box .missing` 必须为 `0`。

## 建议 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.template-refs',
  type: 'lesson',
  title: '模板引用',
  summary: '在正确的渲染时机访问 DOM 元素与子组件公开实例，并处理条件和列表引用',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.lifecycle-update-timing'],
  related: [
    'vue.core.learn.intermediate.lifecycle-update-timing',
    'vue.core.reference.composition.template-refs',
    'vue.core.reference.components.props',
    'vue.core.reference.components.emits',
  ],
  tags: ['模板引用', 'useTemplateRef', 'defineExpose', 'v-for', 'DOM', '组件实例'],
  sources: [
    {
      title: 'Vue 模板引用指南',
      url: 'https://cn.vuejs.org/guide/essentials/template-refs.html',
    },
    {
      title: 'Vue useTemplateRef',
      url: 'https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref',
    },
    {
      title: 'Vue ref 特殊 attribute',
      url: 'https://cn.vuejs.org/api/built-in-special-attributes.html#ref',
    },
    {
      title: 'Vue TypeScript 模板引用',
      url: 'https://cn.vuejs.org/guide/typescript/composition-api.html#typing-template-refs',
    },
    {
      title: 'Vue SSR 生命周期',
      url: 'https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks',
    },
    {
      title: 'Vue 3.5.40 useTemplateRef.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useTemplateRef.ts',
    },
    {
      title: 'Vue 3.5.40 rendererTemplateRef.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts',
    },
    {
      title: 'Vue 3.5.40 template ref tests',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererTemplateRef.spec.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-31',
  estimatedMinutes: 50,
})
```

上述 prerequisite 与四个 related ID 已与当前 manifest 测试冻结值一致。不要新增尚未上线的 Slots
课程为 related，也不要把完整动态组件、SSR 或 TypeScript 工程化课程设成直接前置。

## 后续实施范围建议

后续实现可限定为：

- `src/content/entries/learn/vue/core/intermediate/template-refs.ts`
- `src/content/demos/vue/core/learn/intermediate/template-refs/template-ref-lab-demo.vue`
- `src/content/demos/vue/core/learn/intermediate/template-refs/parts/ExposedSearchPanel.vue`
- `src/content/catalog/manifests/vue-core-track.ts`
- `src/content/catalog/vue-core-track.spec.ts`
- `src/content/interactive/registry.spec.ts`
- `tests/e2e/progress.spec.ts`
- `docs/重构实施计划.md`

不需要修改 schema、Demo registry 实现、现有 template-refs reference、全局样式或其他课程。实现时只把
本课从 planned 改为 available；不能同时开始下一课 Slots，也不能把本课完成写成 Vue Core 中级或
Gate 6 关闭。

最小验证只需覆盖：课程位置与唯一 prerequisite、四个 related ID 可解析、新 Demo ID 可解析、
`null / HTMLInputElement` 状态、显示后经 `nextTick()` 更新并可聚焦、`clearAndFocus()` 清空并聚焦、
列表轮换后按 ID 聚焦 `API`、390px 无横向滚动。不要为十个易错点分别添加测试。

## 固定来源清单

### Vue 官方文档与发布说明

- [Vue 模板引用指南](https://cn.vuejs.org/guide/essentials/template-refs.html)：访问时机、null、
  组件公开实例、`defineExpose()`、`v-for` 数组顺序和函数 ref。
- [`useTemplateRef()` API](https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref)：
  `Readonly<ShallowRef<T | null>>` 公开签名。
- [Vue 3.5 发布说明](https://blog.vuejs.org/posts/vue-3-5#usetemplateref)：引入版本、旧静态命名约定、
  运行时字符串 ID 和 language-tools 支持。
- [`ref` 特殊 attribute](https://cn.vuejs.org/api/built-in-special-attributes.html#ref)：DOM/组件目标、
  函数 ref、注册时机及 Options API `$refs` 非响应式边界。
- [`defineExpose()`](https://cn.vuejs.org/api/sfc-script-setup.html#defineexpose)：`<script setup>` 默认关闭、
  显式公开和 ref 自动解包。
- [为模板引用标注类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-template-refs)：
  Vue 3.5 + language-tools 2.1 自动推断、显式 DOM 泛型和 null。
- [为组件模板引用标注类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-template-refs)：
  `InstanceType`、动态组件联合、`ComponentPublicInstance` 与泛型组件入口。
- [`v-if` 与 `v-show`](https://cn.vuejs.org/guide/essentials/conditional.html#v-if-vs-v-show)：销毁重建
  与保留 DOM 的差异。
- [DOM 更新时机](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html#dom-update-timing)：
  状态更新后等待 nextTick。
- [SSR 生命周期](https://cn.vuejs.org/guide/scaling-up/ssr.html#component-lifecycle-hooks)：服务端无
  mounted/update hooks 及浏览器 API 的客户端边界。

### vuejs/core v3.5.40

- [`packages/runtime-core/src/helpers/useTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/useTemplateRef.ts)：
  shallowRef、当前实例 `refs` 通道、readonly、重复 key 与无实例警告。
- [`packages/runtime-core/src/rendererTemplateRef.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/rendererTemplateRef.ts)：
  DOM/组件目标选择、动态旧 ref 清空、函数调用、`ref_for` 数组和 post-render 设置。
- [`packages/runtime-core/src/component.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)：
  exposed 对象、`proxyRefs()` 和组件公开实例代理。
- [`packages/runtime-core/src/componentPublicInstance.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentPublicInstance.ts)：
  `$refs`、`$el` 与公共属性映射。
- [`packages/runtime-core/__tests__/helpers/useTemplateRef.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/helpers/useTemplateRef.spec.ts)：
  helper 通道、readonly、direct ref、动态目标和 `ref_for` 回归。
- [`packages/runtime-core/__tests__/rendererTemplateRef.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/rendererTemplateRef.spec.ts)：
  字符串 ref 挂载/改名/卸载、函数 ref 和列表引用回归。
- [`packages/runtime-core/__tests__/hydration.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/hydration.spec.ts)：
  hydration 后引用既有 DOM 且不输出 ref attribute。
- [`packages/compiler-sfc/__tests__/compileScript/defineExpose.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/compiler-sfc/__tests__/compileScript/defineExpose.spec.ts)：
  `defineExpose()` 编译为 setup context 的 expose 调用。

## 结论

本课应把模板引用教成“由渲染器维护的短生命周期能力”，而不是绕过 Vue 数据流的通用入口。
新手首先掌握 DOM ref 的 null 时间线和 `nextTick()`，再学习组件公开实例、列表与函数 ref，最后才
识别动态目标、类型和 SSR 边界。

最值得转化为教学判断的固定版本证据是：`useTemplateRef()` 只建立 shallow ref 通道；渲染器按
VNode 选择 DOM 或公开实例；非空引用在渲染后写入，卸载会及时清空；`v-for` 数组按实际目标维护
但不承诺业务顺序；exposed ref 会在公开实例代理上解包；hydration 才把引用连接到客户端 DOM。

唯一“模板引用实验台”用 DOM 引用的 null 时间线、组件公开 `clearAndFocus()`、列表轮换后按 ID
聚焦 `API` 三条路径验证核心契约。动态 ID、动态组件和 SSR 保留为正文中的高质量推导，不把
Demo 扩成多个高级主题。
